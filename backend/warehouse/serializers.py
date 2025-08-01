from rest_framework import serializers
from .models import Warehouse, WarehouseLocation, StockMovement
from users.serializers import UserSerializer

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
