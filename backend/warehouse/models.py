from django.db import models
from django.contrib.auth import get_user_model
from inventory.models import Product

User = get_user_model()

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    capacity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class WarehouseLocation(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='locations')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    aisle = models.CharField(max_length=10, blank=True)
    shelf = models.CharField(max_length=10, blank=True)
    bin = models.CharField(max_length=10, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['warehouse', 'code']

    def __str__(self):
        return f"{self.warehouse.name} - {self.name}"

class WarehouseTransfer(models.Model):
    TRANSFER_STATUS = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    transfer_number = models.CharField(max_length=50, unique=True)
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='outgoing_transfers')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='incoming_transfers')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=TRANSFER_STATUS, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Request details
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='requested_transfers')
    request_date = models.DateTimeField(auto_now_add=True)
    request_notes = models.TextField(blank=True)
    expected_delivery_date = models.DateTimeField(null=True, blank=True)
    
    # Approval details
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_transfers')
    approval_date = models.DateTimeField(null=True, blank=True)
    approval_notes = models.TextField(blank=True)
    
    # Completion details
    completed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_transfers')
    completion_date = models.DateTimeField(null=True, blank=True)
    actual_quantity_sent = models.PositiveIntegerField(null=True, blank=True)
    actual_quantity_received = models.PositiveIntegerField(null=True, blank=True)
    
    # Tracking
    waybill_number = models.CharField(max_length=100, blank=True)
    waybill_attachment = models.FileField(upload_to='waybills/', null=True, blank=True)
    tracking_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Transfer {self.transfer_number}: {self.product.name} from {self.from_warehouse.name} to {self.to_warehouse.name}"

    def save(self, *args, **kwargs):
        if not self.transfer_number:
            # Generate transfer number: TRF-YYYYMMDD-XXXX
            from django.utils import timezone
            today = timezone.now().strftime('%Y%m%d')
            last_transfer = WarehouseTransfer.objects.filter(
                transfer_number__startswith=f'TRF-{today}'
            ).order_by('-transfer_number').first()
            
            if last_transfer:
                last_num = int(last_transfer.transfer_number.split('-')[-1])
                new_num = f"{last_num + 1:04d}"
            else:
                new_num = "0001"
                
            self.transfer_number = f"TRF-{today}-{new_num}"
        
        super().save(*args, **kwargs)

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
        ('transfer', 'Transfer'),
        ('adjustment', 'Adjustment'),
    ]
    
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE)
    location = models.ForeignKey(WarehouseLocation, on_delete=models.CASCADE, null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    transfer = models.ForeignKey(WarehouseTransfer, on_delete=models.CASCADE, null=True, blank=True, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    reference = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.warehouse.name} - {self.movement_type} - {self.quantity}"

class WarehouseStock(models.Model):
    """Track product stock levels per warehouse"""
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stock_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='warehouse_stocks')
    quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)  # For pending orders/transfers
    min_stock_level = models.PositiveIntegerField(default=0)
    max_stock_level = models.PositiveIntegerField(null=True, blank=True)
    location = models.ForeignKey(WarehouseLocation, on_delete=models.SET_NULL, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['warehouse', 'product']
        indexes = [
            models.Index(fields=['warehouse', 'product']),
            models.Index(fields=['quantity']),
        ]

    def __str__(self):
        return f"{self.warehouse.name} - {self.product.name}: {self.quantity}"

    @property
    def available_quantity(self):
        """Available quantity after reservations"""
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        """Check if stock is below minimum level"""
        return self.quantity <= self.min_stock_level

    @property
    def is_out_of_stock(self):
        """Check if completely out of stock"""
        return self.quantity == 0
