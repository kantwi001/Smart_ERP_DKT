from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model

class Department(models.Model):
    DEPARTMENTS = [
        ('FINANCE', 'Finance'),
        ('OPERATIONS', 'Operations'),
        ('HR', 'HR'),
        ('CD', 'CD'),
        ('M&E/NBD', 'M&E/NBD'),
        ('PROGRAMS', 'Programs'),
        ('LOGISTICS/PROCUREMENT/SUPPLY CHAIN', 'Logistics/Procurement/Supply Chain'),
        ('SALES', 'Sales'),
    ]
    name = models.CharField(max_length=50, choices=DEPARTMENTS, unique=True)
    supervisor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_departments')

    def __str__(self):
        return self.get_name_display()

class Employee(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE)
    position = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

class JobPosting(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    department = models.CharField(max_length=100)
    posted_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class Application(models.Model):
    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey('users.User', on_delete=models.CASCADE)
    resume = models.FileField(upload_to='resumes/')
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('reviewed','Reviewed'),('rejected','Rejected')], default='pending')
    applied_at = models.DateTimeField(auto_now_add=True)

class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    calculated_days = models.PositiveIntegerField(default=0, help_text='Number of working days calculated for this request')
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('approved','Approved'),('declined','Declined')], default='pending')
    approver = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='leave_approvals')
    approval_stage = models.CharField(max_length=30, choices=[('hod','HOD'),('hr','HR'),('complete','Complete')], default='hod')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        # Calculate working days if not provided
        if not self.calculated_days and self.start_date and self.end_date:
            self.calculated_days = self.calculate_working_days()
        
        # On creation, set approver to employee's department supervisor (HOD)
        if not self.pk and self.employee and self.employee.department and self.employee.department.supervisor:
            self.approver = self.employee.department.supervisor
            self.approval_stage = 'hod'
            
        # Track status changes for leave balance updates
        old_status = None
        if self.pk:
            try:
                old_instance = LeaveRequest.objects.get(pk=self.pk)
                old_status = old_instance.status
            except LeaveRequest.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        # Update leave balance when status changes
        if old_status != self.status:
            self.update_leave_balance(old_status, self.status)

    def calculate_working_days(self):
        """Calculate working days between start and end date (excluding weekends)"""
        if not self.start_date or not self.end_date:
            return 0
        
        from datetime import timedelta
        current_date = self.start_date
        working_days = 0
        
        while current_date <= self.end_date:
            # Exclude weekends (Saturday = 5, Sunday = 6)
            if current_date.weekday() < 5:
                working_days += 1
            current_date += timedelta(days=1)
        
        return working_days

    def update_leave_balance(self, old_status, new_status):
        """Update employee's leave balance based on status change"""
        from datetime import datetime
        current_year = datetime.now().year
        
        # Get or create leave balance for this employee, leave type, and year
        leave_balance, created = LeaveBalance.objects.get_or_create(
            employee=self.employee,
            leave_type=self.leave_type,
            year=current_year,
            defaults={
                'total_days': 21 if self.leave_type == 'annual' else 10,  # Default allocations
                'used_days': 0,
                'pending_days': 0
            }
        )
        
        # Handle status transitions
        if old_status is None and new_status == 'pending':
            # New request - add to pending
            leave_balance.pending_days += self.calculated_days
        elif old_status == 'pending' and new_status == 'approved':
            # Approved - move from pending to used
            leave_balance.pending_days = max(0, leave_balance.pending_days - self.calculated_days)
            leave_balance.used_days += self.calculated_days
            self.reviewed_at = datetime.now()
        elif old_status == 'pending' and new_status == 'declined':
            # Declined - remove from pending
            leave_balance.pending_days = max(0, leave_balance.pending_days - self.calculated_days)
            self.reviewed_at = datetime.now()
        elif old_status == 'approved' and new_status == 'declined':
            # Reverting approval - move from used back to nothing
            leave_balance.used_days = max(0, leave_balance.used_days - self.calculated_days)
        
        leave_balance.save()

    def approve(self, user):
        if self.status != 'pending' or user != self.approver:
            raise PermissionError('Not allowed to approve at this stage.')
        if self.approval_stage == 'hod':
            # Move to HR stage
            from users.models import User
            hr_users = User.objects.filter(role='hr')
            if hr_users.exists():
                self.approver = hr_users.first()
                self.approval_stage = 'hr'
                self.save()
            else:
                # No HR, auto-complete
                self.status = 'approved'
                self.approval_stage = 'complete'
                self.approver = None
                self.save()
        elif self.approval_stage == 'hr':
            self.status = 'approved'
            self.approval_stage = 'complete'
            self.approver = None
            self.save()

    def decline(self, user):
        if self.status != 'pending' or user != self.approver:
            raise PermissionError('Not allowed to decline at this stage.')
        self.status = 'declined'
        self.approval_stage = 'complete'
        self.approver = None
        self.save()

class LeaveBalance(models.Model):
    """
    Employee leave balance tracking
    """
    LEAVE_TYPES = [
        ('annual', 'Annual Leave'),
        ('sick', 'Sick Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('compassionate', 'Compassionate Leave'),
        ('study', 'Study Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('other', 'Other'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    total_days = models.PositiveIntegerField(default=0, help_text='Total leave days allocated for the year')
    used_days = models.PositiveIntegerField(default=0, help_text='Leave days already used')
    pending_days = models.PositiveIntegerField(default=0, help_text='Leave days in pending requests')
    year = models.PositiveIntegerField(help_text='Year this balance applies to')
    carry_over_days = models.PositiveIntegerField(default=0, help_text='Days carried over from previous year')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['employee', 'leave_type', 'year']
        ordering = ['-year', 'leave_type']
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.get_leave_type_display()} ({self.year})"
    
    @property
    def available_days(self):
        """Calculate available leave days"""
        return self.total_days + self.carry_over_days - self.used_days - self.pending_days
    
    @property
    def utilization_percentage(self):
        """Calculate leave utilization percentage"""
        total_allocated = self.total_days + self.carry_over_days
        if total_allocated == 0:
            return 0
        return round((self.used_days / total_allocated) * 100, 1)
    
    def can_request_leave(self, days_requested):
        """Check if employee can request specified number of leave days"""
        return self.available_days >= days_requested
    
    def update_balance_on_request(self, days, status='pending'):
        """Update balance when leave request is made or status changes"""
        if status == 'pending':
            self.pending_days += days
        elif status == 'approved':
            self.pending_days = max(0, self.pending_days - days)
            self.used_days += days
        elif status == 'declined':
            self.pending_days = max(0, self.pending_days - days)
        self.save()

class PerformanceReview(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    period = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=[('draft','Draft'),('submitted','Submitted'),('review','In Review'),('approved','Approved'),('rejected','Rejected')], default='draft')
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approval_stage = models.CharField(max_length=30, choices=[('hod','HOD'),('hr','HR'),('complete','Complete')], default='hod')

    def save(self, *args, **kwargs):
        # On creation, set reviewer to employee's department supervisor (HOD)
        if not self.pk and self.employee and self.employee.department and self.employee.department.supervisor:
            self.reviewer = self.employee.department.supervisor
            self.approval_stage = 'hod'
        super().save(*args, **kwargs)

    def approve(self, user):
        if self.status not in ['submitted','review'] or user != self.reviewer:
            raise PermissionError('Not allowed to approve at this stage.')
        if self.approval_stage == 'hod':
            # Move to HR stage
            from users.models import User
            hr_users = User.objects.filter(role='hr')
            if hr_users.exists():
                self.reviewer = hr_users.first()
                self.approval_stage = 'hr'
                self.status = 'review'
                self.save()
            else:
                # No HR, auto-complete
                self.status = 'approved'
                self.approval_stage = 'complete'
                self.reviewer = None
                self.save()
        elif self.approval_stage == 'hr':
            self.status = 'approved'
            self.approval_stage = 'complete'
            self.reviewer = None
            self.save()

    def decline(self, user):
        if self.status not in ['submitted','review'] or user != self.reviewer:
            raise PermissionError('Not allowed to decline at this stage.')
        self.status = 'rejected'
        self.approval_stage = 'complete'
        self.reviewer = None
        self.save()

class PerformanceGoal(models.Model):
    review = models.ForeignKey(PerformanceReview, on_delete=models.CASCADE, related_name='goals')
    description = models.CharField(max_length=255)
    achieved = models.BooleanField(default=False)

class PerformanceFeedback(models.Model):
    review = models.ForeignKey(PerformanceReview, on_delete=models.CASCADE, related_name='feedbacks')
    feedback_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='hr_notifications')
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=[('present','Present'),('absent','Absent'),('late','Late')], default='present')

class Payroll(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    period = models.CharField(max_length=20)
    gross = models.DecimalField(max_digits=10, decimal_places=2)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('paid','Paid')], default='pending')
    generated_at = models.DateTimeField(auto_now_add=True)

class Announcement(models.Model):
    title = models.CharField(max_length=200)
    body = models.TextField()
    date = models.DateTimeField(auto_now_add=True)
    audience = models.CharField(max_length=100, default='all')

class TrainingSession(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    instructor = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=200, blank=True)
    attendees = models.ManyToManyField(Employee, blank=True)
    materials = models.TextField(blank=True)
    is_mandatory = models.BooleanField(default=False)
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_training_sessions', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.date}"

class TrainingMaterial(models.Model):
    """
    Training materials (policies, documents, etc.) that can be uploaded and accessed by employees
    """
    MATERIAL_TYPES = [
        ('policy', 'Policy Document'),
        ('manual', 'Training Manual'),
        ('guide', 'User Guide'),
        ('presentation', 'Presentation'),
        ('form', 'Form/Template'),
        ('other', 'Other Document'),
    ]
    
    VISIBILITY_CHOICES = [
        ('all', 'All Employees'),
        ('department', 'Department Only'),
        ('role', 'Specific Role'),
        ('custom', 'Custom Selection'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPES, default='other')
    file = models.FileField(upload_to='training_materials/', help_text='Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, PPT, PPTX')
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text='File size in bytes')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='all')
    target_departments = models.ManyToManyField(Department, blank=True, help_text='Departments that can access this material')
    target_employees = models.ManyToManyField('users.User', blank=True, help_text='Specific employees that can access this material')
    is_mandatory = models.BooleanField(default=False, help_text='Whether this material is mandatory for employees')
    expiry_date = models.DateField(null=True, blank=True, help_text='Date when this material expires')
    version = models.CharField(max_length=50, default='1.0')
    tags = models.CharField(max_length=500, blank=True, help_text='Comma-separated tags for categorization')
    uploaded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='uploaded_training_materials')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_material_type_display()})"
    
    @property
    def file_extension(self):
        """Get file extension"""
        if self.file and self.file.name:
            return self.file.name.split('.')[-1].lower()
        return ''
    
    @property
    def is_image(self):
        """Check if file is an image"""
        return self.file_extension in ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    
    @property
    def is_pdf(self):
        """Check if file is a PDF"""
        return self.file_extension == 'pdf'
    
    @property
    def is_document(self):
        """Check if file is a document"""
        return self.file_extension in ['doc', 'docx', 'txt', 'rtf']
    
    @property
    def is_presentation(self):
        """Check if file is a presentation"""
        return self.file_extension in ['ppt', 'pptx']
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

class TrainingVideo(models.Model):
    """
    Training videos that can be uploaded and accessed by employees
    """
    VIDEO_TYPES = [
        ('training', 'Training Video'),
        ('orientation', 'Orientation Video'),
        ('safety', 'Safety Training'),
        ('compliance', 'Compliance Training'),
        ('skills', 'Skills Development'),
        ('policy', 'Policy Explanation'),
        ('other', 'Other'),
    ]
    
    VISIBILITY_CHOICES = [
        ('all', 'All Employees'),
        ('department', 'Department Only'),
        ('role', 'Specific Role'),
        ('custom', 'Custom Selection'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_type = models.CharField(max_length=20, choices=VIDEO_TYPES, default='training')
    video_file = models.FileField(upload_to='training_videos/', help_text='Supported formats: MP4, AVI, MOV, WMV')
    thumbnail = models.ImageField(upload_to='training_thumbnails/', null=True, blank=True)
    duration = models.DurationField(null=True, blank=True, help_text='Video duration')
    file_size = models.PositiveIntegerField(null=True, blank=True, help_text='File size in bytes')
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='all')
    target_departments = models.ManyToManyField(Department, blank=True, help_text='Departments that can access this video')
    target_employees = models.ManyToManyField('users.User', blank=True, help_text='Specific employees that can access this video')
    is_mandatory = models.BooleanField(default=False, help_text='Whether this video is mandatory for employees')
    tags = models.CharField(max_length=500, blank=True, help_text='Comma-separated tags for categorization')
    uploaded_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='uploaded_training_videos')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_video_type_display()})"
    
    @property
    def video_extension(self):
        """Get video file extension"""
        if self.video_file and self.video_file.name:
            return self.video_file.name.split('.')[-1].lower()
        return ''
    
    def save(self, *args, **kwargs):
        if self.video_file:
            self.file_size = self.video_file.size
        super().save(*args, **kwargs)

class TrainingProgress(models.Model):
    """
    Track employee progress on training materials and videos
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    
    employee = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='training_progress')
    material = models.ForeignKey(TrainingMaterial, on_delete=models.CASCADE, null=True, blank=True, related_name='progress_records')
    video = models.ForeignKey(TrainingVideo, on_delete=models.CASCADE, null=True, blank=True, related_name='progress_records')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.PositiveIntegerField(default=0, help_text='Progress percentage (0-100)')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = [['employee', 'material'], ['employee', 'video']]
        ordering = ['-updated_at']
    
    def __str__(self):
        item = self.material or self.video
        return f"{self.employee.get_full_name()} - {item.title if item else 'Unknown'} ({self.status})"

class HRTask(models.Model):
    title = models.CharField(max_length=200)
    assigned_to = models.ForeignKey(Employee, on_delete=models.CASCADE)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[('pending','Pending'),('complete','Complete')], default='pending')

class ExitInterview(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    interviewer = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

# --- Notification Signals ---
User = get_user_model()

def notify(user, message):
    Notification.objects.create(user=user, message=message)

# --- Leave Balance Signals ---
@receiver(post_save, sender=Employee)
def create_default_leave_balances(sender, instance, created, **kwargs):
    """Create default leave balances for new employees"""
    if created:
        from datetime import datetime
        current_year = datetime.now().year
        
        # Default leave allocations for new employees
        default_leave_types = [
            {'leave_type': 'annual', 'total_days': 21},
            {'leave_type': 'sick', 'total_days': 10},
            {'leave_type': 'compassionate', 'total_days': 3},
        ]
        
        for leave_config in default_leave_types:
            LeaveBalance.objects.get_or_create(
                employee=instance,
                leave_type=leave_config['leave_type'],
                year=current_year,
                defaults={
                    'total_days': leave_config['total_days'],
                    'used_days': 0,
                    'pending_days': 0,
                    'carry_over_days': 0,
                }
            )

@receiver(post_save, sender=LeaveRequest)
def update_leave_balance_on_request(sender, instance, created, **kwargs):
    """Update leave balance when leave request status changes"""
    if instance.employee and instance.start_date and instance.end_date:
        days_requested = (instance.end_date - instance.start_date).days + 1
        
        # Get or create leave balance for the request year and type
        leave_balance, _ = LeaveBalance.objects.get_or_create(
            employee=instance.employee,
            leave_type=instance.leave_type.lower() if hasattr(instance, 'leave_type') else 'annual',
            year=instance.start_date.year,
            defaults={
                'total_days': 21 if instance.leave_type.lower() == 'annual' else 10,
                'used_days': 0,
                'pending_days': 0,
                'carry_over_days': 0,
            }
        )
        
        # Update balance based on request status
        if created and instance.status == 'pending':
            # New pending request
            leave_balance.update_balance_on_request(days_requested, 'pending')
        elif not created:
            # Status changed - need to recalculate
            # First, reset pending days for this request type
            if hasattr(instance, '_original_status') and instance._original_status == 'pending':
                leave_balance.pending_days = max(0, leave_balance.pending_days - days_requested)
            
            # Then apply new status
            if instance.status == 'approved':
                leave_balance.used_days += days_requested
            elif instance.status == 'pending':
                leave_balance.pending_days += days_requested
            
            leave_balance.save()

# Store original status to track changes
@receiver(models.signals.post_init, sender=LeaveRequest)
def remember_original_status(sender, instance, **kwargs):
    instance._original_status = instance.status

@receiver(post_save, sender=Employee)
def notify_employee_save(sender, instance, created, **kwargs):
    msg = f"Employee {'created' if created else 'updated'}: {instance.user.get_full_name()}"
    notify(instance.user, msg)

@receiver(post_save, sender=Payroll)
def notify_payroll_save(sender, instance, created, **kwargs):
    msg = f"Payroll {'created' if created else 'updated'} for {instance.employee.user.get_full_name()}"
    notify(instance.employee.user, msg)

@receiver(post_save, sender=Announcement)
def notify_announcement_save(sender, instance, created, **kwargs):
    users = User.objects.all()
    for user in users:
        notify(user, f"Announcement: {instance.title}")

@receiver(post_save, sender=PerformanceReview)
def notify_review_save(sender, instance, created, **kwargs):
    notify(instance.employee.user, f"Performance review {instance.period} {'created' if created else 'updated'}.")
    if instance.reviewer:
        notify(instance.reviewer, f"You are assigned as reviewer for {instance.employee.user.get_full_name()} ({instance.period}).")

@receiver(post_delete, sender=Employee)
def notify_employee_delete(sender, instance, **kwargs):
    notify(instance.user, f"Employee deleted: {instance.user.get_full_name()}")

@receiver(post_delete, sender=Payroll)
def notify_payroll_delete(sender, instance, **kwargs):
    notify(instance.employee.user, f"Payroll deleted for {instance.employee.user.get_full_name()}")

@receiver(post_delete, sender=Announcement)
def notify_announcement_delete(sender, instance, **kwargs):
    users = User.objects.all()
    for user in users:
        notify(user, f"Announcement deleted: {instance.title}")

@receiver(post_delete, sender=PerformanceReview)
def notify_review_delete(sender, instance, **kwargs):
    notify(instance.employee.user, f"Performance review deleted: {instance.period}")
    if instance.reviewer:
        notify(instance.reviewer, f"Performance review deleted for {instance.employee.user.get_full_name()} ({instance.period})")
    notes = models.TextField()

class VisitLog(models.Model):
    visitor = models.CharField(max_length=200)
    host = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    date = models.DateField()
    purpose = models.TextField()

class Meeting(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    attendees = models.ManyToManyField(Employee, blank=True)
    location = models.CharField(max_length=200)

    def __str__(self):
        return self.title

# Onboarding Models
class OnboardingTemplate(models.Model):
    """Template defining onboarding steps for different roles/departments"""
    name = models.CharField(max_length=200)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.department or 'All Departments'}"

class OnboardingStep(models.Model):
    """Individual steps in an onboarding template"""
    STEP_TYPES = [
        ('document', 'Document Review'),
        ('training', 'Training Session'),
        ('meeting', 'Meeting/Introduction'),
        ('task', 'Task/Assignment'),
        ('system_access', 'System Access Setup'),
        ('equipment', 'Equipment Assignment'),
        ('orientation', 'Orientation'),
        ('policy_review', 'Policy Review'),
        ('form_completion', 'Form Completion'),
        ('other', 'Other'),
    ]
    
    template = models.ForeignKey(OnboardingTemplate, on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(max_length=200)
    description = models.TextField()
    step_type = models.CharField(max_length=20, choices=STEP_TYPES, default='task')
    order = models.PositiveIntegerField(default=0)
    estimated_duration = models.PositiveIntegerField(help_text='Estimated duration in hours', default=1)
    is_required = models.BooleanField(default=True)
    responsible_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    responsible_role = models.CharField(max_length=100, blank=True, help_text='Role responsible for this step')
    documents_required = models.TextField(blank=True, help_text='List of documents needed')
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.template.name} - Step {self.order}: {self.title}"

class OnboardingProcess(models.Model):
    """Individual onboarding process for a new employee"""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
        ('cancelled', 'Cancelled'),
    ]
    
    new_employee = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='onboarding_processes')
    template = models.ForeignKey(OnboardingTemplate, on_delete=models.CASCADE)
    hr_coordinator = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='coordinated_onboarding')
    direct_supervisor = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_onboarding')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    start_date = models.DateField()
    expected_completion_date = models.DateField()
    actual_completion_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Onboarding: {self.new_employee.get_full_name()} - {self.template.name}"
    
    @property
    def progress_percentage(self):
        total_steps = self.step_instances.count()
        if total_steps == 0:
            return 0
        completed_steps = self.step_instances.filter(status='completed').count()
        return round((completed_steps / total_steps) * 100, 2)
    
    @property
    def days_remaining(self):
        from datetime import date
        if self.status == 'completed':
            return 0
        return (self.expected_completion_date - date.today()).days

class OnboardingStepInstance(models.Model):
    """Individual step instance for a specific onboarding process"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('blocked', 'Blocked'),
    ]
    
    onboarding_process = models.ForeignKey(OnboardingProcess, on_delete=models.CASCADE, related_name='step_instances')
    step = models.ForeignKey(OnboardingStep, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_onboarding_steps')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    
    notes = models.TextField(blank=True)
    completion_notes = models.TextField(blank=True)
    documents_uploaded = models.JSONField(default=list, blank=True)
    
    class Meta:
        ordering = ['step__order']
    
    def __str__(self):
        return f"{self.onboarding_process.new_employee.get_full_name()} - {self.step.title}"
    
    def mark_completed(self, user, notes=''):
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.completion_notes = notes
        self.save()
        
        # Check if all steps are completed
        process = self.onboarding_process
        if not process.step_instances.exclude(status='completed').exists():
            process.status = 'completed'
            process.actual_completion_date = timezone.now().date()
            process.save()

class OnboardingDocument(models.Model):
    """Documents related to onboarding process"""
    onboarding_process = models.ForeignKey(OnboardingProcess, on_delete=models.CASCADE, related_name='documents')
    step_instance = models.ForeignKey(OnboardingStepInstance, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    document_file = models.FileField(upload_to='onboarding_documents/', null=True, blank=True)
    document_url = models.URLField(blank=True)
    
    uploaded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.onboarding_process.new_employee.get_full_name()} - {self.title}"

class OnboardingFeedback(models.Model):
    """Feedback on the onboarding process"""
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Fair'),
        (3, 'Good'),
        (4, 'Very Good'),
        (5, 'Excellent'),
    ]
    
    onboarding_process = models.ForeignKey(OnboardingProcess, on_delete=models.CASCADE, related_name='feedback')
    feedback_by = models.ForeignKey('users.User', on_delete=models.CASCADE)
    
    overall_rating = models.IntegerField(choices=RATING_CHOICES)
    clarity_rating = models.IntegerField(choices=RATING_CHOICES)
    support_rating = models.IntegerField(choices=RATING_CHOICES)
    
    comments = models.TextField()
    suggestions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Feedback: {self.onboarding_process.new_employee.get_full_name()} - {self.overall_rating}/5"

# Enhanced HR Calendar Models
class HRCalendarEvent(models.Model):
    """Enhanced HR Calendar Events including company events, holidays, and deadlines"""
    EVENT_TYPES = [
        ('company_event', 'Company Event'),
        ('holiday', 'Holiday'),
        ('hr_deadline', 'HR Deadline'),
        ('training', 'Training Session'),
        ('meeting', 'Meeting'),
        ('birthday', 'Employee Birthday'),
        ('anniversary', 'Work Anniversary'),
        ('leave', 'Employee Leave'),
        ('recruitment', 'Recruitment Event'),
        ('performance_review', 'Performance Review'),
        ('other', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    RECURRENCE_CHOICES = [
        ('none', 'No Recurrence'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='other')
    
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    is_all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    is_public = models.BooleanField(default=True, help_text='Visible to all employees')
    
    # Recurrence settings
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=10, choices=RECURRENCE_CHOICES, default='none')
    recurrence_end_date = models.DateField(null=True, blank=True)
    
    # Notification settings
    send_notifications = models.BooleanField(default=True)
    notification_days_before = models.PositiveIntegerField(default=1, help_text='Days before event to send notifications')
    
    # Attendees and assignments
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_calendar_events')
    assigned_to = models.ManyToManyField('users.User', blank=True, related_name='assigned_calendar_events')
    departments = models.ManyToManyField(Department, blank=True, help_text='Departments this event applies to')
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['start_date', 'start_time']
    
    def __str__(self):
        return f"{self.title} - {self.start_date}"
    
    @property
    def is_past_due(self):
        from datetime import date
        return self.start_date < date.today()
    
    @property
    def is_today(self):
        from datetime import date
        return self.start_date == date.today()
    
    @property
    def is_upcoming(self):
        from datetime import date, timedelta
        return self.start_date > date.today() and self.start_date <= date.today() + timedelta(days=7)

class HRCalendarNotification(models.Model):
    """Notifications sent for HR Calendar events"""
    NOTIFICATION_TYPES = [
        ('email', 'Email'),
        ('push', 'Push Notification'),
        ('in_app', 'In-App Notification'),
        ('sms', 'SMS'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    event = models.ForeignKey(HRCalendarEvent, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey('users.User', on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
    
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    scheduled_for = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_for']
    
    def __str__(self):
        return f"{self.event.title} - {self.notification_type} to {self.recipient.get_full_name()}"

class HRHoliday(models.Model):
    """Company holidays and observances"""
    HOLIDAY_TYPES = [
        ('national', 'National Holiday'),
        ('company', 'Company Holiday'),
        ('religious', 'Religious Holiday'),
        ('cultural', 'Cultural Holiday'),
        ('observance', 'Observance'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    holiday_type = models.CharField(max_length=20, choices=HOLIDAY_TYPES, default='company')
    
    date = models.DateField()
    is_recurring = models.BooleanField(default=True)
    is_work_day = models.BooleanField(default=False, help_text='Whether employees are expected to work')
    
    departments = models.ManyToManyField(Department, blank=True, help_text='Departments this holiday applies to')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['date']
    
    def __str__(self):
        return f"{self.name} - {self.date}"

class HRDeadline(models.Model):
    """HR-specific deadlines and important dates"""
    DEADLINE_TYPES = [
        ('performance_review', 'Performance Review'),
        ('training_completion', 'Training Completion'),
        ('document_submission', 'Document Submission'),
        ('compliance', 'Compliance Deadline'),
        ('recruitment', 'Recruitment Deadline'),
        ('payroll', 'Payroll Deadline'),
        ('benefits', 'Benefits Deadline'),
        ('audit', 'Audit Deadline'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    deadline_type = models.CharField(max_length=20, choices=DEADLINE_TYPES, default='other')
    
    due_date = models.DateField()
    due_time = models.TimeField(null=True, blank=True)
    
    assigned_to = models.ManyToManyField('users.User', related_name='hr_deadlines')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='completed_deadlines')
    
    # Notification settings
    reminder_days = models.PositiveIntegerField(default=3, help_text='Days before deadline to send reminders')
    send_reminders = models.BooleanField(default=True)
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_deadlines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['due_date', 'due_time']
    
    def __str__(self):
        return f"{self.title} - Due: {self.due_date}"
    
    @property
    def is_overdue(self):
        from datetime import date
        return not self.is_completed and self.due_date < date.today()
    
    @property
    def days_until_due(self):
        from datetime import date
        if self.is_completed:
            return 0
        return (self.due_date - date.today()).days

class EnhancedAnnouncement(models.Model):
    """Enhanced announcements with rich features and notification support"""
    ANNOUNCEMENT_TYPES = [
        ('general', 'General Announcement'),
        ('policy', 'Policy Update'),
        ('event', 'Event Announcement'),
        ('holiday', 'Holiday Notice'),
        ('deadline', 'Deadline Reminder'),
        ('training', 'Training Announcement'),
        ('emergency', 'Emergency Notice'),
        ('celebration', 'Celebration'),
        ('other', 'Other'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    AUDIENCE_CHOICES = [
        ('all', 'All Employees'),
        ('department', 'Specific Department'),
        ('role', 'Specific Role'),
        ('custom', 'Custom Selection'),
    ]
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(max_length=20, choices=ANNOUNCEMENT_TYPES, default='general')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Audience targeting
    audience_type = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all')
    target_departments = models.ManyToManyField(Department, blank=True)
    target_users = models.ManyToManyField('users.User', blank=True, related_name='targeted_announcements')
    
    # Scheduling
    publish_date = models.DateTimeField()
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    # Notification settings
    send_email = models.BooleanField(default=True)
    send_push = models.BooleanField(default=True)
    send_sms = models.BooleanField(default=False)
    
    # Attachments and media
    attachment = models.FileField(upload_to='announcements/', null=True, blank=True)
    image = models.ImageField(upload_to='announcements/images/', null=True, blank=True)
    
    # Status and metadata
    is_published = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    
    created_by = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='created_announcements')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Read tracking
    read_by = models.ManyToManyField('users.User', through='AnnouncementRead', related_name='read_announcements')
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def is_active(self):
        from django.utils import timezone
        now = timezone.now()
        return (self.is_published and 
                self.publish_date <= now and 
                (not self.expiry_date or self.expiry_date > now))
    
    @property
    def read_count(self):
        return self.read_by.count()
    
    def get_target_users(self):
        """Get all users who should receive this announcement"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if self.audience_type == 'all':
            return User.objects.filter(is_active=True)
        elif self.audience_type == 'department':
            return User.objects.filter(
                employee__department__in=self.target_departments.all(),
                is_active=True
            )
        elif self.audience_type == 'custom':
            return self.target_users.filter(is_active=True)
        else:
            return User.objects.none()

class AnnouncementRead(models.Model):
    """Track which users have read which announcements"""
    announcement = models.ForeignKey(EnhancedAnnouncement, on_delete=models.CASCADE)
    user = models.ForeignKey('users.User', on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['announcement', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} read {self.announcement.title}"
