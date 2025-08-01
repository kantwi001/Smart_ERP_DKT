from rest_framework import serializers
from .models import Route, Waypoint, Delivery

class WaypointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waypoint
        fields = ['id', 'name', 'address', 'latitude', 'longitude', 'order', 'estimated_arrival', 'actual_arrival', 'notes', 'is_completed', 'created_at']

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = ['id', 'tracking_number', 'recipient_name', 'recipient_phone', 'status', 'delivery_notes', 'delivered_at', 'signature', 'created_at']

class RouteSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.username', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    waypoint_count = serializers.SerializerMethodField()
    delivery_count = serializers.SerializerMethodField()
    waypoints = WaypointSerializer(many=True, read_only=True)
    deliveries = DeliverySerializer(many=True, read_only=True)
    
    class Meta:
        model = Route
        fields = ['id', 'name', 'description', 'status', 'driver', 'driver_name', 'vehicle', 'start_location', 'end_location',
                 'estimated_distance', 'estimated_duration', 'actual_distance', 'actual_duration', 'start_time', 'end_time',
                 'created_by', 'created_by_name', 'waypoint_count', 'delivery_count', 'waypoints', 'deliveries', 'created_at', 'updated_at']
        read_only_fields = ['created_by']
    
    def get_waypoint_count(self, obj):
        return obj.waypoints.count()
    
    def get_delivery_count(self, obj):
        return obj.deliveries.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
