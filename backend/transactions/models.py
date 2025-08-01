# transactions/models.py - Backend transaction models for ERP module integration
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import json

User = get_user_model()

class Transaction(models.Model):
    """
    Core transaction model that tracks all cross-module transactions
    """
    TRANSACTION_TYPES = [
        ('SALES_ORDER_CREATED', 'Sales Order Created'),
        ('PURCHASE_ORDER_CREATED', 'Purchase Order Created'),
        ('PRODUCTION_ORDER_CREATED', 'Production Order Created'),
        ('INVENTORY_MOVEMENT', 'Inventory Movement'),
        ('WAREHOUSE_TRANSFER', 'Warehouse Transfer'),
        ('PAYROLL_PROCESSED', 'Payroll Processed'),
        ('POS_SALE_COMPLETED', 'POS Sale Completed'),
        ('CUSTOMER_CREATED', 'Customer Created'),
        ('INVOICE_GENERATED', 'Invoice Generated'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('STOCK_ADJUSTMENT', 'Stock Adjustment'),
        ('MATERIAL_REQUEST', 'Material Request'),
        ('QUALITY_CHECK', 'Quality Check'),
        ('SHIPMENT_CREATED', 'Shipment Created'),
        ('RETURN_PROCESSED', 'Return Processed'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    MODULE_CHOICES = [
        ('sales', 'Sales'),
        ('inventory', 'Inventory'),
        ('procurement', 'Procurement'),
        ('manufacturing', 'Manufacturing'),
        ('accounting', 'Accounting'),
        ('hr', 'Human Resources'),
        ('pos', 'Point of Sale'),
        ('warehouse', 'Warehouse'),
        ('customers', 'Customers'),
        ('reporting', 'Reporting'),
    ]

    # Core fields
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    
    # Module relationships
    source_module = models.CharField(max_length=20, choices=MODULE_CHOICES, db_index=True)
    target_modules = models.JSONField(default=list)  # List of target modules
    
    # Transaction data
    transaction_data = models.JSONField(default=dict)
    metadata = models.JSONField(default=dict)
    
    # Financial data
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default='USD')
    
    # Audit fields
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Error handling
    error_message = models.TextField(blank=True)
    retry_count = models.IntegerField(default=0)
    
    # Workflow tracking
    workflow_id = models.CharField(max_length=100, blank=True, db_index=True)
    workflow_step = models.IntegerField(null=True, blank=True)
    parent_transaction = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['source_module', 'created_at']),
            models.Index(fields=['transaction_type', 'status']),
            models.Index(fields=['workflow_id', 'workflow_step']),
        ]

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_id}"

    def save(self, *args, **kwargs):
        if not self.transaction_id:
            self.transaction_id = self.generate_transaction_id()
        
        if self.status == 'completed' and not self.completed_at:
            self.completed_at = timezone.now()
            
        super().save(*args, **kwargs)

    def generate_transaction_id(self):
        """Generate unique transaction ID"""
        import uuid
        return f"TXN-{timezone.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

    def get_target_modules_display(self):
        """Get display names for target modules"""
        module_dict = dict(self.MODULE_CHOICES)
        return [module_dict.get(module, module) for module in self.target_modules]

    def is_cross_module(self):
        """Check if this is a cross-module transaction"""
        return len(self.target_modules) > 0 and self.source_module not in self.target_modules

    def get_affected_modules(self):
        """Get all modules affected by this transaction"""
        modules = set([self.source_module])
        modules.update(self.target_modules)
        return list(modules)

    def mark_completed(self, user=None):
        """Mark transaction as completed"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        if user:
            self.metadata['completed_by'] = user.id
        self.save()

    def mark_failed(self, error_message, user=None):
        """Mark transaction as failed"""
        self.status = 'failed'
        self.error_message = error_message
        if user:
            self.metadata['failed_by'] = user.id
        self.save()

    def add_metadata(self, key, value):
        """Add metadata to transaction"""
        if not self.metadata:
            self.metadata = {}
        self.metadata[key] = value
        self.save()


class TransactionLog(models.Model):
    """
    Detailed log of transaction processing steps
    """
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, related_name='logs')
    step = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=Transaction.STATUS_CHOICES)
    message = models.TextField()
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'transaction_logs'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.transaction.transaction_id} - {self.step}"


class ModuleIntegration(models.Model):
    """
    Configuration for module integration settings
    """
    source_module = models.CharField(max_length=20, choices=Transaction.MODULE_CHOICES)
    target_module = models.CharField(max_length=20, choices=Transaction.MODULE_CHOICES)
    integration_type = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    configuration = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'module_integrations'
        unique_together = ['source_module', 'target_module', 'integration_type']

    def __str__(self):
        return f"{self.source_module} -> {self.target_module} ({self.integration_type})"


class TransactionAnalytics(models.Model):
    """
    Pre-computed analytics for transaction performance
    """
    module = models.CharField(max_length=20, choices=Transaction.MODULE_CHOICES, db_index=True)
    date = models.DateField(db_index=True)
    
    # Transaction counts
    incoming_transactions = models.IntegerField(default=0)
    outgoing_transactions = models.IntegerField(default=0)
    total_transactions = models.IntegerField(default=0)
    
    # Financial metrics
    total_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    average_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Performance metrics
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_processing_time = models.DurationField(null=True, blank=True)
    
    # Top connections
    top_sources = models.JSONField(default=list)
    top_targets = models.JSONField(default=list)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transaction_analytics'
        unique_together = ['module', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.module} - {self.date}"
