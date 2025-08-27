from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Customer, CustomerApproval, Quote, Lead, Sale, Promotion, PromotionProduct,
    SalesOrder, SalesOrderItem, FinanceTransaction, Payment
)
from .serializers import (
    CustomerSerializer, CustomerApprovalSerializer, QuoteSerializer, 
    LeadSerializer, SaleSerializer, PromotionSerializer, PromotionProductSerializer,
    SalesOrderSerializer, SalesOrderItemSerializer, FinanceTransactionSerializer, PaymentSerializer
)

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('-id')  # Show all customers for all regions, newest first
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Return all customers for all regions - no filtering by region
        """
        return Customer.objects.all().order_by('-id')
    
    def create(self, request, *args, **kwargs):
        """
        Override create to handle role-based customer creation:
        - Superuser and Sales Manager can create customers directly
        - Sales Rep creates customer approval request
        """
        user = request.user
        
        # Check if user can create customers directly
        if user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin']):
            # Create customer directly
            return super().create(request, *args, **kwargs)
        else:
            # Create customer approval request for Sales Rep
            approval_data = request.data.copy()
            approval_serializer = CustomerApprovalSerializer(data=approval_data, context={'request': request})
            
            if approval_serializer.is_valid():
                approval = approval_serializer.save()
                
                # Send notification to Sales Managers (using existing notification system)
                try:
                    from notifications.services import NotificationService
                    NotificationService.send_customer_approval_request(approval)
                except ImportError:
                    pass  # Notification system not available
                
                return Response({
                    'message': 'Customer request submitted for approval',
                    'approval_id': approval.id,
                    'status': 'pending_approval'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(approval_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerApprovalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing customer approval requests
    """
    queryset = CustomerApproval.objects.all()
    serializer_class = CustomerApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset based on user role:
        - Sales Manager/Superuser: see all pending approvals
        - Sales Rep: see only their own requests
        """
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin']):
            return CustomerApproval.objects.all()
        else:
            return CustomerApproval.objects.filter(requested_by=user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve_reject(self, request, pk=None):
        """
        Approve or reject a customer request (Sales Manager/Superuser only)
        """
        user = request.user
        
        # Check permissions
        if not (user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin'])):
            return Response(
                {'error': 'Only Sales Managers and Superusers can approve/reject customer requests'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        approval = self.get_object()
        
        if approval.status != 'pending':
            return Response(
                {'error': f'Customer request is already {approval.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CustomerApprovalActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        action = serializer.validated_data['action']
        
        if action == 'approve':
            # Create the actual customer
            customer_data = {
                'name': approval.name,
                'email': approval.email,
                'phone': approval.phone,
                'address': approval.address,
                'customer_type': serializer.validated_data['approved_customer_type'],
                'payment_terms': approval.payment_terms,
            }
            
            customer = Customer.objects.create(**customer_data)
            
            # Update approval record
            approval.status = 'approved'
            approval.approved_by = user
            approval.approved_at = timezone.now()
            approval.approved_customer_type = serializer.validated_data['approved_customer_type']
            approval.customer = customer
            approval.save()
            
            # Send approval notification
            try:
                from notifications.services import NotificationService
                NotificationService.send_customer_approval_notification(approval, 'approved')
            except ImportError:
                pass
            
            return Response({
                'message': 'Customer request approved successfully',
                'customer_id': customer.id,
                'customer_type': customer.customer_type
            }, status=status.HTTP_200_OK)
        
        elif action == 'reject':
            # Reject the request
            approval.status = 'rejected'
            approval.approved_by = user
            approval.approved_at = timezone.now()
            approval.rejection_reason = serializer.validated_data['rejection_reason']
            approval.save()
            
            # Send rejection notification
            try:
                from notifications.services import NotificationService
                NotificationService.send_customer_approval_notification(approval, 'rejected')
            except ImportError:
                pass
            
            return Response({
                'message': 'Customer request rejected',
                'reason': approval.rejection_reason
            }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get all pending customer approval requests (for Sales Managers)
        """
        user = request.user
        if not (user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin'])):
            return Response(
                {'error': 'Only Sales Managers and Superusers can view pending approvals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        pending_approvals = CustomerApproval.objects.filter(status='pending')
        serializer = self.get_serializer(pending_approvals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """
        Get current user's customer requests
        """
        my_requests = CustomerApproval.objects.filter(requested_by=request.user)
        serializer = self.get_serializer(my_requests, many=True)
        return Response(serializer.data)

from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def print_invoice(self, request, pk=None):
        sale = self.get_object()
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y = 750
        p.setFont('Helvetica-Bold', 16)
        p.drawString(200, y, 'INVOICE')
        y -= 40
        p.setFont('Helvetica', 12)
        p.drawString(30, y, f'Invoice #: {sale.id}')
        y -= 20
        p.drawString(30, y, f'Customer: {sale.customer.name if sale.customer else "N/A"}')
        y -= 20
        p.drawString(30, y, f'Date: {sale.date.strftime("%Y-%m-%d %H:%M")}')
        y -= 20
        p.drawString(30, y, f'Staff: {sale.staff.username if sale.staff else "N/A"}')
        y -= 40
        p.setFont('Helvetica-Bold', 12)
        p.drawString(30, y, 'Total:')
        p.setFont('Helvetica', 12)
        p.drawString(100, y, f'₵{sale.total}')
        y -= 40
        p.drawString(30, y, 'Thank you for your business!')
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="invoice_{sale.id}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def print_receipt(self, request, pk=None):
        sale = self.get_object()
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y = 750
        p.setFont('Helvetica-Bold', 16)
        p.drawString(200, y, 'RECEIPT')
        y -= 40
        p.setFont('Helvetica', 12)
        p.drawString(30, y, f'Receipt #: {sale.id}')
        y -= 20
        p.drawString(30, y, f'Customer: {sale.customer.name if sale.customer else "N/A"}')
        y -= 20
        p.drawString(30, y, f'Date: {sale.date.strftime("%Y-%m-%d %H:%M")}')
        y -= 20
        p.drawString(30, y, f'Staff: {sale.staff.username if sale.staff else "N/A"}')
        y -= 40
        p.setFont('Helvetica-Bold', 12)
        p.drawString(30, y, 'Amount Paid:')
        p.setFont('Helvetica', 12)
        p.drawString(130, y, f'₵{sale.total}')
        y -= 40
        p.drawString(30, y, 'Payment received. Thank you!')
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="receipt_{sale.id}.pdf"'
        return response

class QuoteViewSet(viewsets.ModelViewSet):
    """ViewSet for managing sales quotes"""
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see quotes they created or all quotes if they're managers
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin']):
            return Quote.objects.all()
        else:
            return Quote.objects.filter(created_by=user)
    
    @action(detail=True, methods=['post'])
    def send_quote(self, request, pk=None):
        """Mark quote as sent"""
        quote = self.get_object()
        quote.status = 'sent'
        quote.save()
        return Response({'message': 'Quote marked as sent', 'status': quote.status})
    
    @action(detail=True, methods=['post'])
    def accept_quote(self, request, pk=None):
        """Mark quote as accepted"""
        quote = self.get_object()
        quote.status = 'accepted'
        quote.save()
        return Response({'message': 'Quote accepted', 'status': quote.status})
    
    @action(detail=True, methods=['post'])
    def reject_quote(self, request, pk=None):
        """Mark quote as rejected"""
        quote = self.get_object()
        quote.status = 'rejected'
        quote.save()
        return Response({'message': 'Quote rejected', 'status': quote.status})

class LeadViewSet(viewsets.ModelViewSet):
    """ViewSet for managing sales leads"""
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can see leads they created or are assigned to, or all leads if they're managers
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'role') and user.role in ['sales_manager', 'admin']):
            return Lead.objects.all()
        else:
            from django.db import models
            return Lead.objects.filter(models.Q(created_by=user) | models.Q(assigned_to=user))
    
    @action(detail=True, methods=['post'])
    def assign_lead(self, request, pk=None):
        """Assign lead to a user"""
        lead = self.get_object()
        assigned_to_id = request.data.get('assigned_to')
        
        if assigned_to_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                assigned_user = User.objects.get(id=assigned_to_id)
                lead.assigned_to = assigned_user
                lead.save()
                return Response({'message': f'Lead assigned to {assigned_user.get_full_name()}'})
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'assigned_to is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update lead status"""
        lead = self.get_object()
        new_status = request.data.get('status')
        
        if new_status in dict(Lead.STATUS_CHOICES):
            lead.status = new_status
            if new_status in ['contacted', 'qualified', 'proposal', 'negotiation']:
                lead.last_contact_date = timezone.now()
            lead.save()
            return Response({'message': f'Lead status updated to {new_status}', 'status': lead.status})
        else:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def convert_to_customer(self, request, pk=None):
        """Convert lead to customer"""
        lead = self.get_object()
        
        # Create customer from lead data
        customer_data = {
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'address': lead.company,  # Use company as address for now
            'customer_type': 'retailer',  # Default type
        }
        
        customer_serializer = CustomerSerializer(data=customer_data)
        if customer_serializer.is_valid():
            customer = customer_serializer.save()
            lead.status = 'won'
            lead.save()
            return Response({
                'message': 'Lead converted to customer successfully',
                'customer_id': customer.id,
                'customer_name': customer.name
            })
        else:
            return Response(customer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PromotionViewSet(viewsets.ModelViewSet):
    queryset = Promotion.objects.all()
    serializer_class = PromotionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter promotions based on user permissions and query parameters"""
        queryset = Promotion.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by active promotions
        active_only = self.request.query_params.get('active_only', None)
        if active_only == 'true':
            queryset = [p for p in queryset if p.is_active()]
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a promotion"""
        promotion = self.get_object()
        promotion.status = 'active'
        promotion.save()
        
        return Response({
            'message': 'Promotion activated successfully',
            'status': promotion.status
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a promotion"""
        promotion = self.get_object()
        promotion.status = 'inactive'
        promotion.save()
        
        return Response({
            'message': 'Promotion deactivated successfully',
            'status': promotion.status
        })
    
    @action(detail=True, methods=['get'])
    def calculate_discount(self, request, pk=None):
        """Calculate discount for a given order amount"""
        promotion = self.get_object()
        amount = float(request.query_params.get('amount', 0))
        
        discount = promotion.calculate_discount(amount)
        
        return Response({
            'promotion_name': promotion.name,
            'order_amount': amount,
            'discount_amount': discount,
            'final_amount': amount - discount,
            'is_applicable': discount > 0
        })
    
    @action(detail=False, methods=['get'])
    def active_promotions(self, request):
        """Get all currently active promotions"""
        active_promotions = [p for p in self.get_queryset() if p.is_active()]
        serializer = self.get_serializer(active_promotions, many=True)
        
        return Response({
            'count': len(active_promotions),
            'results': serializer.data
        })

class PromotionProductViewSet(viewsets.ModelViewSet):
    queryset = PromotionProduct.objects.all()
    serializer_class = PromotionProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter promotion products by promotion if specified"""
        queryset = PromotionProduct.objects.all()
        
        promotion_id = self.request.query_params.get('promotion', None)
        if promotion_id:
            queryset = queryset.filter(promotion_id=promotion_id)
        
        return queryset

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a sales order"""
        sales_order = self.get_object()
        sales_order.status = 'approved'
        sales_order.save()
        return Response({'message': 'Sales order approved', 'status': sales_order.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a sales order"""
        sales_order = self.get_object()
        sales_order.status = 'rejected'
        sales_order.save()
        return Response({'message': 'Sales order rejected', 'status': sales_order.status})

class SalesOrderItemViewSet(viewsets.ModelViewSet):
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

class FinanceTransactionViewSet(viewsets.ModelViewSet):
    queryset = FinanceTransaction.objects.all()
    serializer_class = FinanceTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def approve_cheque(self, request, pk=None):
        """Approve a cheque payment"""
        finance_transaction = self.get_object()
        finance_transaction.status = 'approved'
        finance_transaction.save()
        return Response({'message': 'Cheque payment approved', 'status': finance_transaction.status})

    @action(detail=True, methods=['post'])
    def reject_cheque(self, request, pk=None):
        """Reject a cheque payment"""
        finance_transaction = self.get_object()
        finance_transaction.status = 'rejected'
        finance_transaction.save()
        return Response({'message': 'Cheque payment rejected', 'status': finance_transaction.status})

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'payment_method', 'sales_order']
    search_fields = ['payment_number', 'sales_order__order_number', 'reference']
    ordering_fields = ['created_at', 'amount', 'payment_date']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a payment (Finance team only)"""
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response(
                {'error': 'Payment is not pending approval'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'approved'
        payment.approved_by = request.user
        payment.approved_at = timezone.now()
        payment.save()
        
        # For approved payments, mark as completed and update receivables
        if payment.payment_method in ['cash', 'mobile_money']:
            payment.status = 'completed'
            payment.save()
            self.update_customer_receivables(payment)
        
        return Response({
            'message': 'Payment approved successfully',
            'status': payment.status
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a payment (Finance team only)"""
        payment = self.get_object()
        
        if payment.status != 'pending':
            return Response(
                {'error': 'Payment is not pending approval'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rejection_reason = request.data.get('reason', '')
        
        payment.status = 'rejected'
        payment.approved_by = request.user
        payment.approved_at = timezone.now()
        payment.notes = f"Rejected: {rejection_reason}"
        payment.save()
        
        return Response({
            'message': 'Payment rejected',
            'status': payment.status
        })

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete an approved payment (Finance team only)"""
        payment = self.get_object()
        
        if payment.status != 'approved':
            return Response(
                {'error': 'Payment must be approved first'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'completed'
        payment.save()
        
        # Update customer receivables and balance
        self.update_customer_receivables(payment)
        
        return Response({
            'message': 'Payment completed and receivables updated',
            'status': payment.status
        })

    def update_customer_receivables(self, payment):
        """Update customer receivables when payment is completed"""
        try:
            # Create finance transaction for payment received
            FinanceTransaction.objects.create(
                sales_order=payment.sales_order,
                customer=payment.sales_order.customer,
                transaction_type='payment',
                amount=payment.amount,
                payment_method=payment.payment_method,
                reference_number=payment.payment_number,
                status='completed',
                created_by=payment.approved_by or payment.created_by,
                description=f"Payment received - {payment.payment_method} - {payment.payment_number}"
            )
            
            # Update any pending receivable transactions
            receivable_transactions = FinanceTransaction.objects.filter(
                sales_order=payment.sales_order,
                transaction_type='receivable',
                status='pending'
            )
            
            remaining_payment = payment.amount
            for transaction in receivable_transactions:
                if remaining_payment <= 0:
                    break
                    
                if remaining_payment >= transaction.amount:
                    transaction.status = 'completed'
                    remaining_payment -= transaction.amount
                else:
                    # Partial payment - create new transaction for remaining
                    transaction.amount -= remaining_payment
                    remaining_payment = 0
                
                transaction.save()
                
        except Exception as e:
            # Log error but don't fail the payment completion
            print(f"Error updating receivables: {e}")

class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def sales_dashboard(self, request):
        """Provide sales dashboard data"""
        # Sales statistics
        total_sales = Sale.objects.aggregate(total=Sum('total'))['total']
        total_customers = Customer.objects.count()
        total_leads = Lead.objects.count()
        
        # Recent sales
        recent_sales = Sale.objects.order_by('-date')[:10]
        
        # Analytics
        sales_by_month = Sale.objects.extra({'month': "EXTRACT(MONTH FROM date)"}).values('month').annotate(total=Sum('total')).order_by('month')
        
        return Response({
            'sales_statistics': {
                'total_sales': total_sales,
                'total_customers': total_customers,
                'total_leads': total_leads,
            },
            'recent_sales': SaleSerializer(recent_sales, many=True).data,
            'analytics': list(sales_by_month),
        })

    @action(detail=False, methods=['get'])
    def customer_locations(self, request):
        """Provide customer location data for heat map (Superadmin only)"""
        user = request.user
        
        # Restrict to superadmin users only
        if not (user.is_superuser or (hasattr(user, 'role') and user.role == 'superadmin')):
            return Response(
                {'error': 'Access denied. Heat map is restricted to Superadmin users only.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get customers with valid GPS coordinates
        customers_with_location = Customer.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).exclude(
            latitude=0,
            longitude=0
        ).values(
            'id', 'name', 'customer_type', 'latitude', 'longitude', 
            'address', 'phone', 'email', 'created_at'
        )
        
        return Response({
            'count': customers_with_location.count(),
            'customers': list(customers_with_location)
        })
