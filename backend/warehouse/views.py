from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Warehouse, WarehouseLocation, StockMovement, WarehouseTransfer
from .serializers import WarehouseSerializer, WarehouseLocationSerializer, StockMovementSerializer, WarehouseTransferSerializer
from utils.email_service import email_service
from inventory.models import Product

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

class WarehouseTransferListCreateView(generics.ListCreateAPIView):
    serializer_class = WarehouseTransferSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        warehouse_id = self.request.query_params.get('warehouse')
        status_filter = self.request.query_params.get('status')
        
        queryset = WarehouseTransfer.objects.all()
        
        # Filter by warehouse if specified
        if warehouse_id:
            queryset = queryset.filter(
                Q(from_warehouse_id=warehouse_id) | 
                Q(to_warehouse_id=warehouse_id)
            )
        
        # Filter by status if specified
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-created_at')

class WarehouseTransferDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WarehouseTransfer.objects.all()
    serializer_class = WarehouseTransferSerializer
    permission_classes = [permissions.IsAuthenticated]

class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            return StockMovement.objects.filter(warehouse_id=warehouse_id)
        return StockMovement.objects.all().order_by('-created_at')

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_transfer_request(request):
    """Create a new warehouse transfer request"""
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['from_warehouse', 'to_warehouse', 'product', 'quantity']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if source warehouse has sufficient stock
        product = Product.objects.get(id=data['product'])
        if product.quantity < int(data['quantity']):
            return Response({
                'error': f'Insufficient stock. Available: {product.quantity}, Requested: {data["quantity"]}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create transfer request
        transfer_data = {
            'from_warehouse': data['from_warehouse'],
            'to_warehouse': data['to_warehouse'],
            'product': data['product'],
            'quantity': data['quantity'],
            'priority': data.get('priority', 'medium'),
            'request_notes': data.get('request_notes', ''),
            'expected_delivery_date': data.get('expected_delivery_date'),
        }
        
        serializer = WarehouseTransferSerializer(data=transfer_data, context={'request': request})
        if serializer.is_valid():
            transfer = serializer.save()
            
            # Send notification to destination warehouse manager
            try:
                to_warehouse = Warehouse.objects.get(id=data['to_warehouse'])
                if to_warehouse.manager and to_warehouse.manager.email:
                    # Send email notification (implement email service)
                    pass
            except Warehouse.DoesNotExist:
                pass
            
            return Response({
                'message': 'Transfer request created successfully',
                'transfer': WarehouseTransferSerializer(transfer).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Product.DoesNotExist:
        return Response({
            'error': 'Product not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to create transfer request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_transfer(request, transfer_id):
    """Approve a warehouse transfer request"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        if transfer.status != 'pending':
            return Response({
                'error': f'Transfer is already {transfer.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update transfer status
        transfer.status = 'approved'
        transfer.approved_by = request.user
        transfer.approval_date = timezone.now()
        transfer.approval_notes = request.data.get('approval_notes', '')
        transfer.waybill_number = request.data.get('waybill_number', '')
        transfer.save()
        
        return Response({
            'message': 'Transfer approved successfully',
            'transfer': WarehouseTransferSerializer(transfer).data
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_transfer(request, transfer_id):
    """Reject a warehouse transfer request"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        if transfer.status != 'pending':
            return Response({
                'error': f'Transfer is already {transfer.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update transfer status
        transfer.status = 'rejected'
        transfer.approved_by = request.user
        transfer.approval_date = timezone.now()
        transfer.approval_notes = request.data.get('rejection_notes', '')
        transfer.save()
        
        return Response({
            'message': 'Transfer rejected',
            'transfer': WarehouseTransferSerializer(transfer).data
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_transfer(request, transfer_id):
    """Complete a warehouse transfer and update stock levels"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        if transfer.status != 'approved':
            return Response({
                'error': f'Transfer must be approved first. Current status: {transfer.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        actual_quantity = int(request.data.get('actual_quantity_received', transfer.quantity))
        
        # Update product stock levels
        product = transfer.product
        
        # Deduct from source warehouse (if not already done)
        if transfer.actual_quantity_sent is None:
            if product.quantity < transfer.quantity:
                return Response({
                    'error': f'Insufficient stock to complete transfer. Available: {product.quantity}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            product.quantity -= transfer.quantity
            product.save()
            
            # Create outgoing stock movement
            StockMovement.objects.create(
                warehouse=transfer.from_warehouse,
                product=product,
                transfer=transfer,
                movement_type='out',
                quantity=-transfer.quantity,
                reference=f'Transfer out to {transfer.to_warehouse.name}',
                notes=f'Transfer {transfer.transfer_number}',
                created_by=request.user
            )
            
            transfer.actual_quantity_sent = transfer.quantity
        
        # Add to destination warehouse
        product.quantity += actual_quantity
        product.save()
        
        # Create incoming stock movement
        StockMovement.objects.create(
            warehouse=transfer.to_warehouse,
            product=product,
            transfer=transfer,
            movement_type='in',
            quantity=actual_quantity,
            reference=f'Transfer in from {transfer.from_warehouse.name}',
            notes=f'Transfer {transfer.transfer_number}',
            created_by=request.user
        )
        
        # Update transfer completion details
        transfer.status = 'completed'
        transfer.completed_by = request.user
        transfer.completion_date = timezone.now()
        transfer.actual_quantity_received = actual_quantity
        transfer.tracking_notes = request.data.get('tracking_notes', '')
        transfer.save()
        
        return Response({
            'message': 'Transfer completed successfully',
            'transfer': WarehouseTransferSerializer(transfer).data
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to complete transfer: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def generate_waybill(request, transfer_id):
    """Generate waybill for a transfer"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        waybill_data = {
            'transfer_number': transfer.transfer_number,
            'waybill_number': transfer.waybill_number or f'WB-{transfer.transfer_number}',
            'from_warehouse': {
                'name': transfer.from_warehouse.name,
                'address': transfer.from_warehouse.address,
                'code': transfer.from_warehouse.code
            },
            'to_warehouse': {
                'name': transfer.to_warehouse.name,
                'address': transfer.to_warehouse.address,
                'code': transfer.to_warehouse.code
            },
            'product': {
                'name': transfer.product.name,
                'sku': transfer.product.sku,
                'quantity': transfer.quantity
            },
            'dates': {
                'request_date': transfer.request_date,
                'approval_date': transfer.approval_date,
                'expected_delivery': transfer.expected_delivery_date
            },
            'status': transfer.status,
            'priority': transfer.priority,
            'notes': transfer.request_notes
        }
        
        return Response(waybill_data, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def warehouse_stats(request):
    """Get warehouse statistics for dashboard"""
    total_warehouses = Warehouse.objects.filter(is_active=True).count()
    total_locations = WarehouseLocation.objects.filter(is_active=True).count()
    total_movements = StockMovement.objects.count()
    
    # Transfer statistics
    pending_transfers = WarehouseTransfer.objects.filter(status='pending').count()
    approved_transfers = WarehouseTransfer.objects.filter(status='approved').count()
    completed_transfers = WarehouseTransfer.objects.filter(status='completed').count()
    
    # Recent movements by type
    movement_stats = StockMovement.objects.values('movement_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'total_warehouses': total_warehouses,
        'total_locations': total_locations,
        'total_movements': total_movements,
        'pending_transfers': pending_transfers,
        'approved_transfers': approved_transfers,
        'completed_transfers': completed_transfers,
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
