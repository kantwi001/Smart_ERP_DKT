from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class NotificationChannel(models.Model):
    """Configuration for different notification channels"""
    CHANNEL_TYPES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    name = models.CharField(max_length=50)
    channel_type = models.CharField(max_length=10, choices=CHANNEL_TYPES)
    is_enabled = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict)  # Store channel-specific config
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_channel_type_display()})"

class NotificationTemplate(models.Model):
    """Templates for different types of notifications"""
    TEMPLATE_TYPES = [
        ('transfer_request', 'Transfer Request'),
        ('transfer_approved', 'Transfer Approved'),
        ('transfer_rejected', 'Transfer Rejected'),
        ('transfer_completed', 'Transfer Completed'),
    ]
    
    name = models.CharField(max_length=100)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPES)
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE)
    subject_template = models.CharField(max_length=200, blank=True)  # For email/SMS
    body_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['template_type', 'channel']
    
    def __str__(self):
        return f"{self.name} - {self.channel.name}"

class Notification(models.Model):
    """Individual notification records"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    ]
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    channel = models.ForeignKey(NotificationChannel, on_delete=models.CASCADE)
    template = models.ForeignKey(NotificationTemplate, on_delete=models.CASCADE)
    
    # Content
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    
    # Metadata
    notification_type = models.CharField(max_length=20)
    reference_id = models.CharField(max_length=100, blank=True)  # Link to transfer, order, etc.
    reference_type = models.CharField(max_length=50, blank=True)  # 'transfer', 'order', etc.
    
    # Status tracking
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Response tracking (for approvals)
    requires_response = models.BooleanField(default=False)
    response_data = models.JSONField(default=dict, blank=True)
    response_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} to {self.recipient.username} via {self.channel.name}"
    
    def mark_as_sent(self):
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save()
    
    def mark_as_read(self):
        self.status = 'read'
        self.read_at = timezone.now()
        self.save()

class TransferApproval(models.Model):
    """Track transfer approval workflow"""
    APPROVAL_STATUS = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    # Link to inventory transfer
    transfer = models.OneToOneField('inventory.InventoryTransfer', on_delete=models.CASCADE, related_name='approval')
    
    # Approval details
    approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='transfer_approvals')
    status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='pending')
    
    # Workflow tracking
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)  # Auto-expire after X hours
    
    # Approval details
    approval_notes = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Notification tracking
    notifications_sent = models.JSONField(default=list)  # Track which notifications were sent
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Transfer {self.transfer.id} - {self.get_status_display()}"
    
    def approve(self, approver, notes=""):
        self.status = 'approved'
        self.approver = approver
        self.approval_notes = notes
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update the transfer status
        self.transfer.status = 'approved'
        self.transfer.save()
    
    def reject(self, approver, reason=""):
        self.status = 'rejected'
        self.approver = approver
        self.rejection_reason = reason
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update the transfer status
        self.transfer.status = 'rejected'
        self.transfer.save()
    
    def is_expired(self):
        if self.expires_at and timezone.now() > self.expires_at:
            return True
        return False
