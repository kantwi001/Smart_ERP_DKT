from rest_framework import serializers
from .models import Category, Product, InventoryTransfer, ProductPrice

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductPrice
        fields = ['id', 'product', 'currency', 'price']

class ProductSerializer(serializers.ModelSerializer):
    prices = ProductPriceSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class InventoryTransferSerializer(serializers.ModelSerializer):
    requested_by = serializers.StringRelatedField(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = InventoryTransfer
        fields = '__all__'
        read_only_fields = ['requested_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Automatically set the requested_by field to the current user
        validated_data['requested_by'] = self.context['request'].user
        # Set initial status to pending for approval workflow
        validated_data['status'] = 'pending'
        return super().create(validated_data)
