from rest_framework import serializers
from .models import Customer, Sale, CustomerApproval, Quote, Lead, Promotion, PromotionProduct

class CustomerSerializer(serializers.ModelSerializer):
    aging = serializers.SerializerMethodField()
    is_blacklisted = serializers.BooleanField(read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'
        extra_fields = ['aging', 'is_blacklisted']

    def get_aging(self, obj):
        from django.utils import timezone
        unpaid_sales = obj.sale_set.filter(status__in=['pending','unpaid']).order_by('date')
        if unpaid_sales.exists():
            oldest = unpaid_sales.first().date
            return (timezone.now() - oldest).days
        return 0

class CustomerApprovalSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    
    class Meta:
        model = CustomerApproval
        fields = '__all__'
        read_only_fields = ('requested_by', 'approved_by', 'approved_at', 'customer')
    
    def create(self, validated_data):
        # Auto-set the requesting user
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)

class CustomerApprovalActionSerializer(serializers.Serializer):
    """
    Serializer for approving/rejecting customer requests
    """
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    approved_customer_type = serializers.ChoiceField(
        choices=CustomerApproval.CUSTOMER_TYPE_CHOICES,
        required=False,
        help_text='Customer type to set when approving (required for approval)'
    )
    rejection_reason = serializers.CharField(
        required=False,
        help_text='Reason for rejection (required for rejection)'
    )
    
    def validate(self, data):
        if data['action'] == 'approve' and not data.get('approved_customer_type'):
            raise serializers.ValidationError({
                'approved_customer_type': 'Customer type is required when approving a customer request.'
            })
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting a customer request.'
            })
        return data

class QuoteSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Quote
        fields = '__all__'
        read_only_fields = ('created_by', 'total_amount')
    
    def create(self, validated_data):
        # Auto-set the creating user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('created_by',)
    
    def create(self, validated_data):
        # Auto-set the creating user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class PromotionProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = PromotionProduct
        fields = '__all__'
        read_only_fields = ('discount_amount',)

class PromotionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    product_pricing = PromotionProductSerializer(many=True, required=False)
    applicable_products_details = serializers.SerializerMethodField()
    is_currently_active = serializers.SerializerMethodField()
    
    class Meta:
        model = Promotion
        fields = '__all__'
        read_only_fields = ('created_by',)
    
    def get_applicable_products_details(self, obj):
        """Get details of applicable products"""
        if obj.apply_to_all:
            return "All products"
        products = obj.applicable_products.all()
        return [{"id": p.id, "name": p.name, "sku": p.sku} for p in products]
    
    def get_is_currently_active(self, obj):
        """Check if promotion is currently active"""
        return obj.is_active()
    
    def create(self, validated_data):
        # Extract product pricing data
        product_pricing_data = validated_data.pop('product_pricing', [])
        applicable_products_data = validated_data.pop('applicable_products', [])
        
        # Auto-set the creating user
        validated_data['created_by'] = self.context['request'].user
        
        # Create promotion
        promotion = Promotion.objects.create(**validated_data)
        
        # Add applicable products
        if applicable_products_data:
            promotion.applicable_products.set(applicable_products_data)
        
        # Create product pricing entries
        for pricing_data in product_pricing_data:
            PromotionProduct.objects.create(promotion=promotion, **pricing_data)
        
        return promotion
    
    def update(self, instance, validated_data):
        # Extract product pricing data
        product_pricing_data = validated_data.pop('product_pricing', [])
        applicable_products_data = validated_data.pop('applicable_products', [])
        
        # Update promotion fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update applicable products
        if applicable_products_data is not None:
            instance.applicable_products.set(applicable_products_data)
        
        # Update product pricing
        if product_pricing_data is not None:
            # Clear existing pricing
            instance.product_pricing.all().delete()
            # Create new pricing entries
            for pricing_data in product_pricing_data:
                PromotionProduct.objects.create(promotion=instance, **pricing_data)
        
        return instance
