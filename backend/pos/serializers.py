from rest_framework import serializers
from .models import POSSession, Sale

class POSSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSSession
        fields = '__all__'

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    staff_name = serializers.CharField(source='staff.username', read_only=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'product', 'product_name', 'product_sku', 
            'customer', 'customer_name', 'staff', 'staff_name',
            'quantity', 'unit_price', 'total', 'payment_method', 
            'currency', 'date', 'notes', 'session'
        ]
        read_only_fields = ['id', 'date', 'product_name', 'product_sku', 'customer_name', 'staff_name']
