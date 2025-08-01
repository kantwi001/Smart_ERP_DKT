from django.db import models

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
    session = models.ForeignKey(POSSession, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='SLL')
