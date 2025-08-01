from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
        ('accountant', 'Accountant'),
        ('sales', 'Salesperson'),
        ('cashier', 'POS Cashier'),
    ]
    
    # ERP Module Access Control
    MODULE_CHOICES = [
        ('dashboard', 'Dashboard'),
        ('inventory', 'Inventory Management'),
        ('warehouse', 'Warehouse Management'),
        ('sales', 'Sales Management'),
        ('accounting', 'Accounting'),
        ('manufacturing', 'Manufacturing'),
        ('procurement', 'Procurement'),
        ('hr', 'Human Resources'),
        ('pos', 'Point of Sale'),
        ('reporting', 'Reporting & Analytics'),
        ('customers', 'Customer Management'),
        ('users', 'User Management'),
        ('surveys', 'Survey Management'),
        ('route_planning', 'Route Planning'),
        ('survey_admin', 'Survey Administration'),
        ('powerbi', 'PowerBI Integration'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLES, default='employee')
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey('hr.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    assigned_warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_users', help_text='Warehouse assigned to this user (for Sales Reps)')
    
    # Profile fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True, help_text='User profile picture')
    bio = models.TextField(max_length=500, blank=True, help_text='User biography/description')
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(max_length=300, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # Module access permissions - JSON field to store list of accessible modules
    accessible_modules = models.JSONField(default=list, blank=True, help_text="List of modules this user can access")
    
    # Security settings
    is_module_restricted = models.BooleanField(default=False, help_text="Whether this user has module access restrictions")
    last_module_update = models.DateTimeField(auto_now=True, help_text="Last time module permissions were updated")
    
    def has_module_access(self, module_name):
        """Check if user has access to a specific module"""
        # Superadmins have access to all modules
        if self.role == 'superadmin':
            return True
        
        # If not module restricted, allow access based on role
        if not self.is_module_restricted:
            return True
        
        # Check if module is in accessible_modules list
        return module_name in self.accessible_modules
    
    def get_accessible_modules(self):
        """Get list of modules this user can access"""
        if self.role == 'superadmin':
            return [choice[0] for choice in self.MODULE_CHOICES]
        
        if not self.is_module_restricted:
            # Default modules based on role
            role_modules = {
                'admin': ['dashboard', 'inventory', 'sales', 'accounting', 'hr', 'reporting', 'customers', 'users'],
                'manager': ['dashboard', 'inventory', 'sales', 'reporting', 'customers'],
                'accountant': ['dashboard', 'accounting', 'reporting'],
                'sales': ['dashboard', 'sales', 'customers', 'pos'],
                'cashier': ['dashboard', 'pos'],
                'employee': ['dashboard'],
            }
            return role_modules.get(self.role, ['dashboard'])
        
        return self.accessible_modules
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    class Meta:
        db_table = 'auth_user'


class SystemSettings(models.Model):
    """Model to store system-wide configuration settings"""
    
    # General Settings
    site_name = models.CharField(max_length=100, default='ERP System')
    site_description = models.TextField(default='Enterprise Resource Planning System')
    maintenance_mode = models.BooleanField(default=False)
    registration_enabled = models.BooleanField(default=True)
    default_user_role = models.CharField(max_length=20, choices=User.ROLES, default='employee')
    session_timeout = models.IntegerField(default=30, help_text='Session timeout in minutes')
    max_login_attempts = models.IntegerField(default=5)
    password_min_length = models.IntegerField(default=8)
    require_password_complexity = models.BooleanField(default=True)
    enable_two_factor = models.BooleanField(default=False)
    backup_frequency = models.CharField(max_length=20, default='daily')
    log_retention_days = models.IntegerField(default=90)
    
    # SMTP Settings
    smtp_enabled = models.BooleanField(default=False)
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=255, blank=True)
    smtp_password = models.CharField(max_length=255, blank=True)
    smtp_use_tls = models.BooleanField(default=True)
    smtp_use_ssl = models.BooleanField(default=False)
    smtp_from_email = models.EmailField(blank=True)
    smtp_from_name = models.CharField(max_length=100, default='ERP System')
    
    # Notification Settings
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    user_registration_notifications = models.BooleanField(default=True)
    password_reset_notifications = models.BooleanField(default=True)
    system_alerts = models.BooleanField(default=True)
    maintenance_notices = models.BooleanField(default=True)
    security_alerts = models.BooleanField(default=True)
    daily_reports = models.BooleanField(default=False)
    weekly_reports = models.BooleanField(default=True)
    monthly_reports = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'
    
    def __str__(self):
        return f"System Settings - {self.site_name}"
    
    @classmethod
    def get_settings(cls):
        """Get or create system settings singleton"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings
