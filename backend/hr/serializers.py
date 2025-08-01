from rest_framework import serializers
from .models import (
    Department, Employee, JobPosting, Application, LeaveRequest, LeaveBalance, Attendance, Payroll, 
    Announcement, TrainingSession, TrainingMaterial, TrainingVideo, TrainingProgress, HRTask, ExitInterview, VisitLog, Meeting, Notification, 
    PerformanceReview, OnboardingTemplate, OnboardingStep, OnboardingProcess, 
    OnboardingStepInstance, OnboardingDocument, OnboardingFeedback, HRCalendarEvent,
    HRCalendarNotification, HRHoliday, HRDeadline, EnhancedAnnouncement, AnnouncementRead
)

class DepartmentSerializer(serializers.ModelSerializer):
    supervisor_username = serializers.CharField(source='supervisor.username', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'supervisor', 'supervisor_username']

class EmployeeSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), source='department', write_only=True, required=False)
    supervisor = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ['id', 'user', 'position', 'department', 'department_id', 'hire_date', 'salary', 'is_active', 'supervisor']

    def get_supervisor(self, obj):
        if obj.department and obj.department.supervisor:
            return obj.department.supervisor.username
        return None

class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    days_requested = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
    
    def get_days_requested(self, obj):
        """Calculate number of days requested"""
        if obj.start_date and obj.end_date:
            return (obj.end_date - obj.start_date).days + 1
        return 0

class LeaveBalanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.user.username', read_only=True)
    department_name = serializers.CharField(source='employee.department.get_name_display', read_only=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    available_days = serializers.ReadOnlyField()
    utilization_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = LeaveBalance
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

class TrainingSessionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    attendees_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingSession
        fields = '__all__'
    
    def get_attendees_count(self, obj):
        return obj.attendees.count()

class TrainingMaterialSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    material_type_display = serializers.CharField(source='get_material_type_display', read_only=True)
    visibility_display = serializers.CharField(source='get_visibility_display', read_only=True)
    file_extension = serializers.ReadOnlyField()
    is_image = serializers.ReadOnlyField()
    is_pdf = serializers.ReadOnlyField()
    is_document = serializers.ReadOnlyField()
    is_presentation = serializers.ReadOnlyField()
    file_size_mb = serializers.SerializerMethodField()
    target_departments_names = serializers.SerializerMethodField()
    target_employees_names = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingMaterial
        fields = '__all__'
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def get_target_departments_names(self, obj):
        return [dept.get_name_display() for dept in obj.target_departments.all()]
    
    def get_target_employees_names(self, obj):
        return [emp.get_full_name() for emp in obj.target_employees.all()]

class TrainingVideoSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    video_type_display = serializers.CharField(source='get_video_type_display', read_only=True)
    visibility_display = serializers.CharField(source='get_visibility_display', read_only=True)
    video_extension = serializers.ReadOnlyField()
    file_size_mb = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    target_departments_names = serializers.SerializerMethodField()
    target_employees_names = serializers.SerializerMethodField()
    
    class Meta:
        model = TrainingVideo
        fields = '__all__'
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def get_duration_formatted(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            if hours > 0:
                return f"{hours}:{minutes:02d}:{seconds:02d}"
            else:
                return f"{minutes}:{seconds:02d}"
        return "Unknown"
    
    def get_target_departments_names(self, obj):
        return [dept.get_name_display() for dept in obj.target_departments.all()]
    
    def get_target_employees_names(self, obj):
        return [emp.get_full_name() for emp in obj.target_employees.all()]

class TrainingProgressSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    material_title = serializers.CharField(source='material.title', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = TrainingProgress
        fields = '__all__'

class HRTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = HRTask
        fields = '__all__'

class ExitInterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExitInterview
        fields = '__all__'

class VisitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisitLog
        fields = '__all__'

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = '__all__'

class PerformanceReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceReview
        fields = '__all__'

# Onboarding Serializers
class OnboardingStepSerializer(serializers.ModelSerializer):
    responsible_department_name = serializers.CharField(source='responsible_department.name', read_only=True)
    
    class Meta:
        model = OnboardingStep
        fields = [
            'id', 'title', 'description', 'step_type', 'order', 'estimated_duration',
            'is_required', 'responsible_department', 'responsible_department_name',
            'responsible_role', 'documents_required'
        ]

class OnboardingTemplateSerializer(serializers.ModelSerializer):
    steps = OnboardingStepSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    total_steps = serializers.SerializerMethodField()
    estimated_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = OnboardingTemplate
        fields = [
            'id', 'name', 'department', 'department_name', 'role', 'description',
            'is_active', 'created_at', 'updated_at', 'steps', 'total_steps', 'estimated_duration'
        ]
    
    def get_total_steps(self, obj):
        return obj.steps.count()
    
    def get_estimated_duration(self, obj):
        return sum(step.estimated_duration for step in obj.steps.all())

class OnboardingStepInstanceSerializer(serializers.ModelSerializer):
    step_title = serializers.CharField(source='step.title', read_only=True)
    step_description = serializers.CharField(source='step.description', read_only=True)
    step_type = serializers.CharField(source='step.step_type', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = OnboardingStepInstance
        fields = [
            'id', 'step', 'step_title', 'step_description', 'step_type',
            'assigned_to', 'assigned_to_name', 'status', 'started_at', 'completed_at',
            'due_date', 'notes', 'completion_notes', 'documents_uploaded', 'is_overdue'
        ]
    
    def get_is_overdue(self, obj):
        from datetime import date
        if obj.due_date and obj.status not in ['completed', 'skipped']:
            return obj.due_date < date.today()
        return False

class OnboardingProcessSerializer(serializers.ModelSerializer):
    new_employee_name = serializers.CharField(source='new_employee.get_full_name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    hr_coordinator_name = serializers.CharField(source='hr_coordinator.get_full_name', read_only=True)
    direct_supervisor_name = serializers.CharField(source='direct_supervisor.get_full_name', read_only=True)
    step_instances = OnboardingStepInstanceSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    days_remaining = serializers.ReadOnlyField()
    
    class Meta:
        model = OnboardingProcess
        fields = [
            'id', 'new_employee', 'new_employee_name', 'template', 'template_name',
            'hr_coordinator', 'hr_coordinator_name', 'direct_supervisor', 'direct_supervisor_name',
            'status', 'start_date', 'expected_completion_date', 'actual_completion_date',
            'notes', 'created_at', 'updated_at', 'step_instances', 'progress_percentage', 'days_remaining'
        ]

class OnboardingDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = OnboardingDocument
        fields = [
            'id', 'title', 'description', 'document_file', 'document_url',
            'uploaded_by', 'uploaded_by_name', 'uploaded_at'
        ]

class OnboardingFeedbackSerializer(serializers.ModelSerializer):
    feedback_by_name = serializers.CharField(source='feedback_by.get_full_name', read_only=True)
    
    class Meta:
        model = OnboardingFeedback
        fields = [
            'id', 'overall_rating', 'clarity_rating', 'support_rating',
            'comments', 'suggestions', 'feedback_by', 'feedback_by_name', 'created_at'
        ]

# Create Onboarding Process Serializer
class CreateOnboardingProcessSerializer(serializers.ModelSerializer):
    class Meta:
        model = OnboardingProcess
        fields = [
            'new_employee', 'template', 'hr_coordinator', 'direct_supervisor',
            'start_date', 'expected_completion_date', 'notes'
        ]
    
    def create(self, validated_data):
        from django.utils import timezone
        from datetime import timedelta
        
        # Create the onboarding process
        process = OnboardingProcess.objects.create(**validated_data)
        
        # Create step instances from template
        template = validated_data['template']
        start_date = validated_data['start_date']
        
        for step in template.steps.all():
            # Calculate due date based on step order and estimated duration
            due_date = start_date + timedelta(days=step.order * 2)  # 2 days per step as default
            
            OnboardingStepInstance.objects.create(
                onboarding_process=process,
                step=step,
                due_date=due_date,
                status='pending'
            )
        
        return process

# Enhanced HR Calendar Serializers
class HRCalendarEventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_to_names = serializers.SerializerMethodField()
    department_names = serializers.SerializerMethodField()
    is_past_due = serializers.ReadOnlyField()
    is_today = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = HRCalendarEvent
        fields = [
            'id', 'title', 'description', 'event_type', 'start_date', 'end_date',
            'start_time', 'end_time', 'is_all_day', 'location', 'priority', 'is_public',
            'is_recurring', 'recurrence_type', 'recurrence_end_date', 'send_notifications',
            'notification_days_before', 'created_by', 'created_by_name', 'assigned_to',
            'assigned_to_names', 'departments', 'department_names', 'created_at', 'updated_at',
            'is_past_due', 'is_today', 'is_upcoming'
        ]
    
    def get_assigned_to_names(self, obj):
        return [user.get_full_name() for user in obj.assigned_to.all()]
    
    def get_department_names(self, obj):
        return [dept.get_name_display() for dept in obj.departments.all()]

class HRHolidaySerializer(serializers.ModelSerializer):
    department_names = serializers.SerializerMethodField()
    
    class Meta:
        model = HRHoliday
        fields = [
            'id', 'name', 'description', 'holiday_type', 'date', 'is_recurring',
            'is_work_day', 'departments', 'department_names', 'created_at', 'updated_at'
        ]
    
    def get_department_names(self, obj):
        return [dept.get_name_display() for dept in obj.departments.all()]

class HRDeadlineSerializer(serializers.ModelSerializer):
    assigned_to_names = serializers.SerializerMethodField()
    department_name = serializers.CharField(source='department.get_name_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()
    
    class Meta:
        model = HRDeadline
        fields = [
            'id', 'title', 'description', 'deadline_type', 'due_date', 'due_time',
            'assigned_to', 'assigned_to_names', 'department', 'department_name',
            'is_completed', 'completed_at', 'completed_by', 'completed_by_name',
            'reminder_days', 'send_reminders', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'is_overdue', 'days_until_due'
        ]
    
    def get_assigned_to_names(self, obj):
        return [user.get_full_name() for user in obj.assigned_to.all()]

class EnhancedAnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    target_department_names = serializers.SerializerMethodField()
    target_user_names = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    read_count = serializers.ReadOnlyField()
    is_read_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = EnhancedAnnouncement
        fields = [
            'id', 'title', 'content', 'announcement_type', 'priority', 'audience_type',
            'target_departments', 'target_department_names', 'target_users', 'target_user_names',
            'publish_date', 'expiry_date', 'send_email', 'send_push', 'send_sms',
            'attachment', 'image', 'is_published', 'is_pinned', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'is_active', 'read_count', 'is_read_by_user'
        ]
    
    def get_target_department_names(self, obj):
        return [dept.get_name_display() for dept in obj.target_departments.all()]
    
    def get_target_user_names(self, obj):
        return [user.get_full_name() for user in obj.target_users.all()]
    
    def get_is_read_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.read_by.filter(id=request.user.id).exists()
        return False

class HRCalendarNotificationSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)
    
    class Meta:
        model = HRCalendarNotification
        fields = [
            'id', 'event', 'event_title', 'recipient', 'recipient_name', 'notification_type',
            'subject', 'message', 'scheduled_for', 'sent_at', 'status', 'error_message', 'created_at'
        ]

class AnnouncementReadSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    announcement_title = serializers.CharField(source='announcement.title', read_only=True)
    
    class Meta:
        model = AnnouncementRead
        fields = ['id', 'announcement', 'announcement_title', 'user', 'user_name', 'read_at']
