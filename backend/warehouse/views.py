from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from .models import Warehouse, WarehouseLocation, StockMovement
from .serializers import WarehouseSerializer, WarehouseLocationSerializer, StockMovementSerializer
from utils.email_service import email_service

User = get_user_model()

class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

class WarehouseLocationListCreateView(generics.ListCreateAPIView):
    serializer_class = WarehouseLocationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            return WarehouseLocation.objects.filter(warehouse_id=warehouse_id)
        return WarehouseLocation.objects.all()

class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            return StockMovement.objects.filter(warehouse_id=warehouse_id)
        return StockMovement.objects.all().order_by('-created_at')

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def warehouse_stats(request):
    """Get warehouse statistics for dashboard"""
    total_warehouses = Warehouse.objects.filter(is_active=True).count()
    total_locations = WarehouseLocation.objects.filter(is_active=True).count()
    total_movements = StockMovement.objects.count()
    
    # Recent movements by type
    movement_stats = StockMovement.objects.values('movement_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'total_warehouses': total_warehouses,
        'total_locations': total_locations,
        'total_movements': total_movements,
        'movement_stats': list(movement_stats),
        'recent_activity': StockMovement.objects.select_related('warehouse', 'created_by').order_by('-created_at')[:10].values(
            'id', 'warehouse__name', 'movement_type', 'quantity', 'reference', 'created_at', 'created_by__username'
        )
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_warehouse(request):
    """Create a new warehouse"""
    serializer = WarehouseSerializer(data=request.data)
    if serializer.is_valid():
        warehouse = serializer.save()
        return Response({
            'message': 'Warehouse created successfully',
            'warehouse': WarehouseSerializer(warehouse).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_location(request):
    """Add a new location to a warehouse"""
    serializer = WarehouseLocationSerializer(data=request.data)
    if serializer.is_valid():
        location = serializer.save()
        return Response({
            'message': 'Location added successfully',
            'location': WarehouseLocationSerializer(location).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_transfer_with_notification(request):
    """Create warehouse transfer and send email notification to warehouse rep"""
    try:
        data = request.data
        
        # Create the transfer
        transfer_data = {
            'from_warehouse': data.get('from_warehouse'),
            'to_warehouse': data.get('to_warehouse'),
            'product': data.get('product'),
            'quantity': data.get('quantity'),
            'requested_by': request.user.id,
            'status': 'pending',
            'notes': data.get('notes', '')
        }
        
        serializer = StockMovementSerializer(data=transfer_data)
        if serializer.is_valid():
            transfer = serializer.save()
            
            # Get warehouse rep email for notification
            try:
                to_warehouse = Warehouse.objects.get(id=data.get('to_warehouse'))
                if hasattr(to_warehouse, 'assigned_rep') and to_warehouse.assigned_rep:
                    recipient_email = to_warehouse.assigned_rep.email
                    
                    # Send email notification
                    email_sent = email_service.send_warehouse_transfer_notification(
                        transfer=transfer,
                        recipient_email=recipient_email
                    )
                    
                    return Response({
                        'message': 'Transfer created successfully',
                        'transfer': serializer.data,
                        'email_sent': email_sent,
                        'notification_sent_to': recipient_email
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response({
                        'message': 'Transfer created successfully',
                        'transfer': serializer.data,
                        'email_sent': False,
                        'note': 'No warehouse rep assigned for email notification'
                    }, status=status.HTTP_201_CREATED)
                    
            except Warehouse.DoesNotExist:
                return Response({
                    'error': 'Destination warehouse not found'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to create transfer: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
