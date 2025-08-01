from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import (
    ProcurementWorkflowStage, ProcurementRequest, ProcurementAudit,
    Vendor, ProcurementApproval, BidAnalysis, PurchaseOrder, PaymentVoucher
)
from .serializers import (
    ProcurementWorkflowStageSerializer, ProcurementRequestSerializer, ProcurementAuditSerializer,
    VendorSerializer, ProcurementApprovalSerializer, BidAnalysisSerializer,
    PurchaseOrderSerializer, PaymentVoucherSerializer
)
from users.models import User
import csv
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

class ProcurementWorkflowStageViewSet(viewsets.ModelViewSet):
    queryset = ProcurementWorkflowStage.objects.all()
    serializer_class = ProcurementWorkflowStageSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.filter(is_active=True)
    serializer_class = VendorSerializer
    permission_classes = [IsAuthenticated]

class ProcurementRequestViewSet(viewsets.ModelViewSet):
    queryset = ProcurementRequest.objects.all()
    serializer_class = ProcurementRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user
        
        # Filter based on user role and permissions
        if user.is_superuser:
            return queryset.select_related('department', 'created_by', 'current_approver')
        elif 'procurement' in user.role.lower():
            return queryset.select_related('department', 'created_by', 'current_approver')
        elif 'finance' in user.role.lower():
            return queryset.filter(
                current_stage__in=['finance_manager', 'finance_officer', 'final_approval', 'completed']
            ).select_related('department', 'created_by', 'current_approver')
        else:
            # Regular users can see their own requests and requests they need to approve
            from django.db import models as django_models
            return queryset.filter(
                django_models.Q(created_by=user) | django_models.Q(current_approver=user)
            ).select_related('department', 'created_by', 'current_approver')
    
    @action(detail=True, methods=['post'])
    def take_action(self, request, pk=None):
        """Take approval action on a procurement request"""
        procurement_request = self.get_object()
        action_type = request.data.get('action')  # 'approve', 'reject', 'assign'
        comment = request.data.get('comment', '')
        assignment_id = request.data.get('assignment_id')
        
        try:
            with transaction.atomic():
                # Create approval record
                approval = ProcurementApproval.objects.create(
                    procurement_request=procurement_request,
                    approver=request.user,
                    stage=procurement_request.current_stage,
                    action=action_type,
                    comment=comment,
                    assigned_to_id=assignment_id if assignment_id else None
                )
                
                # Handle assignment for procurement manager and finance manager
                assignment = None
                if assignment_id:
                    assignment = get_object_or_404(User, id=assignment_id)
                
                # Advance workflow
                procurement_request.advance_workflow(
                    approver=request.user,
                    action=action_type,
                    comment=comment,
                    assignment=assignment
                )
                
                # Create audit log
                ProcurementAudit.objects.create(
                    procurement_request=procurement_request,
                    actor=request.user,
                    action=f'{action_type.title()} - {procurement_request.get_current_stage_display()}',
                    comment=comment
                )
                
                # TODO: Send notifications to relevant parties
                # This would integrate with the workflow notification system
                
                return Response({
                    'success': True,
                    'message': f'Action {action_type} completed successfully',
                    'current_stage': procurement_request.current_stage,
                    'status': procurement_request.status
                })
                
        except PermissionError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to process action: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def submit_bid_analysis(self, request, pk=None):
        """Submit bid analysis for procurement officer"""
        procurement_request = self.get_object()
        
        if procurement_request.current_stage != 'procurement_officer':
            return Response(
                {'error': 'Bid analysis can only be submitted at procurement officer stage'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if procurement_request.assigned_procurement_officer != request.user:
            return Response(
                {'error': 'Only assigned procurement officer can submit bid analysis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            with transaction.atomic():
                # Create or update bid analysis
                bid_analysis, created = BidAnalysis.objects.get_or_create(
                    procurement_request=procurement_request,
                    defaults={
                        'analyzed_by': request.user,
                        'vendor_quotes': request.data.get('vendor_quotes', {}),
                        'analysis_notes': request.data.get('analysis_notes', ''),
                        'recommendation': request.data.get('recommendation', '')
                    }
                )
                
                if not created:
                    bid_analysis.vendor_quotes = request.data.get('vendor_quotes', bid_analysis.vendor_quotes)
                    bid_analysis.analysis_notes = request.data.get('analysis_notes', bid_analysis.analysis_notes)
                    bid_analysis.recommendation = request.data.get('recommendation', bid_analysis.recommendation)
                    bid_analysis.save()
                
                # Update selected vendor if provided
                vendor_id = request.data.get('selected_vendor_id')
                if vendor_id:
                    vendor = get_object_or_404(Vendor, id=vendor_id)
                    procurement_request.selected_vendor = vendor
                    procurement_request.save()
                
                # Generate Purchase Order
                po_number = procurement_request.generate_po_number()
                
                return Response({
                    'success': True,
                    'message': 'Bid analysis submitted successfully',
                    'po_number': po_number
                })
                
        except Exception as e:
            return Response(
                {'error': f'Failed to submit bid analysis: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def create_payment_voucher(self, request, pk=None):
        """Create payment voucher for finance officer"""
        procurement_request = self.get_object()
        
        if procurement_request.current_stage != 'finance_officer':
            return Response(
                {'error': 'Payment voucher can only be created at finance officer stage'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if procurement_request.assigned_finance_officer != request.user:
            return Response(
                {'error': 'Only assigned finance officer can create payment voucher'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            with transaction.atomic():
                # Get or create purchase order
                purchase_order, created = PurchaseOrder.objects.get_or_create(
                    procurement_request=procurement_request,
                    defaults={
                        'po_number': procurement_request.po_number,
                        'vendor': procurement_request.selected_vendor,
                        'total_amount': request.data.get('po_amount', procurement_request.estimated_cost),
                        'generated_by': request.user
                    }
                )
                
                # Generate voucher number
                import datetime
                year = datetime.datetime.now().year
                count = PaymentVoucher.objects.filter(created_at__year=year).count() + 1
                voucher_number = f'PV-{year}-{count:04d}'
                
                # Create payment voucher
                payment_voucher = PaymentVoucher.objects.create(
                    purchase_order=purchase_order,
                    voucher_number=voucher_number,
                    cheque_number=request.data.get('cheque_number', ''),
                    amount=request.data.get('amount', purchase_order.total_amount),
                    prepared_by=request.user
                )
                
                # Update procurement request
                procurement_request.payment_voucher_number = voucher_number
                procurement_request.cheque_number = request.data.get('cheque_number', '')
                procurement_request.payment_amount = payment_voucher.amount
                procurement_request.save()
                
                return Response({
                    'success': True,
                    'message': 'Payment voucher created successfully',
                    'voucher_number': voucher_number
                })
                
        except Exception as e:
            return Response(
                {'error': f'Failed to create payment voucher: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        """Get procurement requests created by current user"""
        requests = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending_approvals(self, request):
        """Get procurement requests pending approval by current user"""
        requests = self.get_queryset().filter(current_approver=request.user, status='pending')
        serializer = self.get_serializer(requests, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def print_waybill(self, request, pk=None):
        req = self.get_object()
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y = 750
        p.setFont('Helvetica-Bold', 16)
        p.drawString(200, y, 'WAYBILL')
        y -= 40
        p.setFont('Helvetica', 12)
        p.drawString(30, y, f'Waybill #: {req.id}')
        y -= 20
        p.drawString(30, y, f'Item: {req.item}')
        y -= 20
        p.drawString(30, y, f'Quantity: {req.quantity}')
        y -= 20
        p.drawString(30, y, f'Department: {req.department.name if req.department else "N/A"}')
        y -= 20
        p.drawString(30, y, f'Requested by: {req.created_by.get_full_name() if req.created_by else "N/A"}')
        y -= 20
        p.drawString(30, y, f'Status: {req.status}')
        y -= 40
        p.drawString(30, y, f'Date: {req.created_at.strftime("%Y-%m-%d %H:%M")}')
        y -= 40
        p.drawString(30, y, 'Signature (Receiver): ___________________________')
        y -= 30
        p.drawString(30, y, 'Signature (Issuer): _____________________________')
        p.showPage()
        p.save()
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="waybill_{req.id}.pdf"'
        return response

    @action(detail=True, methods=['get'])
    def audit(self, request, pk=None):
        req = self.get_object()
        audits = req.audits.all()
        ser = ProcurementAuditSerializer(audits, many=True)
        return Response(ser.data)

    @action(detail=True, methods=['get'])
    def export_audit(self, request, pk=None):
        req = self.get_object()
        format = request.query_params.get('format', 'csv')
        audits = req.audits.all()
        if format == 'csv':
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Actor', 'Action', 'Comment', 'Attachment', 'Timestamp'])
            for a in audits:
                writer.writerow([
                    a.actor.get_full_name() if a.actor else '',
                    a.action,
                    a.comment,
                    a.attachment.url if a.attachment else '',
                    a.timestamp.strftime('%Y-%m-%d %H:%M')
                ])
            response = HttpResponse(output.getvalue(), content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="procurement_audit_{req.id}.csv"'
            return response
        elif format == 'pdf':
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            y = 750
            p.setFont('Helvetica', 10)
            p.drawString(30, y, f'Audit Trail for Procurement Request #{req.id}')
            y -= 20
            for a in audits:
                line = f"{a.timestamp.strftime('%Y-%m-%d %H:%M')} - {a.actor.get_full_name() if a.actor else ''} - {a.action}: {a.comment}"
                p.drawString(30, y, line)
                y -= 15
                if y < 50:
                    p.showPage()
                    y = 750
            p.save()
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="procurement_audit_{req.id}.pdf"'
            return response
        return Response({'error': 'Invalid format'}, status=400)

    from rest_framework.permissions import IsAuthenticated
    from hr.models import Notification
    from django.core.mail import send_mail

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        req = self.get_object()
        user = request.user
        if req.status != 'pending' or user != req.approver:
            return Response({'detail': 'Not allowed to approve at this stage.'}, status=403)
        try:
            req.approve(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
        Notification.objects.create(user=req.created_by, message="Your procurement request was approved or escalated.")
        send_mail(
            'Procurement Request Update',
            'Your procurement request was approved or escalated to the next stage.',
            'procurement@yourcompany.com', [req.created_by.email]
        )
        return Response({'status': req.status, 'stage': req.approval_stage})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def decline(self, request, pk=None):
        req = self.get_object()
        user = request.user
        if req.status != 'pending' or user != req.approver:
            return Response({'detail': 'Not allowed to decline at this stage.'}, status=403)
        try:
            req.decline(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
        Notification.objects.create(user=req.created_by, message="Your procurement request was declined.")
        send_mail(
            'Procurement Request Declined',
            'Your procurement request has been declined.',
            'procurement@yourcompany.com', [req.created_by.email]
        )
        return Response({'status': req.status})
