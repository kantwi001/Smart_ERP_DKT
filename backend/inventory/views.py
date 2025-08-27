from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product, InventoryTransfer, ProductPrice
from .serializers import CategorySerializer, ProductSerializer, InventoryTransferSerializer, ProductPriceSerializer
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from django.http import HttpResponse
from django.shortcuts import get_object_or_404

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProductPriceViewSet(viewsets.ModelViewSet):
    queryset = ProductPrice.objects.all()
    serializer_class = ProductPriceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ProductPrice.objects.all()
        product_id = self.request.query_params.get('product', None)
        if product_id is not None:
            queryset = queryset.filter(product=product_id)
        return queryset

class InventoryTransferViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransfer.objects.all()
    serializer_class = InventoryTransferSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def print_waybill(self, request, pk=None):
        transfer = self.get_object()
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y = 750
        p.setFont('Helvetica-Bold', 16)
        p.drawString(200, y, 'WAREHOUSE TRANSFER WAYBILL')
        y -= 40
        p.setFont('Helvetica', 12)
        p.drawString(30, y, f'Transfer #: {transfer.id}')
        y -= 20
        p.drawString(30, y, f'Product: {transfer.product.name}')
        y -= 20
        p.drawString(30, y, f'Quantity: {transfer.quantity}')
        y -= 20
        p.drawString(30, y, f'From: {transfer.from_location}')
        y -= 20
        p.drawString(30, y, f'To: {transfer.to_location}')
        y -= 20
        p.drawString(30, y, f'Requested by: {transfer.requested_by.get_full_name() if transfer.requested_by else "N/A"}')
        y -= 20
        p.drawString(30, y, f'Status: {transfer.status}')
        y -= 40
        p.drawString(30, y, f'Date: {transfer.created_at.strftime("%Y-%m-%d %H:%M")}')
        y -= 40
        p.drawString(30, y, 'Signature (Receiver): ___________________________')
        y -= 30
        p.drawString(30, y, 'Signature (Issuer): _____________________________')
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="transfer_waybill_{transfer.id}.pdf"'
        return response

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve an inventory transfer
        """
        try:
            transfer = self.get_object()
            action_type = request.data.get('action', 'approve')
            
            if action_type == 'approve':
                if transfer.status == 'pending':
                    transfer.status = 'approved'
                    transfer.approved_by = request.user
                    transfer.save()
                    
                    # Update product quantities
                    if transfer.product:
                        # Decrease quantity from source location
                        # This would need proper inventory management logic
                        pass
                    
                    return Response({
                        'message': 'Transfer approved successfully',
                        'status': transfer.status,
                        'transfer_id': transfer.id
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': f'Transfer cannot be approved. Current status: {transfer.status}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            elif action_type == 'reject':
                if transfer.status == 'pending':
                    transfer.status = 'rejected'
                    transfer.rejection_reason = request.data.get('rejection_reason', 'No reason provided')
                    transfer.approved_by = request.user
                    transfer.save()
                    
                    return Response({
                        'message': 'Transfer rejected successfully',
                        'status': transfer.status,
                        'transfer_id': transfer.id,
                        'rejection_reason': transfer.rejection_reason
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': f'Transfer cannot be rejected. Current status: {transfer.status}'
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'error': 'Invalid action. Use "approve" or "reject"'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': f'Failed to process transfer: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
