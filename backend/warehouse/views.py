from rest_framework import generics, viewsets, status
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Warehouse, WarehouseLocation, StockMovement, WarehouseTransfer, WarehouseStock
from .serializers import WarehouseSerializer, WarehouseLocationSerializer, StockMovementSerializer, WarehouseTransferSerializer, WarehouseStockSerializer
from utils.email_service import email_service
from inventory.models import Product
from inventory.serializers import ProductSerializer
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from io import BytesIO
import datetime

User = get_user_model()

class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [IsAuthenticated]

class WarehouseLocationListCreateView(generics.ListCreateAPIView):
    serializer_class = WarehouseLocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            return WarehouseLocation.objects.filter(warehouse_id=warehouse_id)
        return WarehouseLocation.objects.all()

class WarehouseTransferListCreateView(generics.ListCreateAPIView):
    serializer_class = WarehouseTransferSerializer
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]

class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            return StockMovement.objects.filter(warehouse_id=warehouse_id)
        return StockMovement.objects.all().order_by('-created_at')

class WarehouseStockViewSet(viewsets.ModelViewSet):
    queryset = WarehouseStock.objects.all()
    serializer_class = WarehouseStockSerializer
    permission_classes = [IsAuthenticated]

    @action(methods=['get'], detail=True)
    def get_stock(self, request, pk=None):
        warehouse_stock = self.get_object()
        product = warehouse_stock.product
        stock_data = {
            'product': ProductSerializer(product).data,
            'quantity': warehouse_stock.quantity,
            'warehouse': WarehouseSerializer(warehouse_stock.warehouse).data
        }
        return Response(stock_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        try:
            product = Product.objects.get(id=data['product'])
            warehouse_stock = WarehouseStock.objects.get(warehouse_id=data['from_warehouse'], product=product)
            
            if warehouse_stock.quantity <= 0:
                return Response({
                    'error': f'Insufficient stock. Current balance is zero for {product.name} in the source warehouse.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if warehouse_stock.quantity < int(data['quantity']):
                return Response({
                    'error': f'Insufficient stock. Available: {warehouse_stock.quantity}, Requested: {data["quantity"]} for {product.name}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except WarehouseStock.DoesNotExist:
            return Response({
                'error': f'No stock record found for {product.name} in the source warehouse.'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({
                'error': 'Product not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
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
            
            # Send notifications to destination warehouse manager and approvers
            try:
                from_warehouse = Warehouse.objects.get(id=data['from_warehouse'])
                to_warehouse = Warehouse.objects.get(id=data['to_warehouse'])
                
                # Email notification to destination warehouse manager
                if to_warehouse.manager and to_warehouse.manager.email:
                    subject = f"New Transfer Request - {transfer.transfer_number}"
                    message = f"""
                    A new warehouse transfer request requires your approval:
                    
                    Transfer Number: {transfer.transfer_number}
                    From: {from_warehouse.name}
                    To: {to_warehouse.name}
                    Product: {product.name}
                    Quantity: {transfer.quantity}
                    Priority: {transfer.priority}
                    Requested by: {request.user.get_full_name() or request.user.username}
                    
                    Please log in to the system to review and approve this transfer.
                    """
                    
                    email_service.send_email(
                        to_email=to_warehouse.manager.email,
                        subject=subject,
                        message=message
                    )
                
                # Push notification (if notification system exists)
                from notifications.models import Notification, NotificationChannel
                
                # Get or create push notification channel
                push_channel, created = NotificationChannel.objects.get_or_create(
                    channel_type='push',
                    defaults={'name': 'Push Notifications', 'is_enabled': True}
                )
                
                # Create notification record
                Notification.objects.create(
                    recipient=to_warehouse.manager,
                    sender=request.user,
                    channel=push_channel,
                    subject=f"Transfer Request - {transfer.transfer_number}",
                    message=f"New transfer request from {from_warehouse.name} requires approval",
                    notification_type='transfer_request',
                    reference_id=str(transfer.id),
                    reference_type='warehouse_transfer',
                    requires_response=True
                )
                
            except (Warehouse.DoesNotExist, Exception) as e:
                # Log the error but don't fail the transfer creation
                print(f"Notification error: {e}")
            
            return Response({
                'message': 'Transfer request created successfully',
                'transfer': WarehouseTransferSerializer(transfer).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create transfer request: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def approve_transfer(request, transfer_id):
    """Approve a warehouse transfer request"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        if transfer.status != 'pending':
            return Response({
                'error': f'Transfer is already {transfer.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check stock availability before approval
        product = transfer.product
        warehouse_stock = WarehouseStock.objects.get(warehouse=transfer.from_warehouse, product=product)
        if warehouse_stock.quantity < transfer.quantity:
            return Response({
                'error': f'Insufficient stock to approve transfer. Available: {warehouse_stock.quantity}, Required: {transfer.quantity}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct inventory from source warehouse immediately upon approval
        warehouse_stock.quantity -= transfer.quantity
        warehouse_stock.save()
        
        # Create outgoing stock movement record
        StockMovement.objects.create(
            warehouse=transfer.from_warehouse,
            product=product,
            transfer=transfer,
            movement_type='out',
            quantity=-transfer.quantity,
            reference=f'Transfer approved: {transfer.transfer_number}',
            notes=f'Stock deducted upon approval - Transfer to {transfer.to_warehouse.name}',
            created_by=request.user
        )
        
        # Update transfer status
        transfer.status = 'approved'
        transfer.approved_by = request.user
        transfer.approval_date = timezone.now()
        transfer.approval_notes = request.data.get('approval_notes', '')
        transfer.waybill_number = request.data.get('waybill_number', '')
        transfer.actual_quantity_sent = transfer.quantity
        transfer.save()
        
        return Response({
            'message': 'Transfer approved successfully and inventory deducted',
            'transfer': WarehouseTransferSerializer(transfer).data
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
        
        # Add to destination warehouse
        warehouse_stock, created = WarehouseStock.objects.get_or_create(warehouse=transfer.to_warehouse, product=product)
        warehouse_stock.quantity += actual_quantity
        warehouse_stock.save()
        
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
@permission_classes([IsAuthenticated])
def generate_waybill(request, transfer_id):
    """Generate and download waybill PDF for a transfer"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        # Check permissions
        user = request.user
        if (transfer.from_warehouse.manager != user and 
            transfer.to_warehouse.manager != user and 
            not user.is_superuser):
            return Response({
                'error': 'You do not have permission to generate waybill for this transfer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Try to use reportlab for PDF generation
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            from io import BytesIO
            
            # Create PDF buffer
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter
            
            # Header
            p.setFont("Helvetica-Bold", 18)
            p.drawCentredText(width/2, height - 50, "WAREHOUSE TRANSFER WAYBILL")
            
            p.setFont("Helvetica-Bold", 14)
            waybill_number = transfer.waybill_number or f'WB-{transfer.transfer_number}'
            p.drawCentredText(width/2, height - 80, waybill_number)
            
            # Draw line
            p.line(50, height - 100, width - 50, height - 100)
            
            # Waybill details
            y_position = height - 130
            p.setFont("Helvetica", 10)
            
            # Transfer info
            p.drawString(50, y_position, f"WAYBILL - {waybill_number}")
            y_position -= 20
            p.drawString(50, y_position, f"Transfer Number: {transfer.transfer_number}")
            y_position -= 30
            
            # From warehouse
            p.drawString(50, y_position, "FROM WAREHOUSE:")
            y_position -= 15
            p.drawString(50, y_position, str(transfer.from_warehouse.name))
            y_position -= 15
            p.drawString(50, y_position, str(transfer.from_warehouse.address or ''))
            y_position -= 15
            p.drawString(50, y_position, f"Code: {transfer.from_warehouse.code}")
            y_position -= 30
            
            # To warehouse
            p.drawString(50, y_position, "TO WAREHOUSE:")
            y_position -= 15
            p.drawString(50, y_position, str(transfer.to_warehouse.name))
            y_position -= 15
            p.drawString(50, y_position, str(transfer.to_warehouse.address or ''))
            y_position -= 15
            p.drawString(50, y_position, f"Code: {transfer.to_warehouse.code}")
            y_position -= 30
            
            # Product details
            p.drawString(50, y_position, "PRODUCT DETAILS:")
            y_position -= 15
            p.drawString(50, y_position, f"Product: {transfer.product.name}")
            y_position -= 15
            p.drawString(50, y_position, f"SKU: {transfer.product.sku}")
            y_position -= 15
            p.drawString(50, y_position, f"Quantity: {transfer.quantity}")
            y_position -= 30
            
            # Dates
            p.drawString(50, y_position, "DATES:")
            y_position -= 15
            p.drawString(50, y_position, f"Request Date: {transfer.request_date.strftime('%d/%m/%Y')}")
            if transfer.approval_date:
                y_position -= 15
                p.drawString(50, y_position, f"Approval Date: {transfer.approval_date.strftime('%d/%m/%Y')}")
            if transfer.expected_delivery_date:
                y_position -= 15
                p.drawString(50, y_position, f"Expected Delivery: {transfer.expected_delivery_date.strftime('%d/%m/%Y')}")
            y_position -= 30
            
            # Status and priority
            p.drawString(50, y_position, f"Status: {transfer.get_status_display()}")
            y_position -= 15
            p.drawString(50, y_position, f"Priority: {transfer.get_priority_display()}")
            y_position -= 30
            
            # Notes
            if transfer.request_notes:
                p.drawString(50, y_position, f"Notes: {str(transfer.request_notes)[:100]}")
            
            # Footer
            p.setFont("Helvetica", 8)
            p.drawString(50, 50, f"Generated on: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
            
            p.showPage()
            p.save()
            
            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()
            
            # Create HTTP response
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="waybill_{transfer.transfer_number}.pdf"'
            
            return response
            
        except ImportError as e:
            print(f"ReportLab import error: {e}")
            # Fallback to HTML/text format if reportlab not available
            waybill_number = transfer.waybill_number or f'WB-{transfer.transfer_number}'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Waybill - {waybill_number}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }}
                    .header {{ text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
                    .section {{ margin: 15px 0; }}
                    .label {{ font-weight: bold; }}
                    h1 {{ color: #333; margin: 0; }}
                    h2 {{ color: #666; margin: 5px 0; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>WAREHOUSE TRANSFER WAYBILL</h1>
                    <h2>{waybill_number}</h2>
                </div>
                
                <div class="section">
                    <div class="label">WAYBILL - {waybill_number}</div>
                    <div>Transfer Number: {transfer.transfer_number}</div>
                </div>
                
                <div class="section">
                    <div class="label">FROM WAREHOUSE:</div>
                    <div>{transfer.from_warehouse.name}</div>
                    <div>{transfer.from_warehouse.address or ''}</div>
                    <div>Code: {transfer.from_warehouse.code}</div>
                </div>
                
                <div class="section">
                    <div class="label">TO WAREHOUSE:</div>
                    <div>{transfer.to_warehouse.name}</div>
                    <div>{transfer.to_warehouse.address or ''}</div>
                    <div>Code: {transfer.to_warehouse.code}</div>
                </div>
                
                <div class="section">
                    <div class="label">PRODUCT DETAILS:</div>
                    <div>Product: {transfer.product.name}</div>
                    <div>SKU: {transfer.product.sku}</div>
                    <div>Quantity: {transfer.quantity}</div>
                </div>
                
                <div class="section">
                    <div class="label">DATES:</div>
                    <div>Request Date: {transfer.request_date.strftime('%d/%m/%Y')}</div>
                    {f'<div>Approval Date: {transfer.approval_date.strftime("%d/%m/%Y")}</div>' if transfer.approval_date else ''}
                    {f'<div>Expected Delivery: {transfer.expected_delivery_date.strftime("%d/%m/%Y")}</div>' if transfer.expected_delivery_date else ''}
                </div>
                
                <div class="section">
                    <div>Status: {transfer.get_status_display()}</div>
                    <div>Priority: {transfer.get_priority_display()}</div>
                </div>
                
                {f'<div class="section"><div class="label">Notes:</div><div>{str(transfer.request_notes)[:200] if transfer.request_notes else ""}</div></div>' if transfer.request_notes else ''}
                
                <div style="margin-top: 30px; font-size: 12px; color: #666;">
                    Generated on: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
                </div>
                
                <script>
                    window.onload = function() {{
                        window.print();
                    }}
                </script>
            </body>
            </html>
            """
            
            response = HttpResponse(html_content, content_type='text/html')
            return response
        
        except Exception as pdf_error:
            print(f"PDF generation error: {pdf_error}")
            # If PDF generation fails, try HTML fallback
            waybill_number = transfer.waybill_number or f'WB-{transfer.transfer_number}'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Waybill - {waybill_number}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }}
                    .header {{ text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }}
                    .section {{ margin: 15px 0; }}
                    .label {{ font-weight: bold; }}
                    h1 {{ color: #333; margin: 0; }}
                    h2 {{ color: #666; margin: 5px 0; }}
                    .error {{ color: #ff6b6b; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>WAREHOUSE TRANSFER WAYBILL</h1>
                    <h2>{waybill_number}</h2>
                    <div class="error">PDF generation failed - HTML fallback</div>
                </div>
                
                <div class="section">
                    <div class="label">Transfer Number: {transfer.transfer_number}</div>
                </div>
                
                <div class="section">
                    <div class="label">FROM: {transfer.from_warehouse.name}</div>
                    <div>Code: {transfer.from_warehouse.code}</div>
                </div>
                
                <div class="section">
                    <div class="label">TO: {transfer.to_warehouse.name}</div>
                    <div>Code: {transfer.to_warehouse.code}</div>
                </div>
                
                <div class="section">
                    <div class="label">PRODUCT: {transfer.product.name}</div>
                    <div>Quantity: {transfer.quantity}</div>
                </div>
                
                <div class="section">
                    <div>Status: {transfer.get_status_display()}</div>
                    <div>Request Date: {transfer.request_date.strftime('%d/%m/%Y')}</div>
                </div>
                
                <script>
                    window.onload = function() {{
                        window.print();
                    }}
                </script>
            </body>
            </html>
            """
            
            response = HttpResponse(html_content, content_type='text/html')
            return response
            
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Waybill generation error: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Failed to generate waybill: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def upload_waybill(request, transfer_id):
    """Upload waybill attachment for a transfer"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        # Check if user has permission to upload waybill (sender or receiver warehouse manager)
        user = request.user
        if (transfer.from_warehouse.manager != user and 
            transfer.to_warehouse.manager != user and 
            not user.is_superuser):
            return Response({
                'error': 'You do not have permission to upload waybill for this transfer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if 'waybill_file' not in request.FILES:
            return Response({
                'error': 'No waybill file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update transfer with waybill attachment
        transfer.waybill_attachment = request.FILES['waybill_file']
        transfer.save()
        
        return Response({
            'message': 'Waybill uploaded successfully',
            'waybill_url': transfer.waybill_attachment.url if transfer.waybill_attachment else None
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to upload waybill: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_waybill(request, transfer_id):
    """View waybill attachment for a transfer"""
    try:
        transfer = WarehouseTransfer.objects.get(id=transfer_id)
        
        # Check if user has permission to view waybill (sender or receiver warehouse manager)
        user = request.user
        if (transfer.from_warehouse.manager != user and 
            transfer.to_warehouse.manager != user and 
            not user.is_superuser):
            return Response({
                'error': 'You do not have permission to view waybill for this transfer'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not transfer.waybill_attachment:
            return Response({
                'error': 'No waybill attachment found for this transfer'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'waybill_url': transfer.waybill_attachment.url,
            'waybill_name': transfer.waybill_attachment.name,
            'transfer_number': transfer.transfer_number
        }, status=status.HTTP_200_OK)
        
    except WarehouseTransfer.DoesNotExist:
        return Response({
            'error': 'Transfer not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to retrieve waybill: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
