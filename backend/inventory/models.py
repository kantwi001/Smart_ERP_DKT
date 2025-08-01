from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

class Product(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    sku = models.CharField(max_length=50, unique=True)
    quantity = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ProductPrice(models.Model):
    CURRENCY_CHOICES = [
        ('SLL', 'Sierra Leonean Leone'),
        ('USD', 'US Dollar'),
        ('LRD', 'Liberian Dollar'),
        ('GHS', 'Ghana Cedi'),
    ]
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='prices')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('product', 'currency')

class InventoryTransfer(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    from_location = models.CharField(max_length=100)
    to_location = models.CharField(max_length=100)
    requested_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=30, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transfer {self.id}: {self.product.name} x{self.quantity} from {self.from_location} to {self.to_location}"
