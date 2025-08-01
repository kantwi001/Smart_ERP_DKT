from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    Department, Employee, JobPosting, Application, LeaveRequest, LeaveBalance, Notification, Attendance, Payroll, 
    Announcement, TrainingSession, TrainingMaterial, TrainingVideo, TrainingProgress, HRTask, ExitInterview, VisitLog, Meeting, PerformanceReview,
    OnboardingTemplate, OnboardingStep, OnboardingProcess, OnboardingStepInstance, 
    OnboardingDocument, OnboardingFeedback, HRCalendarEvent, HRCalendarNotification,
    HRHoliday, HRDeadline, EnhancedAnnouncement, AnnouncementRead
)
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, JobPostingSerializer, ApplicationSerializer, 
    LeaveRequestSerializer, LeaveBalanceSerializer, NotificationSerializer, AttendanceSerializer, PayrollSerializer, 
    AnnouncementSerializer, TrainingSessionSerializer, TrainingMaterialSerializer, TrainingVideoSerializer, TrainingProgressSerializer, HRTaskSerializer, ExitInterviewSerializer, 
    VisitLogSerializer, MeetingSerializer, PerformanceReviewSerializer, OnboardingTemplateSerializer,
    OnboardingStepSerializer, OnboardingProcessSerializer, OnboardingStepInstanceSerializer,
    OnboardingDocumentSerializer, OnboardingFeedbackSerializer, CreateOnboardingProcessSerializer,
    HRCalendarEventSerializer, HRHolidaySerializer, HRDeadlineSerializer, EnhancedAnnouncementSerializer,
    HRCalendarNotificationSerializer, AnnouncementReadSerializer
)

User = get_user_model()

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

from django.core.mail import send_mail
from django.utils import timezone
from django.db import models

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    from rest_framework.decorators import action
    from rest_framework.response import Response

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if leave.status != 'pending' or user != leave.approver:
            return Response({'detail': 'Not allowed to approve at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            leave.approve(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        Notification.objects.create(user=leave.employee.user, message="Your leave request was approved or escalated.")
        send_mail(
            'Leave Request Update',
            'Your leave request was approved or escalated to the next stage.',
            'hr@yourcompany.com', [leave.employee.user.email]
        )
        return Response({'status': leave.status, 'stage': leave.approval_stage})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def decline(self, request, pk=None):
        leave = self.get_object()
        user = request.user
        if leave.status != 'pending' or user != leave.approver:
            return Response({'detail': 'Not allowed to decline at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            leave.decline(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        Notification.objects.create(user=leave.employee.user, message="Your leave request was declined.")
        send_mail(
            'Leave Request Declined',
            'Your leave request has been declined.',
            'hr@yourcompany.com', [leave.employee.user.email]
        )
        return Response({'status': leave.status})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def decline(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'declined'
        leave.approver = request.user
        leave.reviewed_at = timezone.now()
        leave.approval_stage = 'complete'
        leave.save()
        Notification.objects.create(user=leave.employee.user, message="Your leave request was declined.")
        send_mail(
            'Leave Request Declined',
            'Your leave request has been declined.',
            'hr@yourcompany.com', [leave.employee.user.email]
        )
        return Response({'status': 'declined'})

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.all()
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter leave balances based on user role and permissions"""
        user = self.request.user
        queryset = LeaveBalance.objects.all()
        
        # If user is not HR or admin, only show their own balances
        if not (user.is_superuser or getattr(user, 'role', '') in ['hr', 'admin']):
            try:
                employee = Employee.objects.get(user=user)
                queryset = queryset.filter(employee=employee)
            except Employee.DoesNotExist:
                queryset = queryset.none()
        
        return queryset.select_related('employee__user', 'employee__department').order_by('-year', 'employee__user__first_name')
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get leave balance dashboard statistics"""
        from django.db.models import Sum, Avg, Count
        from datetime import datetime
        
        current_year = datetime.now().year
        queryset = self.get_queryset().filter(year=current_year)
        
        stats = {
            'total_employees': queryset.values('employee').distinct().count(),
            'total_leave_types': queryset.values('leave_type').distinct().count(),
            'total_allocated_days': queryset.aggregate(total=Sum('total_days'))['total'] or 0,
            'total_used_days': queryset.aggregate(total=Sum('used_days'))['total'] or 0,
            'total_pending_days': queryset.aggregate(total=Sum('pending_days'))['total'] or 0,
            'average_utilization': queryset.aggregate(avg=Avg('used_days'))['avg'] or 0,
        }
        
        # Leave type breakdown
        leave_type_stats = []
        for leave_type, display_name in LeaveBalance.LEAVE_TYPES:
            type_queryset = queryset.filter(leave_type=leave_type)
            if type_queryset.exists():
                leave_type_stats.append({
                    'leave_type': leave_type,
                    'display_name': display_name,
                    'total_allocated': type_queryset.aggregate(total=Sum('total_days'))['total'] or 0,
                    'total_used': type_queryset.aggregate(total=Sum('used_days'))['total'] or 0,
                    'total_available': sum([lb.available_days for lb in type_queryset]),
                    'employee_count': type_queryset.count()
                })
        
        stats['leave_type_breakdown'] = leave_type_stats
        
        # Department breakdown
        dept_stats = []
        departments = queryset.values('employee__department__name').distinct()
        for dept in departments:
            if dept['employee__department__name']:
                dept_queryset = queryset.filter(employee__department__name=dept['employee__department__name'])
                dept_stats.append({
                    'department': dept['employee__department__name'],
                    'employee_count': dept_queryset.values('employee').distinct().count(),
                    'total_allocated': dept_queryset.aggregate(total=Sum('total_days'))['total'] or 0,
                    'total_used': dept_queryset.aggregate(total=Sum('used_days'))['total'] or 0,
                    'average_utilization': dept_queryset.aggregate(avg=Avg('used_days'))['avg'] or 0,
                })
        
        stats['department_breakdown'] = dept_stats
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def bulk_create_balances(self, request):
        """Create leave balances for all employees for a specific year"""
        year = request.data.get('year', datetime.now().year)
        leave_types = request.data.get('leave_types', [])
        
        if not leave_types:
            # Default leave types with standard allocations
            leave_types = [
                {'leave_type': 'annual', 'total_days': 21},
                {'leave_type': 'sick', 'total_days': 10},
                {'leave_type': 'compassionate', 'total_days': 3},
            ]
        
        created_count = 0
        employees = Employee.objects.filter(is_active=True)
        
        for employee in employees:
            for leave_config in leave_types:
                balance, created = LeaveBalance.objects.get_or_create(
                    employee=employee,
                    leave_type=leave_config['leave_type'],
                    year=year,
                    defaults={
                        'total_days': leave_config['total_days'],
                        'used_days': 0,
                        'pending_days': 0,
                        'carry_over_days': 0,
                    }
                )
                if created:
                    created_count += 1
        
        return Response({
            'message': f'Created {created_count} leave balance records for {year}',
            'year': year,
            'employees_processed': employees.count()
        })
    
    @action(detail=True, methods=['post'])
    def adjust_balance(self, request, pk=None):
        """Adjust leave balance (for HR management)"""
        balance = self.get_object()
        adjustment_type = request.data.get('adjustment_type')  # 'add', 'subtract', 'set'
        days = int(request.data.get('days', 0))
        field = request.data.get('field', 'total_days')  # 'total_days', 'used_days', 'carry_over_days'
        reason = request.data.get('reason', '')
        
        if field not in ['total_days', 'used_days', 'carry_over_days']:
            return Response({'error': 'Invalid field'}, status=status.HTTP_400_BAD_REQUEST)
        
        current_value = getattr(balance, field)
        
        if adjustment_type == 'add':
            new_value = current_value + days
        elif adjustment_type == 'subtract':
            new_value = max(0, current_value - days)
        elif adjustment_type == 'set':
            new_value = max(0, days)
        else:
            return Response({'error': 'Invalid adjustment_type'}, status=status.HTTP_400_BAD_REQUEST)
        
        setattr(balance, field, new_value)
        if reason:
            balance.notes = f"{balance.notes}\n{timezone.now().strftime('%Y-%m-%d')}: {reason}" if balance.notes else reason
        balance.save()
        
        return Response({
            'message': f'Successfully adjusted {field} from {current_value} to {new_value}',
            'balance': LeaveBalanceSerializer(balance).data
        })

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

from rest_framework.decorators import action
from rest_framework.response import Response

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        review = self.get_object()
        user = request.user
        if review.status not in ['submitted','review'] or user != review.reviewer:
            return Response({'detail': 'Not allowed to approve at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            review.approve(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        Notification.objects.create(user=review.employee.user, message="Your performance review was approved or escalated.")
        send_mail(
            'Performance Review Update',
            'Your performance review was approved or escalated to the next stage.',
            'hr@yourcompany.com', [review.employee.user.email]
        )
        return Response({'status': review.status, 'stage': review.approval_stage})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def decline(self, request, pk=None):
        review = self.get_object()
        user = request.user
        if review.status not in ['submitted','review'] or user != review.reviewer:
            return Response({'detail': 'Not allowed to decline at this stage.'}, status=status.HTTP_403_FORBIDDEN)
        try:
            review.decline(user)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        Notification.objects.create(user=review.employee.user, message="Your performance review was declined.")
        send_mail(
            'Performance Review Declined',
            'Your performance review has been declined.',
            'hr@yourcompany.com', [review.employee.user.email]
        )
        return Response({'status': review.status})

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated]

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TrainingMaterialViewSet(viewsets.ModelViewSet):
    queryset = TrainingMaterial.objects.all()
    serializer_class = TrainingMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter training materials based on user permissions and visibility
        """
        user = self.request.user
        queryset = TrainingMaterial.objects.all()
        
        # If user is not superuser or HR, filter by visibility
        if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
            # Show materials visible to all, or specifically targeted to this user/department
            queryset = queryset.filter(
                models.Q(visibility='all') |
                models.Q(visibility='department', target_departments=user.employee.department if hasattr(user, 'employee') and user.employee.department else None) |
                models.Q(visibility='custom', target_employees=user)
            ).distinct()
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get training materials dashboard statistics
        """
        user = request.user
        queryset = self.get_queryset()
        
        stats = {
            'total_materials': queryset.count(),
            'mandatory_materials': queryset.filter(is_mandatory=True).count(),
            'by_type': {},
            'recent_uploads': [],
            'expiring_soon': [],
        }
        
        # Materials by type
        for material_type, display_name in TrainingMaterial.MATERIAL_TYPES:
            count = queryset.filter(material_type=material_type).count()
            if count > 0:
                stats['by_type'][material_type] = {
                    'name': display_name,
                    'count': count
                }
        
        # Recent uploads (last 7 days)
        from datetime import datetime, timedelta
        recent_date = timezone.now() - timedelta(days=7)
        recent_materials = queryset.filter(created_at__gte=recent_date)[:5]
        stats['recent_uploads'] = TrainingMaterialSerializer(recent_materials, many=True).data
        
        # Expiring soon (next 30 days)
        expiry_date = timezone.now().date() + timedelta(days=30)
        expiring_materials = queryset.filter(
            expiry_date__isnull=False,
            expiry_date__lte=expiry_date,
            expiry_date__gte=timezone.now().date()
        )[:5]
        stats['expiring_soon'] = TrainingMaterialSerializer(expiring_materials, many=True).data
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def mark_accessed(self, request, pk=None):
        """
        Mark material as accessed by user (for progress tracking)
        """
        material = self.get_object()
        user = request.user
        
        # Create or update progress record
        progress, created = TrainingProgress.objects.get_or_create(
            employee=user,
            material=material,
            defaults={
                'status': 'in_progress',
                'started_at': timezone.now(),
                'progress_percentage': 10
            }
        )
        
        if not created and progress.status == 'not_started':
            progress.status = 'in_progress'
            progress.started_at = timezone.now()
            progress.progress_percentage = 10
            progress.save()
        
        return Response({'status': 'success', 'message': 'Material access recorded'})
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark material as completed by user
        """
        material = self.get_object()
        user = request.user
        
        progress, created = TrainingProgress.objects.get_or_create(
            employee=user,
            material=material,
            defaults={
                'status': 'completed',
                'started_at': timezone.now(),
                'completed_at': timezone.now(),
                'progress_percentage': 100
            }
        )
        
        if not created:
            progress.status = 'completed'
            progress.completed_at = timezone.now()
            progress.progress_percentage = 100
            progress.save()
        
        return Response({'status': 'success', 'message': 'Material marked as completed'})

class TrainingVideoViewSet(viewsets.ModelViewSet):
    queryset = TrainingVideo.objects.all()
    serializer_class = TrainingVideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter training videos based on user permissions and visibility
        """
        user = self.request.user
        queryset = TrainingVideo.objects.all()
        
        # If user is not superuser or HR, filter by visibility
        if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
            # Show videos visible to all, or specifically targeted to this user/department
            queryset = queryset.filter(
                models.Q(visibility='all') |
                models.Q(visibility='department', target_departments=user.employee.department if hasattr(user, 'employee') and user.employee.department else None) |
                models.Q(visibility='custom', target_employees=user)
            ).distinct()
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Get training videos dashboard statistics
        """
        user = request.user
        queryset = self.get_queryset()
        
        stats = {
            'total_videos': queryset.count(),
            'mandatory_videos': queryset.filter(is_mandatory=True).count(),
            'by_type': {},
            'recent_uploads': [],
            'total_duration': 0,
        }
        
        # Videos by type
        for video_type, display_name in TrainingVideo.VIDEO_TYPES:
            count = queryset.filter(video_type=video_type).count()
            if count > 0:
                stats['by_type'][video_type] = {
                    'name': display_name,
                    'count': count
                }
        
        # Recent uploads (last 7 days)
        from datetime import datetime, timedelta
        recent_date = timezone.now() - timedelta(days=7)
        recent_videos = queryset.filter(created_at__gte=recent_date)[:5]
        stats['recent_uploads'] = TrainingVideoSerializer(recent_videos, many=True).data
        
        # Calculate total duration
        total_seconds = 0
        for video in queryset.filter(duration__isnull=False):
            total_seconds += video.duration.total_seconds()
        
        if total_seconds > 0:
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            stats['total_duration'] = f"{hours}h {minutes}m"
        else:
            stats['total_duration'] = "0h 0m"
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def mark_accessed(self, request, pk=None):
        """
        Mark video as accessed by user (for progress tracking)
        """
        video = self.get_object()
        user = request.user
        
        # Create or update progress record
        progress, created = TrainingProgress.objects.get_or_create(
            employee=user,
            video=video,
            defaults={
                'status': 'in_progress',
                'started_at': timezone.now(),
                'progress_percentage': 10
            }
        )
        
        if not created and progress.status == 'not_started':
            progress.status = 'in_progress'
            progress.started_at = timezone.now()
            progress.progress_percentage = 10
            progress.save()
        
        return Response({'status': 'success', 'message': 'Video access recorded'})
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """
        Mark video as completed by user
        """
        video = self.get_object()
        user = request.user
        
        progress, created = TrainingProgress.objects.get_or_create(
            employee=user,
            video=video,
            defaults={
                'status': 'completed',
                'started_at': timezone.now(),
                'completed_at': timezone.now(),
                'progress_percentage': 100
            }
        )
        
        if not created:
            progress.status = 'completed'
            progress.completed_at = timezone.now()
            progress.progress_percentage = 100
            progress.save()
        
        return Response({'status': 'success', 'message': 'Video marked as completed'})
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """
        Update video watching progress
        """
        video = self.get_object()
        user = request.user
        progress_percentage = request.data.get('progress_percentage', 0)
        
        progress, created = TrainingProgress.objects.get_or_create(
            employee=user,
            video=video,
            defaults={
                'status': 'in_progress',
                'started_at': timezone.now(),
                'progress_percentage': progress_percentage
            }
        )
        
        if not created:
            if progress.status == 'not_started':
                progress.status = 'in_progress'
                progress.started_at = timezone.now()
            
            progress.progress_percentage = progress_percentage
            
            # Mark as completed if 90% or more watched
            if progress_percentage >= 90:
                progress.status = 'completed'
                progress.completed_at = timezone.now()
                progress.progress_percentage = 100
            
            progress.save()
        
        return Response({'status': 'success', 'progress': progress_percentage})

class TrainingProgressViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgress.objects.all()
    serializer_class = TrainingProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter progress records based on user permissions
        """
        user = self.request.user
        
        # Superusers and HR can see all progress
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR'):
            return TrainingProgress.objects.all().order_by('-updated_at')
        
        # Regular users can only see their own progress
        return TrainingProgress.objects.filter(employee=user).order_by('-updated_at')
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """
        Get current user's training progress
        """
        user = request.user
        progress_records = TrainingProgress.objects.filter(employee=user)
        
        stats = {
            'total_items': progress_records.count(),
            'completed': progress_records.filter(status='completed').count(),
            'in_progress': progress_records.filter(status='in_progress').count(),
            'not_started': progress_records.filter(status='not_started').count(),
            'overdue': progress_records.filter(status='overdue').count(),
            'recent_activity': [],
            'mandatory_pending': [],
        }
        
        # Recent activity (last 10 items)
        recent_progress = progress_records.order_by('-updated_at')[:10]
        stats['recent_activity'] = TrainingProgressSerializer(recent_progress, many=True).data
        
        # Mandatory items not completed
        mandatory_materials = TrainingProgress.objects.filter(
            employee=user,
            material__is_mandatory=True
        ).exclude(status='completed')
        
        mandatory_videos = TrainingProgress.objects.filter(
            employee=user,
            video__is_mandatory=True
        ).exclude(status='completed')
        
        mandatory_pending = list(mandatory_materials) + list(mandatory_videos)
        stats['mandatory_pending'] = TrainingProgressSerializer(mandatory_pending, many=True).data
        
        return Response(stats)

class HRTaskViewSet(viewsets.ModelViewSet):
    queryset = HRTask.objects.all()
    serializer_class = HRTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class ExitInterviewViewSet(viewsets.ModelViewSet):
    queryset = ExitInterview.objects.all()
    serializer_class = ExitInterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

class VisitLogViewSet(viewsets.ModelViewSet):
    queryset = VisitLog.objects.all()
    serializer_class = VisitLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leave_balance(request):
    """
    Get leave balance for the current user
    """
    user = request.user
    
    # Calculate leave balance based on user's leave requests
    annual_leave_total = 21  # Standard annual leave days
    sick_leave_total = 10    # Standard sick leave days
    personal_leave_total = 5 # Standard personal leave days
    
    # Get approved leave requests for the current year
    from django.utils import timezone
    current_year = timezone.now().year
    
    approved_leaves = LeaveRequest.objects.filter(
        employee__user=user,
        status='approved',
        start_date__year=current_year
    )
    
    # Calculate used leave days by type
    used_annual = sum(
        leave.days_requested for leave in approved_leaves 
        if leave.leave_type == 'annual'
    )
    used_sick = sum(
        leave.days_requested for leave in approved_leaves 
        if leave.leave_type == 'sick'
    )
    used_personal = sum(
        leave.days_requested for leave in approved_leaves 
        if leave.leave_type == 'personal'
    )
    
    leave_balance_data = {
        'annual_leave': annual_leave_total,
        'sick_leave': sick_leave_total,
        'personal_leave': personal_leave_total,
        'used_annual': used_annual,
        'used_sick': used_sick,
        'used_personal': used_personal,
        'remaining_annual': annual_leave_total - used_annual,
        'remaining_sick': sick_leave_total - used_sick,
        'remaining_personal': personal_leave_total - used_personal,
        'year': current_year,
        'employee_name': user.get_full_name() or user.username,
        'employee_id': user.id
    }
    
    return Response(leave_balance_data)

# Onboarding Views
class OnboardingTemplateViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTemplate.objects.all()
    serializer_class = OnboardingTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = OnboardingTemplate.objects.filter(is_active=True)
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department=department)
        return queryset

class OnboardingStepViewSet(viewsets.ModelViewSet):
    queryset = OnboardingStep.objects.all()
    serializer_class = OnboardingStepSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        template_id = self.request.query_params.get('template', None)
        if template_id:
            return OnboardingStep.objects.filter(template=template_id)
        return OnboardingStep.objects.all()

class OnboardingProcessViewSet(viewsets.ModelViewSet):
    queryset = OnboardingProcess.objects.all()
    serializer_class = OnboardingProcessSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOnboardingProcessSerializer
        return OnboardingProcessSerializer
    
    def get_queryset(self):
        user = self.request.user
        # HR can see all, supervisors see their supervised, employees see their own
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR'):
            return OnboardingProcess.objects.all()
        elif hasattr(user, 'supervised_onboarding'):
            return OnboardingProcess.objects.filter(direct_supervisor=user)
        else:
            return OnboardingProcess.objects.filter(new_employee=user)
    
    from rest_framework.decorators import action
    
    @action(detail=True, methods=['post'])
    def start_process(self, request, pk=None):
        """Start an onboarding process"""
        process = self.get_object()
        if process.status != 'not_started':
            return Response({'error': 'Process already started'}, status=status.HTTP_400_BAD_REQUEST)
        
        process.status = 'in_progress'
        process.save()
        
        return Response({'message': 'Onboarding process started successfully'})
    
    @action(detail=True, methods=['post'])
    def complete_process(self, request, pk=None):
        """Complete an onboarding process"""
        process = self.get_object()
        if process.status == 'completed':
            return Response({'error': 'Process already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        process.status = 'completed'
        process.actual_completion_date = timezone.now().date()
        process.save()
        
        return Response({'message': 'Onboarding process completed successfully'})

class OnboardingStepInstanceViewSet(viewsets.ModelViewSet):
    queryset = OnboardingStepInstance.objects.all()
    serializer_class = OnboardingStepInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        process_id = self.request.query_params.get('process', None)
        if process_id:
            return OnboardingStepInstance.objects.filter(onboarding_process=process_id)
        
        user = self.request.user
        # Show steps assigned to user or for processes they're involved in
        return OnboardingStepInstance.objects.filter(
            models.Q(assigned_to=user) |
            models.Q(onboarding_process__new_employee=user) |
            models.Q(onboarding_process__hr_coordinator=user) |
            models.Q(onboarding_process__direct_supervisor=user)
        )
    
    from rest_framework.decorators import action
    
    @action(detail=True, methods=['post'])
    def start_step(self, request, pk=None):
        """Start a step"""
        step_instance = self.get_object()
        if step_instance.status != 'pending':
            return Response({'error': 'Step already started or completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        step_instance.status = 'in_progress'
        step_instance.started_at = timezone.now()
        step_instance.save()
        
        return Response({'message': 'Step started successfully'})
    
    @action(detail=True, methods=['post'])
    def complete_step(self, request, pk=None):
        """Complete a step"""
        step_instance = self.get_object()
        notes = request.data.get('notes', '')
        
        if step_instance.status == 'completed':
            return Response({'error': 'Step already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        step_instance.mark_completed(request.user, notes)
        
        return Response({'message': 'Step completed successfully'})
    
    @action(detail=True, methods=['post'])
    def skip_step(self, request, pk=None):
        """Skip a step"""
        step_instance = self.get_object()
        notes = request.data.get('notes', '')
        
        if step_instance.status in ['completed', 'skipped']:
            return Response({'error': 'Step already completed or skipped'}, status=status.HTTP_400_BAD_REQUEST)
        
        step_instance.status = 'skipped'
        step_instance.completion_notes = notes
        step_instance.save()
        
        return Response({'message': 'Step skipped successfully'})

class OnboardingDocumentViewSet(viewsets.ModelViewSet):
    queryset = OnboardingDocument.objects.all()
    serializer_class = OnboardingDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        process_id = self.request.query_params.get('process', None)
        if process_id:
            return OnboardingDocument.objects.filter(onboarding_process=process_id)
        return OnboardingDocument.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class OnboardingFeedbackViewSet(viewsets.ModelViewSet):
    queryset = OnboardingFeedback.objects.all()
    serializer_class = OnboardingFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        process_id = self.request.query_params.get('process', None)
        if process_id:
            return OnboardingFeedback.objects.filter(onboarding_process=process_id)
        return OnboardingFeedback.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(feedback_by=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def onboarding_dashboard_stats(request):
    """Get onboarding dashboard statistics"""
    user = request.user
    
    # Get processes based on user role
    if user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR'):
        processes = OnboardingProcess.objects.all()
    elif hasattr(user, 'supervised_onboarding'):
        processes = OnboardingProcess.objects.filter(direct_supervisor=user)
    else:
        processes = OnboardingProcess.objects.filter(new_employee=user)
    
    # Calculate statistics
    total_processes = processes.count()
    active_processes = processes.filter(status='in_progress').count()
    completed_processes = processes.filter(status='completed').count()
    overdue_processes = processes.filter(
        expected_completion_date__lt=timezone.now().date(),
        status__in=['not_started', 'in_progress']
    ).count()
    
    # Get recent processes
    recent_processes = processes.order_by('-created_at')[:5]
    recent_data = OnboardingProcessSerializer(recent_processes, many=True).data
    
    # Get my assigned steps
    my_steps = OnboardingStepInstance.objects.filter(
        assigned_to=user,
        status__in=['pending', 'in_progress']
    ).order_by('due_date')[:10]
    my_steps_data = OnboardingStepInstanceSerializer(my_steps, many=True).data
    
    return Response({
        'total_processes': total_processes,
        'active_processes': active_processes,
        'completed_processes': completed_processes,
        'overdue_processes': overdue_processes,
        'recent_processes': recent_data,
        'my_assigned_steps': my_steps_data
    })

# Enhanced HR Calendar Views
class HRCalendarEventViewSet(viewsets.ModelViewSet):
    queryset = HRCalendarEvent.objects.all()
    serializer_class = HRCalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = HRCalendarEvent.objects.all()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(departments=department)
        
        # Filter public events for non-HR users
        user = self.request.user
        if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
            queryset = queryset.filter(
                models.Q(is_public=True) |
                models.Q(assigned_to=user) |
                models.Q(created_by=user)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    from rest_framework.decorators import action
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        from datetime import date, timedelta
        upcoming_events = self.get_queryset().filter(
            start_date__gte=date.today(),
            start_date__lte=date.today() + timedelta(days=30)
        ).order_by('start_date')
        serializer = self.get_serializer(upcoming_events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's events"""
        from datetime import date
        today_events = self.get_queryset().filter(start_date=date.today())
        serializer = self.get_serializer(today_events, many=True)
        return Response(serializer.data)

class HRHolidayViewSet(viewsets.ModelViewSet):
    queryset = HRHoliday.objects.all()
    serializer_class = HRHolidaySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = HRHoliday.objects.all()
        
        # Filter by year
        year = self.request.query_params.get('year', None)
        if year:
            queryset = queryset.filter(date__year=year)
        
        # Filter by holiday type
        holiday_type = self.request.query_params.get('holiday_type', None)
        if holiday_type:
            queryset = queryset.filter(holiday_type=holiday_type)
        
        return queryset.order_by('date')
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming holidays"""
        from datetime import date
        upcoming_holidays = self.get_queryset().filter(date__gte=date.today())
        serializer = self.get_serializer(upcoming_holidays, many=True)
        return Response(serializer.data)

class HRDeadlineViewSet(viewsets.ModelViewSet):
    queryset = HRDeadline.objects.all()
    serializer_class = HRDeadlineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = HRDeadline.objects.all()
        
        # Filter based on user role
        if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
            queryset = queryset.filter(
                models.Q(assigned_to=user) |
                models.Q(created_by=user)
            )
        
        # Filter by completion status
        is_completed = self.request.query_params.get('is_completed', None)
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')
        
        # Filter by deadline type
        deadline_type = self.request.query_params.get('deadline_type', None)
        if deadline_type:
            queryset = queryset.filter(deadline_type=deadline_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark deadline as completed"""
        deadline = self.get_object()
        if deadline.is_completed:
            return Response({'error': 'Deadline already completed'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        deadline.is_completed = True
        deadline.completed_at = timezone.now()
        deadline.completed_by = request.user
        deadline.save()
        
        return Response({'message': 'Deadline marked as completed'})
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue deadlines"""
        from datetime import date
        overdue_deadlines = self.get_queryset().filter(
            due_date__lt=date.today(),
            is_completed=False
        )
        serializer = self.get_serializer(overdue_deadlines, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming deadlines"""
        from datetime import date, timedelta
        upcoming_deadlines = self.get_queryset().filter(
            due_date__gte=date.today(),
            due_date__lte=date.today() + timedelta(days=30),
            is_completed=False
        )
        serializer = self.get_serializer(upcoming_deadlines, many=True)
        return Response(serializer.data)

class EnhancedAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = EnhancedAnnouncement.objects.all()
    serializer_class = EnhancedAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = EnhancedAnnouncement.objects.filter(is_published=True)
        
        # Filter announcements based on targeting
        user_announcements = []
        for announcement in queryset:
            target_users = announcement.get_target_users()
            if user in target_users:
                user_announcements.append(announcement.id)
        
        queryset = queryset.filter(id__in=user_announcements)
        
        # Filter by announcement type
        announcement_type = self.request.query_params.get('announcement_type', None)
        if announcement_type:
            queryset = queryset.filter(announcement_type=announcement_type)
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark announcement as read by current user"""
        announcement = self.get_object()
        read_obj, created = AnnouncementRead.objects.get_or_create(
            announcement=announcement,
            user=request.user
        )
        return Response({'message': 'Announcement marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread announcements for current user"""
        user = request.user
        read_announcements = AnnouncementRead.objects.filter(user=user).values_list('announcement_id', flat=True)
        unread_announcements = self.get_queryset().exclude(id__in=read_announcements)
        serializer = self.get_serializer(unread_announcements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish an announcement"""
        announcement = self.get_object()
        if announcement.is_published:
            return Response({'error': 'Announcement already published'}, status=status.HTTP_400_BAD_REQUEST)
        
        from django.utils import timezone
        announcement.is_published = True
        if not announcement.publish_date:
            announcement.publish_date = timezone.now()
        announcement.save()
        
        # TODO: Send notifications to target users
        
        return Response({'message': 'Announcement published successfully'})

class HRCalendarNotificationViewSet(viewsets.ModelViewSet):
    queryset = HRCalendarNotification.objects.all()
    serializer_class = HRCalendarNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Users can only see their own notifications
        if not user.is_superuser:
            return HRCalendarNotification.objects.filter(recipient=user)
        return HRCalendarNotification.objects.all()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def hr_calendar_dashboard_stats(request):
    """Get HR calendar dashboard statistics"""
    user = request.user
    from datetime import date, timedelta
    
    # Get events for current month
    today = date.today()
    month_start = today.replace(day=1)
    next_month = month_start.replace(month=month_start.month + 1) if month_start.month < 12 else month_start.replace(year=month_start.year + 1, month=1)
    
    events_queryset = HRCalendarEvent.objects.all()
    if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
        events_queryset = events_queryset.filter(
            models.Q(is_public=True) |
            models.Q(assigned_to=user) |
            models.Q(created_by=user)
        )
    
    # Calculate statistics
    total_events = events_queryset.filter(
        start_date__gte=month_start,
        start_date__lt=next_month
    ).count()
    
    today_events = events_queryset.filter(start_date=today).count()
    
    upcoming_events = events_queryset.filter(
        start_date__gt=today,
        start_date__lte=today + timedelta(days=7)
    ).count()
    
    # Get deadlines
    deadlines_queryset = HRDeadline.objects.all()
    if not (user.is_superuser or (hasattr(user, 'employee') and user.employee.department and user.employee.department.name == 'HR')):
        deadlines_queryset = deadlines_queryset.filter(
            models.Q(assigned_to=user) |
            models.Q(created_by=user)
        )
    
    overdue_deadlines = deadlines_queryset.filter(
        due_date__lt=today,
        is_completed=False
    ).count()
    
    upcoming_deadlines = deadlines_queryset.filter(
        due_date__gte=today,
        due_date__lte=today + timedelta(days=7),
        is_completed=False
    ).count()
    
    # Get holidays
    upcoming_holidays = HRHoliday.objects.filter(
        date__gte=today,
        date__lte=today + timedelta(days=30)
    ).count()
    
    # Get unread announcements
    read_announcements = AnnouncementRead.objects.filter(user=user).values_list('announcement_id', flat=True)
    unread_announcements = EnhancedAnnouncement.objects.filter(
        is_published=True
    ).exclude(id__in=read_announcements).count()
    
    return Response({
        'total_events_this_month': total_events,
        'today_events': today_events,
        'upcoming_events': upcoming_events,
        'overdue_deadlines': overdue_deadlines,
        'upcoming_deadlines': upcoming_deadlines,
        'upcoming_holidays': upcoming_holidays,
        'unread_announcements': unread_announcements
    })
