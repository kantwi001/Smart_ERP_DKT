from rest_framework import serializers
from django.db import models
from .models import Customer, Sale, CustomerApproval, Quote, Lead, Promotion, PromotionProduct, SalesOrder, SalesOrderItem, FinanceTransaction, Payment
from users.models import User
from decimal import Decimal

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
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('staff', 'date')
    
    def create(self, validated_data):
        # Auto-set the creating user as staff
        validated_data['staff'] = self.context['request'].user
        return super().create(validated_data)

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

class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    
    class Meta:
        model = SalesOrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'line_total']
        read_only_fields = ['line_total']

class PaymentSerializer(serializers.ModelSerializer):
    sales_order_number = serializers.CharField(source='sales_order.order_number', read_only=True)
    customer_name = serializers.CharField(source='sales_order.customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payment_number', 'created_by', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def get_attachment_url(self, obj):
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
        return None
    
    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, required=False)
    payments = PaymentSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    sales_agent_name = serializers.CharField(source='sales_agent.get_full_name', read_only=True)
    sales_agent_email = serializers.CharField(source='sales_agent.email', read_only=True)
    sales_agent = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    total_paid = serializers.SerializerMethodField()
    balance_due = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ['order_number', 'created_at', 'updated_at', 'confirmed_at']
    
    def get_total_paid(self, obj):
        """Calculate total amount paid for this order"""
        total = obj.payments.filter(status='completed').aggregate(
            total=models.Sum('amount')
        ).get('total')
        return total or Decimal('0.00')
    
    def get_balance_due(self, obj):
        """Calculate remaining balance due"""
        total_paid = self.get_total_paid(obj)
        return obj.total - total_paid
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Set sales_agent to current user if not provided or null
        if 'sales_agent' not in validated_data or validated_data.get('sales_agent') is None:
            validated_data['sales_agent'] = self.context['request'].user
        
        sales_order = SalesOrder.objects.create(**validated_data)
        
        # Create order items and deduct stock
        try:
            from inventory.models import Product, StockMovement
            
            for item_data in items_data:
                # Create the order item
                order_item = SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
                
                # Deduct stock from inventory
                try:
                    product = Product.objects.get(id=item_data['product'].id)
                    if product.quantity >= item_data['quantity']:
                        product.quantity -= item_data['quantity']
                        product.save()
                        
                        # Log stock movement
                        StockMovement.objects.create(
                            product=product,
                            movement_type='out',
                            quantity=item_data['quantity'],
                            reference_number=sales_order.order_number,
                            notes=f"Stock deducted for sales order {sales_order.order_number}",
                            created_by=self.context['request'].user
                        )
                    else:
                        # If insufficient stock, still create the order but log a warning
                        print(f"Warning: Insufficient stock for product {product.name}. Available: {product.quantity}, Required: {item_data['quantity']}")
                        
                except Product.DoesNotExist:
                    print(f"Warning: Product with ID {item_data['product'].id} not found for stock deduction")
                except Exception as e:
                    print(f"Warning: Error processing stock for product {item_data.get('product', 'Unknown')}: {e}")
        
        except ImportError:
            print("Warning: Inventory models not available, skipping stock deduction")
        except Exception as e:
            print(f"Warning: Error in stock processing: {e}")
        
        # Create finance transaction for receivables if credit sale
        try:
            if sales_order.payment_method == 'credit':
                FinanceTransaction.objects.create(
                    sales_order=sales_order,
                    customer=sales_order.customer,
                    transaction_type='receivable',
                    amount=sales_order.total,
                    due_date=sales_order.due_date,
                    created_by=self.context['request'].user,
                    description=f"Accounts receivable for order {sales_order.order_number}"
                )
        except Exception as e:
            print(f"Warning: Error creating finance transaction: {e}")
        
        return sales_order

class FinanceTransactionSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = FinanceTransaction
        fields = '__all__'
        read_only_fields = ['transaction_number', 'created_by', 'approved_by', 'approved_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Set created_by to current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
