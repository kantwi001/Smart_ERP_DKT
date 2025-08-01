from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import json

User = get_user_model()

class WorkflowTemplate(models.Model):
    """
    Defines reusable workflow templates for different business processes
    """
    WORKFLOW_TYPES = [
        ('staff_request', 'Staff Request'),
        ('procurement', 'Procurement'),
        ('leave_request', 'Leave Request'),
        ('it_ticket', 'IT Ticket'),
        ('expense_claim', 'Expense Claim'),
        ('asset_request', 'Asset Request'),
        ('custom', 'Custom Workflow'),
    ]
    
    name = models.CharField(max_length=200)
    workflow_type = models.CharField(max_length=50, choices=WORKFLOW_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_workflows')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Configuration settings
    auto_approve_threshold = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Auto-approve requests below this amount")
    require_manager_approval = models.BooleanField(default=True)
    require_finance_approval = models.BooleanField(default=False)
    require_hr_approval = models.BooleanField(default=False)
    require_it_approval = models.BooleanField(default=False)
    escalation_days = models.IntegerField(default=3, help_text="Days before escalation")
    
    class Meta:
        unique_together = ['workflow_type', 'is_default']
    
    def __str__(self):
        return f"{self.name} ({self.get_workflow_type_display()})"

class WorkflowStep(models.Model):
    """
    Individual steps in a workflow template
    """
    STEP_TYPES = [
        ('approval', 'Approval Step'),
        ('notification', 'Notification Step'),
        ('condition', 'Conditional Step'),
        ('action', 'Action Step'),
    ]
    
    APPROVER_TYPES = [
        ('direct_manager', 'Direct Manager'),
        ('department_head', 'Department Head'),
        ('finance_manager', 'Finance Manager'),
        ('hr_manager', 'HR Manager'),
        ('it_manager', 'IT Manager'),
        ('procurement_manager', 'Procurement Manager'),
        ('country_director', 'Country Director'),
        ('specific_user', 'Specific User'),
        ('role_based', 'Role Based'),
    ]
    
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.CASCADE, related_name='steps')
    step_order = models.IntegerField()
    name = models.CharField(max_length=200)
    step_type = models.CharField(max_length=20, choices=STEP_TYPES, default='approval')
    approver_type = models.CharField(max_length=30, choices=APPROVER_TYPES, null=True, blank=True)
    specific_approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    required_role = models.CharField(max_length=50, null=True, blank=True)
    
    # Conditions
    condition_field = models.CharField(max_length=100, null=True, blank=True)
    condition_operator = models.CharField(max_length=20, null=True, blank=True)  # gt, lt, eq, contains, etc.
    condition_value = models.CharField(max_length=200, null=True, blank=True)
    
    # Settings
    is_required = models.BooleanField(default=True)
    timeout_hours = models.IntegerField(default=72, help_text="Hours before timeout")
    allow_delegate = models.BooleanField(default=True)
    send_notification = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['step_order']
        unique_together = ['template', 'step_order']
    
    def __str__(self):
        return f"{self.template.name} - Step {self.step_order}: {self.name}"

class WorkflowInstance(models.Model):
    """
    Active workflow instances for specific requests
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
        ('escalated', 'Escalated'),
    ]
    
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.CASCADE)
    instance_id = models.CharField(max_length=100, unique=True)  # Reference to the actual request
    
    # Generic foreign key to link to any model (LeaveRequest, ProcurementRequest, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    current_step = models.ForeignKey(WorkflowStep, on_delete=models.SET_NULL, null=True, blank=True)
    
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflow_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    request_data = models.JSONField(default=dict, help_text="Snapshot of request data")
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.template.name} - {self.instance_id}"

class WorkflowApproval(models.Model):
    """
    Individual approval actions within a workflow instance
    """
    ACTION_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('delegated', 'Delegated'),
        ('escalated', 'Escalated'),
    ]
    
    workflow_instance = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='approvals')
    step = models.ForeignKey(WorkflowStep, on_delete=models.CASCADE)
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflow_approvals')
    
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, default='pending')
    comments = models.TextField(blank=True)
    
    # Delegation
    delegated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='delegated_approvals')
    
    # Timestamps
    assigned_at = models.DateTimeField(auto_now_add=True)
    action_taken_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['workflow_instance', 'step', 'approver']
    
    def __str__(self):
        return f"{self.workflow_instance.instance_id} - {self.step.name} - {self.approver.username}"

class WorkflowNotification(models.Model):
    """
    Notifications sent during workflow execution
    """
    NOTIFICATION_TYPES = [
        ('assignment', 'Assignment'),
        ('reminder', 'Reminder'),
        ('escalation', 'Escalation'),
        ('completion', 'Completion'),
        ('rejection', 'Rejection'),
    ]
    
    CHANNELS = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
        ('push', 'Push Notification'),
    ]
    
    workflow_instance = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    channel = models.CharField(max_length=20, choices=CHANNELS)
    
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient.username} - {self.workflow_instance.instance_id}"

class WorkflowAuditLog(models.Model):
    """
    Audit trail for workflow actions
    """
    workflow_instance = models.ForeignKey(WorkflowInstance, on_delete=models.CASCADE, related_name='audit_logs')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.workflow_instance.instance_id} - {self.action} - {self.timestamp}"

class WorkflowConfiguration(models.Model):
    """
    Global workflow system configuration
    """
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.key
