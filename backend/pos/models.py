from django.db import models
from django.conf import settings
from inventory.models import Product
from sales.models import Customer

class POSSession(models.Model):
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    is_open = models.BooleanField(default=True)

class Sale(models.Model):
    CURRENCY_CHOICES = [
        ('SLL', 'Sierra Leonean Leone'),
        ('USD', 'US Dollar'),
        ('LRD', 'Liberian Dollar'),
        ('GHS', 'Ghana Cedi'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile', 'Mobile Money'),
        ('bank_transfer', 'Bank Transfer'),
    ]
    
    # Core transaction fields
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='pos_sales')
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='pos_sales')
    session = models.ForeignKey(POSSession, on_delete=models.CASCADE, null=True, blank=True)
    
    # Transaction details
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='SLL')
    
    # Metadata
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    def __str__(self):
        return f"POS Sale {self.id} - {self.product.name} - ${self.total}"
    
    class Meta:
        ordering = ['-date']
