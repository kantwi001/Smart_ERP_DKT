from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Notification, NotificationChannel, NotificationTemplate, TransferApproval
from .serializers import (
    NotificationSerializer, NotificationChannelSerializer, 
    NotificationTemplateSerializer, TransferApprovalSerializer,
    ApprovalActionSerializer
)
from .services import TransferApprovalService
from inventory.models import InventoryTransfer

User = get_user_model()

class NotificationListView(generics.ListAPIView):
    """List notifications for the current user"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """Get and update notification details"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    def patch(self, request, *args, **kwargs):
        """Mark notification as read"""
        notification = self.get_object()
        if 'mark_as_read' in request.data and request.data['mark_as_read']:
            notification.mark_as_read()
        return super().patch(request, *args, **kwargs)

class NotificationChannelListView(generics.ListCreateAPIView):
    """List and create notification channels (admin only)"""
    queryset = NotificationChannel.objects.all()
    serializer_class = NotificationChannelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return NotificationChannel.objects.all()
        return NotificationChannel.objects.filter(is_enabled=True)

class NotificationTemplateListView(generics.ListCreateAPIView):
    """List and create notification templates (admin only)"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return NotificationTemplate.objects.all()
        return NotificationTemplate.objects.filter(is_active=True)

class TransferApprovalListView(generics.ListAPIView):
    """List transfer approvals for the current user"""
    serializer_class = TransferApprovalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Show approvals where user is the destination warehouse manager
        from warehouse.models import Warehouse
        
        if user.is_superuser:
            return TransferApproval.objects.all()
        
        # Get warehouses managed by this user
        managed_warehouses = Warehouse.objects.filter(manager=user)
        warehouse_names = [w.name for w in managed_warehouses]
        
        # Get transfers to these warehouses
        transfers = InventoryTransfer.objects.filter(to_location__in=warehouse_names)
        return TransferApproval.objects.filter(transfer__in=transfers)

class TransferApprovalDetailView(generics.RetrieveAPIView):
    """Get transfer approval details"""
    serializer_class = TransferApprovalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        from warehouse.models import Warehouse
        
        if user.is_superuser:
            return TransferApproval.objects.all()
        
        # Get warehouses managed by this user
        managed_warehouses = Warehouse.objects.filter(manager=user)
        warehouse_names = [w.name for w in managed_warehouses]
        
        # Get transfers to these warehouses
        transfers = InventoryTransfer.objects.filter(to_location__in=warehouse_names)
        return TransferApproval.objects.filter(transfer__in=transfers)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_transfer(request, transfer_id):
    """Approve or reject a transfer"""
    serializer = ApprovalActionSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    action = serializer.validated_data['action']
    notes = serializer.validated_data.get('notes', '')
    reason = serializer.validated_data.get('reason', '')
    
    approval_service = TransferApprovalService()
    
    if action == 'approve':
        success, message = approval_service.approve_transfer(transfer_id, request.user, notes)
    else:  # reject
        success, message = approval_service.reject_transfer(transfer_id, request.user, reason)
    
    if success:
        return Response({'message': message}, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_approvals(request):
    """Get pending transfer approvals for the current user"""
    user = request.user
    from warehouse.models import Warehouse
    
    # Get warehouses managed by this user
    managed_warehouses = Warehouse.objects.filter(manager=user)
    warehouse_names = [w.name for w in managed_warehouses]
    
    # Get pending transfers to these warehouses
    transfers = InventoryTransfer.objects.filter(
        to_location__in=warehouse_names,
        status='pending_approval'
    )
    
    approvals = TransferApproval.objects.filter(
        transfer__in=transfers,
        status='pending'
    )
    
    serializer = TransferApprovalSerializer(approvals, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_stats(request):
    """Get notification statistics for the current user"""
    user = request.user
    
    total_notifications = Notification.objects.filter(recipient=user).count()
    unread_notifications = Notification.objects.filter(recipient=user, status__in=['pending', 'sent', 'delivered']).count()
    pending_approvals_count = 0
    
    # Count pending approvals if user manages warehouses
    from warehouse.models import Warehouse
    managed_warehouses = Warehouse.objects.filter(manager=user)
    if managed_warehouses.exists():
        warehouse_names = [w.name for w in managed_warehouses]
        transfers = InventoryTransfer.objects.filter(
            to_location__in=warehouse_names,
            status='pending_approval'
        )
        pending_approvals_count = TransferApproval.objects.filter(
            transfer__in=transfers,
            status='pending'
        ).count()
    
    return Response({
        'total_notifications': total_notifications,
        'unread_notifications': unread_notifications,
        'pending_approvals': pending_approvals_count,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    """Mark all notifications as read for the current user"""
    notifications = Notification.objects.filter(
        recipient=request.user,
        status__in=['pending', 'sent', 'delivered']
    )
    
    count = notifications.count()
    for notification in notifications:
        notification.mark_as_read()
    
    return Response({'message': f'{count} notifications marked as read'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transfer_approval_details(request, transfer_id):
    """Get detailed transfer information for approval"""
    try:
        transfer = InventoryTransfer.objects.get(id=transfer_id)
        approval = TransferApproval.objects.get(transfer=transfer)
        
        # Check if user has permission to view this approval
        user = request.user
        from warehouse.models import Warehouse
        
        if not user.is_superuser:
            managed_warehouses = Warehouse.objects.filter(manager=user)
            warehouse_names = [w.name for w in managed_warehouses]
            
            if transfer.to_location not in warehouse_names:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Return detailed transfer and approval information
        from inventory.serializers import InventoryTransferSerializer
        
        return Response({
            'transfer': InventoryTransferSerializer(transfer).data,
            'approval': TransferApprovalSerializer(approval).data,
            'can_approve': approval.status == 'pending' and not approval.is_expired()
        })
        
    except InventoryTransfer.DoesNotExist:
        return Response({'error': 'Transfer not found'}, status=status.HTTP_404_NOT_FOUND)
    except TransferApproval.DoesNotExist:
        return Response({'error': 'Transfer approval not found'}, status=status.HTTP_404_NOT_FOUND)
