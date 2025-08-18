from django.db import models
from django.conf import settings

class Customer(models.Model):
    CUSTOMER_TYPE_CHOICES = [
        ('wholesaler', 'Wholesaler'),
        ('distributor', 'Distributor'),
        ('retailer', 'Retailer'),
    ]
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES, default='retailer')
    payment_terms = models.PositiveIntegerField(default=30, help_text='Days allowed for payment (e.g. 30, 60, 120)')
    is_blacklisted = models.BooleanField(default=False)
    
    # GPS coordinates for mapping
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, help_text='GPS Latitude')
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, help_text='GPS Longitude')
    location_accuracy = models.FloatField(null=True, blank=True, help_text='GPS accuracy in meters')
    location_timestamp = models.DateTimeField(null=True, blank=True, help_text='When location was captured')

    def check_and_update_blacklist(self):
        # Blacklist if any unpaid sale is overdue
        from django.utils import timezone
        overdue = Sale.objects.filter(
            customer=self,
            status__in=['pending','unpaid'],
            date__lt=timezone.now()-timezone.timedelta(days=self.payment_terms)
        ).exists()
        if overdue:
            self.is_blacklisted = True
            self.save()
        return self.is_blacklisted

class CustomerApproval(models.Model):
    """
    Model to handle customer approval workflow.
    Sales Reps create customers that need approval from Sales Managers.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    CUSTOMER_TYPE_CHOICES = [
        ('wholesaler', 'Wholesaler'),
        ('distributor', 'Distributor'),
        ('retailer', 'Retailer'),
    ]
    
    # Customer details (pending approval)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES, default='retailer')
    payment_terms = models.PositiveIntegerField(default=30, help_text='Days allowed for payment')
    
    # GPS coordinates for mapping
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True, help_text='GPS Latitude')
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True, help_text='GPS Longitude')
    location_accuracy = models.FloatField(null=True, blank=True, help_text='GPS accuracy in meters')
    location_timestamp = models.DateTimeField(null=True, blank=True, help_text='When location was captured')
    
    # Approval workflow fields
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_customers')
    approved_customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPE_CHOICES, blank=True, help_text='Customer type set by approver')
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # Reference to created customer (after approval)
    customer = models.ForeignKey('Customer', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"Customer Request: {self.name} ({self.status})"
    
    class Meta:
        ordering = ['-created_at']

class Quote(models.Model):
    """Model for sales quotes/estimates"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='quotes')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Workflow fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_quotes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # Auto-calculate total if unit_price is set
        if self.unit_price:
            self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Quote #{self.id} - {self.customer.name} - {self.product.name}"
    
    class Meta:
        ordering = ['-created_at']

class Lead(models.Model):
    """Model for sales leads"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'In Negotiation'),
        ('won', 'Won'),
        ('lost', 'Lost'),
    ]
    
    SOURCE_CHOICES = [
        ('website', 'Website'),
        ('referral', 'Referral'),
        ('cold_call', 'Cold Call'),
        ('social_media', 'Social Media'),
        ('trade_show', 'Trade Show'),
        ('advertisement', 'Advertisement'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=100, blank=True)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)
    
    # Workflow fields
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_contact_date = models.DateTimeField(null=True, blank=True)
    
    # Potential value
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"Lead: {self.name} ({self.company}) - {self.status}"
    
    class Meta:
        ordering = ['-created_at']

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
        ('mobile_money', 'Mobile Money'),
        ('credit', 'Credit'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True)
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    date = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='pending')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='SLL')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')

class Promotion(models.Model):
    """Model for sales promotions with product binding and price reduction"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('expired', 'Expired'),
        ('scheduled', 'Scheduled'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    apply_to_all = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Workflow fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_promotions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Many-to-many relationship with products (for general promotions)
    applicable_products = models.ManyToManyField('inventory.Product', blank=True, related_name='promotions')
    
    def __str__(self):
        return f"Promotion: {self.name} ({self.discount_value}{'' if self.discount_type == 'fixed' else '%'})"
    
    def is_active(self):
        """Check if promotion is currently active"""
        from django.utils import timezone
        now = timezone.now().date()
        
        if self.status != 'active':
            return False
            
        if self.start_date and now < self.start_date:
            return False
            
        if self.end_date and now > self.end_date:
            return False
            
        return True
    
    def calculate_discount(self, amount):
        """Calculate discount amount for a given order amount"""
        if not self.is_active() or amount < self.minimum_order:
            return 0
            
        if self.discount_type == 'percentage':
            return amount * (self.discount_value / 100)
        else:
            return min(self.discount_value, amount)  # Don't exceed order amount
    
    class Meta:
        ordering = ['-created_at']

class PromotionProduct(models.Model):
    """Model for specific product pricing in promotions"""
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='product_pricing')
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Auto-calculate discount amount
        self.discount_amount = self.original_price - self.discounted_price
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.promotion.name} - {self.product.name}: {self.original_price} → {self.discounted_price}"
    
    class Meta:
        unique_together = ['promotion', 'product']
        ordering = ['product__name']
