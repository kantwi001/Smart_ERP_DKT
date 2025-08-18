from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal

User = get_user_model()

class ProcurementWorkflowStage(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)
    class Meta:
        ordering = ["order"]
    def __str__(self):
        return self.name

from hr.models import Department, Employee

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class ProcurementRequest(models.Model):
    APPROVAL_STAGES = [
        ('requester', 'Requester'),
        ('hod', 'HOD'),
        ('cd', 'Country Director'),
        ('procurement_manager', 'Procurement Manager'),
        ('procurement_officer', 'Procurement Officer'),
        ('finance_manager', 'Finance Manager'),
        ('finance_officer', 'Finance Officer'),
        ('final_approval', 'Final Approval'),
        ('completed', 'Completed'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    item = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    urgency = models.CharField(max_length=20, choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium')
    reason = models.TextField(blank=True)
    
    # Workflow Status
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    current_stage = models.CharField(max_length=30, choices=APPROVAL_STAGES, default='requester')
    current_approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='pending_proc_approvals')
    
    # Custom approval stage for simplified workflow
    approval_stage = models.CharField(
        max_length=30, 
        choices=[
            ('requester', 'Requester'),
            ('hod', 'HOD'),
            ('cd', 'Country Director'),
            ('procurement_manager', 'Procurement Manager'),
            ('procurement_officer', 'Procurement Officer'),
            ('finance_manager', 'Finance Manager'),
            ('finance_officer', 'Finance Officer'),
            ('final_approval', 'Final Approval'),
        ], 
        default='requester'
    )
    
    # Assignments
    assigned_procurement_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_procurements')
    assigned_finance_officer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_finance_tasks')
    
    # Vendor and Bid Information
    selected_vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True)
    bid_analysis_report = models.FileField(upload_to='procurement/bid_analysis/', null=True, blank=True)
    
    # Purchase Order Information
    po_number = models.CharField(max_length=50, blank=True)
    po_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    po_generated_at = models.DateTimeField(null=True, blank=True)
    
    # Payment Information
    payment_voucher_number = models.CharField(max_length=50, blank=True)
    cheque_number = models.CharField(max_length=50, blank=True)
    payment_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Metadata
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_proc_requests')
    workflow_instance = models.ForeignKey('workflows.WorkflowInstance', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        # On creation, set approver to department head
        if not self.pk and self.created_by and hasattr(self.created_by, 'employee'):
            # Set initial approver to department head
            employee = self.created_by.employee
            if employee.department and employee.department.supervisor:
                self.current_approver = employee.department.supervisor
                self.approval_stage = 'hod'
                self.status = 'pending'  # Set status to pending when submitted
        
        super().save(*args, **kwargs)
        
        # Send notification for new requests
        if not self.pk and self.status == 'pending':
            self.send_notification('request_submitted')
    
    def approve(self, user):
        """Approve the procurement request and move to next stage"""
        if self.status != 'pending' or user != self.current_approver:
            raise PermissionError('Not allowed to approve at this stage.')
        
        # Move to next stage based on current approval stage
        if self.approval_stage == 'hod':
            # Move to procurement review
            procurement_users = User.objects.filter(role='procurement')
            if procurement_users.exists():
                self.current_approver = procurement_users.first()
                self.approval_stage = 'procurement_manager'
                self.save()
            else:
                # Skip to finance if no procurement users
                finance_users = User.objects.filter(role='finance')
                if finance_users.exists():
                    self.current_approver = finance_users.first()
                    self.approval_stage = 'finance_manager'
                    self.save()
                else:
                    # Auto-complete if no finance users
                    self.status = 'approved'
                    self.approval_stage = 'final_approval'
                    self.current_approver = None
                    self.save()
        elif self.approval_stage == 'procurement_manager':
            # Move to finance review
            finance_users = User.objects.filter(role='finance')
            if finance_users.exists():
                self.current_approver = finance_users.first()
                self.approval_stage = 'finance_manager'
                self.save()
            else:
                # Auto-complete if no finance users
                self.status = 'approved'
                self.approval_stage = 'final_approval'
                self.current_approver = None
                self.save()
        elif self.approval_stage == 'finance_manager':
            self.status = 'approved'
            self.approval_stage = 'final_approval'
            self.current_approver = None
            self.save()
    
    def reject(self, user):
        """Reject the procurement request"""
        if self.status != 'pending' or user != self.current_approver:
            raise PermissionError('Not allowed to reject at this stage.')
        self.status = 'rejected'
        self.approval_stage = 'final_approval'
        self.current_approver = None
        self.save()
    
    def send_notification(self, notification_type):
        """Send notifications for procurement workflow"""
        try:
            from notifications.models import Notification, NotificationChannel
            
            # Get or create a default notification channel
            channel, created = NotificationChannel.objects.get_or_create(
                name='System',
                defaults={
                    'channel_type': 'email',
                    'is_enabled': True
                }
            )
            
            if notification_type == 'request_submitted':
                if self.current_approver:
                    Notification.objects.create(
                        recipient=self.current_approver,
                        channel=channel,
                        subject=f"New Procurement Request - {self.created_by.get_full_name() if self.created_by else 'Unknown'}",
                        message=f"A new procurement request has been submitted for {self.item} with estimated cost of ${self.estimated_cost or 'TBD'}.",
                        notification_type='procurement_request',
                        reference_id=str(self.id),
                        reference_type='procurement_request'
                    )
            elif notification_type == 'request_approved':
                if self.created_by:
                    Notification.objects.create(
                        recipient=self.created_by,
                        channel=channel,
                        subject="Procurement Request Approved",
                        message=f"Your procurement request for {self.item} has been approved at the {self.approval_stage.upper()} stage.",
                        notification_type='procurement_approval',
                        reference_id=str(self.id),
                        reference_type='procurement_request'
                    )
            elif notification_type == 'request_rejected':
                if self.created_by:
                    Notification.objects.create(
                        recipient=self.created_by,
                        channel=channel,
                        subject="Procurement Request Rejected",
                        message=f"Your procurement request for {self.item} has been rejected at the {self.approval_stage.upper()} stage.",
                        notification_type='procurement_decline',
                        reference_id=str(self.id),
                        reference_type='procurement_request'
                    )
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send procurement notification: {str(e)}")
    
    def advance_workflow(self, approver, action='approve', comment='', assignment=None):
        """Advance the workflow to the next stage"""
        if self.current_approver != approver and not approver.is_superuser:
            raise PermissionError('Not authorized to take action on this request')
        
        if action == 'reject':
            self.status = 'rejected'
            self.save()
            return
        
        # Handle stage progression
        stage_order = [stage[0] for stage in self.APPROVAL_STAGES]
        current_index = stage_order.index(self.current_stage)
        
        if self.current_stage == 'hod':
            self.current_stage = 'cd'
            self.current_approver = self.get_next_approver('hod')
        elif self.current_stage == 'cd':
            self.current_stage = 'procurement_manager'
            self.current_approver = self.get_next_approver('cd')
        elif self.current_stage == 'procurement_manager':
            if assignment:
                self.assigned_procurement_officer = assignment
                self.current_stage = 'procurement_officer'
                self.current_approver = assignment
        elif self.current_stage == 'procurement_officer':
            self.current_stage = 'finance_manager'
            self.current_approver = self.get_next_approver('procurement_officer')
        elif self.current_stage == 'finance_manager':
            if assignment:
                self.assigned_finance_officer = assignment
                self.current_stage = 'finance_officer'
                self.current_approver = assignment
        elif self.current_stage == 'finance_officer':
            self.current_stage = 'final_approval'
            self.current_approver = self.get_next_approver('finance_officer')
        elif self.current_stage == 'final_approval':
            self.current_stage = 'completed'
            self.status = 'completed'
            self.current_approver = None
        
        self.save()
    
    def generate_po_number(self):
        """Generate a unique PO number"""
        if not self.po_number:
            import datetime
            year = datetime.datetime.now().year
            count = ProcurementRequest.objects.filter(
                po_number__isnull=False,
                created_at__year=year
            ).count() + 1
            self.po_number = f'PO-{year}-{count:04d}'
            self.po_generated_at = timezone.now()
            self.save()
        return self.po_number
    
    def __str__(self):
        return f'{self.title} - {self.get_status_display()}'
    
    class Meta:
        ordering = ['-created_at']

class ProcurementApproval(models.Model):
    """Track individual approval actions in the procurement workflow"""
    procurement_request = models.ForeignKey(ProcurementRequest, on_delete=models.CASCADE, related_name='approvals')
    approver = models.ForeignKey(User, on_delete=models.CASCADE)
    stage = models.CharField(max_length=30, choices=ProcurementRequest.APPROVAL_STAGES)
    action = models.CharField(max_length=20, choices=[('approve', 'Approve'), ('reject', 'Reject'), ('assign', 'Assign')])
    comment = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.procurement_request.title} - {self.get_action_display()} by {self.approver.get_full_name()}'
    
    class Meta:
        ordering = ['-created_at']

class BidAnalysis(models.Model):
    """Store bid analysis information for procurement requests"""
    procurement_request = models.OneToOneField(ProcurementRequest, on_delete=models.CASCADE, related_name='bid_analysis')
    analyzed_by = models.ForeignKey(User, on_delete=models.CASCADE)
    vendor_quotes = models.JSONField(default=dict)  # Store multiple vendor quotes
    analysis_notes = models.TextField()
    recommendation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Bid Analysis for {self.procurement_request.title}'

class PurchaseOrder(models.Model):
    """Purchase Order model linked to procurement requests"""
    procurement_request = models.OneToOneField(ProcurementRequest, on_delete=models.CASCADE, related_name='purchase_order')
    po_number = models.CharField(max_length=50, unique=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    terms_and_conditions = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'PO {self.po_number} - {self.vendor.name}'
    
    class Meta:
        ordering = ['-created_at']

class PaymentVoucher(models.Model):
    """Payment voucher for approved purchase orders"""
    purchase_order = models.OneToOneField(PurchaseOrder, on_delete=models.CASCADE, related_name='payment_voucher')
    voucher_number = models.CharField(max_length=50, unique=True)
    cheque_number = models.CharField(max_length=50, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    prepared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prepared_vouchers')
    approved_by_finance = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_vouchers')
    approved_by_cd = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='final_approved_vouchers')
    status = models.CharField(max_length=20, choices=[('draft', 'Draft'), ('pending', 'Pending'), ('approved', 'Approved')], default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'Voucher {self.voucher_number} - {self.purchase_order.po_number}'
    
    class Meta:
        ordering = ['-created_at']

class ProcurementAudit(models.Model):
    """Audit trail for procurement request actions"""
    procurement_request = models.ForeignKey(ProcurementRequest, on_delete=models.CASCADE, related_name='audits')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    comment = models.TextField(blank=True)
    attachment = models.FileField(upload_to='procurement_audit/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.procurement_request.title} - {self.action} by {self.actor}"
    
    class Meta:
        ordering = ['-timestamp']
