from rest_framework import serializers
from .models import Customer, Sale, CustomerApproval, Quote, Lead

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
