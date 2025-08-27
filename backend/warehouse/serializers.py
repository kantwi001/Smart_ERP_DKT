from rest_framework import serializers
from .models import Warehouse, WarehouseLocation, StockMovement, WarehouseTransfer
from users.serializers import UserSerializer
from inventory.models import Product

class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True)
    location_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = ['id', 'name', 'code', 'address', 'manager', 'manager_name', 'capacity', 'is_active', 'location_count', 'created_at', 'updated_at']
    
    def get_location_count(self, obj):
        return obj.locations.filter(is_active=True).count()

class WarehouseLocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    
    class Meta:
        model = WarehouseLocation
        fields = ['id', 'warehouse', 'warehouse_name', 'name', 'code', 'aisle', 'shelf', 'bin', 'is_active', 'created_at']

class WarehouseTransferSerializer(serializers.ModelSerializer):
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True)
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    requested_by_name = serializers.CharField(source='requested_by.username', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.username', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = WarehouseTransfer
        fields = [
            'id', 'transfer_number', 'from_warehouse', 'from_warehouse_name', 
            'to_warehouse', 'to_warehouse_name', 'product', 'product_name', 'product_sku',
            'quantity', 'status', 'status_display', 'priority', 'priority_display',
            'requested_by', 'requested_by_name', 'request_date', 'request_notes', 'expected_delivery_date',
            'approved_by', 'approved_by_name', 'approval_date', 'approval_notes',
            'completed_by', 'completed_by_name', 'completion_date', 
            'actual_quantity_sent', 'actual_quantity_received',
            'waybill_number', 'tracking_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['transfer_number', 'request_date', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['requested_by'] = self.context['request'].user
        return super().create(validated_data)

class StockMovementSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    location_name = serializers.CharField(source='location.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = ['id', 'warehouse', 'warehouse_name', 'location', 'location_name', 'movement_type', 'quantity', 'reference', 'notes', 'created_by', 'created_by_name', 'created_at']
        read_only_fields = ['created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
