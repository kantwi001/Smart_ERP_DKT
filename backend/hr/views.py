from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from datetime import datetime, date
import logging

from .models import (
    Department, Employee, JobPosting, Application, LeaveRequest, LeaveBalance, 
    Attendance, Payroll, Announcement, TrainingSession, TrainingMaterial, 
    TrainingVideo, TrainingProgress, HRTask, ExitInterview, VisitLog, Meeting, 
    Notification, PerformanceReview, OnboardingTemplate, OnboardingStep, 
    OnboardingProcess, OnboardingStepInstance, OnboardingDocument, 
    OnboardingFeedback, HRCalendarEvent, HRCalendarNotification, HRHoliday, 
    HRDeadline, EnhancedAnnouncement, AnnouncementRead
)
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, JobPostingSerializer, 
    ApplicationSerializer, LeaveRequestSerializer, LeaveBalanceSerializer, 
    AttendanceSerializer, PayrollSerializer, AnnouncementSerializer, 
    TrainingSessionSerializer, TrainingMaterialSerializer, TrainingVideoSerializer, 
    TrainingProgressSerializer, HRTaskSerializer, ExitInterviewSerializer, 
    VisitLogSerializer, MeetingSerializer, NotificationSerializer, 
    PerformanceReviewSerializer, OnboardingTemplateSerializer, OnboardingStepSerializer, 
    OnboardingProcessSerializer, OnboardingStepInstanceSerializer, 
    OnboardingDocumentSerializer, OnboardingFeedbackSerializer, 
    CreateOnboardingProcessSerializer, HRCalendarEventSerializer, 
    HRCalendarNotificationSerializer, HRHolidaySerializer, HRDeadlineSerializer, 
    EnhancedAnnouncementSerializer, AnnouncementReadSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)

def ensure_employee_record(user):
    """
    Ensure that an Employee record exists for the given user.
    Create one if it doesn't exist.
    """
    try:
        employee = Employee.objects.get(user=user)
        return employee
    except Employee.DoesNotExist:
        # Create a basic employee record
        from datetime import date
        employee = Employee.objects.create(
            user=user,
            position=getattr(user, 'position', 'Employee'),
            department_id=getattr(user, 'department', None),
            hire_date=date.today(),
            salary=0.00,
            is_active=True
        )
        
        # Initialize leave balances for the current year
        from datetime import datetime
        current_year = datetime.now().year
        
        # Default leave allocations
        leave_allocations = {
            'annual': 21,
            'sick': 10,
            'maternity': 90,
            'paternity': 14,
            'compassionate': 5,
            'study': 5,
            'unpaid': 0,
            'other': 0
        }
        
        for leave_type, total_days in leave_allocations.items():
            LeaveBalance.objects.get_or_create(
                employee=employee,
                leave_type=leave_type,
                year=current_year,
                defaults={
                    'total_days': total_days,
                    'used_days': 0,
                    'pending_days': 0
                }
            )
        
        return employee

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter employees based on user permissions"""
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'department') and user.department and user.department.name in ['HR', 'CD']):
            return Employee.objects.all()
        else:
            # Regular users can only see their own employee record
            return Employee.objects.filter(user=user)

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()  # Required for DRF router
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter leave requests based on user permissions"""
        user = self.request.user
        logger.info(f"🔍 Getting leave requests queryset for user {user.id} ({user.username})")
        
        try:
            # Ensure user has Employee record
            employee = ensure_employee_record(user)
            if employee is None:
                logger.warning(f"⚠️ Could not ensure employee record for user {user.id}, returning empty queryset")
                return LeaveRequest.objects.none()
            
            logger.info(f"✅ Employee record found for user {user.id}: {employee}")
            
            # Test basic query first
            try:
                total_requests = LeaveRequest.objects.count()
                logger.info(f"📊 Total LeaveRequest records in database: {total_requests}")
            except Exception as e:
                logger.error(f"❌ Error counting LeaveRequest records: {str(e)}")
                return LeaveRequest.objects.none()
            
            try:
                if user.is_superuser:
                    logger.info(f"🔑 User {user.id} is superuser, returning all leave requests")
                    queryset = LeaveRequest.objects.all().select_related('employee__user', 'employee__department').prefetch_related('approver')
                    logger.info(f"✅ Superuser queryset created: {queryset.count()} records")
                    return queryset
                elif hasattr(user, 'department') and user.department and user.department.name in ['HR', 'CD']:
                    logger.info(f"🏢 User {user.id} is HR/CD, returning all leave requests")
                    queryset = LeaveRequest.objects.all().select_related('employee__user', 'employee__department').prefetch_related('approver')
                    logger.info(f"✅ HR/CD queryset created: {queryset.count()} records")
                    return queryset
                elif hasattr(user, 'supervised_departments') and user.supervised_departments.exists():
                    logger.info(f"👥 User {user.id} is department supervisor, returning department requests")
                    supervised_dept_ids = user.supervised_departments.values_list('id', flat=True)
                    queryset = LeaveRequest.objects.filter(employee__department_id__in=supervised_dept_ids).select_related('employee__user', 'employee__department').prefetch_related('approver')
                    logger.info(f"✅ Supervisor queryset created: {queryset.count()} records")
                    return queryset
                else:
                    logger.info(f"👤 User {user.id} is regular employee, returning own requests only")
                    queryset = LeaveRequest.objects.filter(employee=employee).select_related('employee__user', 'employee__department').prefetch_related('approver')
                    logger.info(f"✅ Employee queryset created: {queryset.count()} records")
                    return queryset
            except Exception as e:
                logger.error(f"💥 Error creating queryset for user {user.id}: {str(e)}")
                import traceback
                logger.error(f"📋 Full traceback: {traceback.format_exc()}")
                return LeaveRequest.objects.none()
                
        except Exception as e:
            logger.error(f"💥 Critical error in LeaveRequestViewSet.get_queryset for user {user.id}: {str(e)}")
            import traceback
            logger.error(f"📋 Full traceback: {traceback.format_exc()}")
            # Return empty queryset instead of failing
            return LeaveRequest.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list method to add debug logging for serialization"""
        logger.info(f"🔄 LeaveRequestViewSet.list() called for user {request.user.id}")
        
        try:
            queryset = self.get_queryset()
            logger.info(f"📊 Queryset obtained: {queryset.count()} records")
            
            # Test serialization
            try:
                serializer = self.get_serializer(queryset, many=True)
                logger.info(f"✅ Serializer created successfully")
                
                data = serializer.data
                logger.info(f"✅ Serialization successful: {len(data)} records serialized")
                
                return Response(data)
            except Exception as e:
                logger.error(f"❌ Serialization error: {str(e)}")
                import traceback
                logger.error(f"📋 Serialization traceback: {traceback.format_exc()}")
                return Response(
                    {'error': f'Serialization failed: {str(e)}'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"💥 Critical error in LeaveRequestViewSet.list(): {str(e)}")
            import traceback
            logger.error(f"📋 Full traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Failed to load leave requests: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.all()  # Required for DRF router
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter leave balances based on user permissions"""
        user = self.request.user
        
        # Ensure user has Employee record
        try:
            employee = ensure_employee_record(user)
        except ValidationError:
            return LeaveBalance.objects.none()
        
        if user.is_superuser:
            return LeaveBalance.objects.all()
        elif hasattr(user, 'department') and user.department and user.department.name in ['HR', 'CD']:
            return LeaveBalance.objects.all()
        else:
            return LeaveBalance.objects.filter(employee=employee)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leave_dashboard_stats(request):
    """Get leave dashboard statistics"""
    user = request.user
    logger.info(f"Getting leave dashboard stats for user {user.id} ({user.username})")
    
    try:
        # Ensure user has Employee record
        employee = ensure_employee_record(user)
        if employee is None:
            logger.warning(f"Could not ensure employee record for user {user.id} in dashboard stats")
            # Return empty stats instead of failing
            return Response({
                'total_requests': 0,
                'pending_requests': 0,
                'approved_requests': 0,
                'declined_requests': 0,
                'total_annual_leave': 0,
                'used_annual_leave': 0,
                'available_annual_leave': 0,
                'error': 'Could not load employee data'
            })
        
        # Get user's leave requests and balances based on permissions
        try:
            if user.is_superuser:
                logger.info(f"User {user.id} is superuser, getting all stats")
                leave_requests = LeaveRequest.objects.all()
                leave_balances = LeaveBalance.objects.all()
            elif hasattr(user, 'department') and user.department and user.department.name in ['HR', 'CD']:
                logger.info(f"User {user.id} is HR/CD, getting all stats")
                leave_requests = LeaveRequest.objects.all()
                leave_balances = LeaveBalance.objects.all()
            else:
                logger.info(f"User {user.id} is regular employee, getting own stats only")
                leave_requests = LeaveRequest.objects.filter(employee=employee)
                leave_balances = LeaveBalance.objects.filter(employee=employee)
        except Exception as e:
            logger.error(f"Error getting leave data for stats: {str(e)}")
            leave_requests = LeaveRequest.objects.none()
            leave_balances = LeaveBalance.objects.none()
        
        # Calculate stats with error handling
        try:
            total_requests = leave_requests.count()
            pending_requests = leave_requests.filter(status='pending').count()
            approved_requests = leave_requests.filter(status='approved').count()
            declined_requests = leave_requests.filter(status='declined').count()
            
            logger.info(f"Leave request stats: total={total_requests}, pending={pending_requests}, approved={approved_requests}, declined={declined_requests}")
        except Exception as e:
            logger.error(f"Error calculating request stats: {str(e)}")
            total_requests = pending_requests = approved_requests = declined_requests = 0
        
        # Leave balance stats with error handling
        try:
            annual_balances = leave_balances.filter(leave_type='annual')
            total_annual_leave = sum(balance.total_days for balance in annual_balances) if annual_balances.exists() else 0
            used_annual_leave = sum(balance.used_days for balance in annual_balances) if annual_balances.exists() else 0
            
            logger.info(f"Leave balance stats: total_annual={total_annual_leave}, used_annual={used_annual_leave}")
        except Exception as e:
            logger.error(f"Error calculating balance stats: {str(e)}")
            total_annual_leave = used_annual_leave = 0
        
        stats = {
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'declined_requests': declined_requests,
            'total_annual_leave': total_annual_leave,
            'used_annual_leave': used_annual_leave,
            'available_annual_leave': max(0, total_annual_leave - used_annual_leave),
        }
        
        logger.info(f"Successfully calculated dashboard stats for user {user.id}: {stats}")
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Unexpected error getting leave dashboard stats for user {user.id}: {str(e)}")
        return Response({
            'total_requests': 0,
            'pending_requests': 0,
            'approved_requests': 0,
            'declined_requests': 0,
            'total_annual_leave': 0,
            'used_annual_leave': 0,
            'available_annual_leave': 0,
            'error': f'Failed to load dashboard stats: {str(e)}'
        }, status=status.HTTP_200_OK)  # Return 200 with error message instead of 500

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leave_balance(request):
    """Get leave balance for current user"""
    user = request.user
    
    try:
        # Ensure user has Employee record
        employee = ensure_employee_record(user)
        
        # Get current year leave balances
        current_year = timezone.now().year
        balances = LeaveBalance.objects.filter(
            employee=employee,
            year=current_year
        )
        
        serializer = LeaveBalanceSerializer(balances, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting leave balance for user {user.id}: {str(e)}")
        return Response(
            {'error': f'Failed to load leave balance: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Other ViewSets with proper filtering
class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class TrainingMaterialViewSet(viewsets.ModelViewSet):
    queryset = TrainingMaterial.objects.all()
    serializer_class = TrainingMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]

class TrainingVideoViewSet(viewsets.ModelViewSet):
    queryset = TrainingVideo.objects.all()
    serializer_class = TrainingVideoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TrainingProgressViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgress.objects.all()
    serializer_class = TrainingProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

# Onboarding ViewSets
class OnboardingTemplateViewSet(viewsets.ModelViewSet):
    queryset = OnboardingTemplate.objects.all()
    serializer_class = OnboardingTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnboardingStepViewSet(viewsets.ModelViewSet):
    queryset = OnboardingStep.objects.all()
    serializer_class = OnboardingStepSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnboardingProcessViewSet(viewsets.ModelViewSet):
    queryset = OnboardingProcess.objects.all()
    serializer_class = OnboardingProcessSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnboardingStepInstanceViewSet(viewsets.ModelViewSet):
    queryset = OnboardingStepInstance.objects.all()
    serializer_class = OnboardingStepInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnboardingDocumentViewSet(viewsets.ModelViewSet):
    queryset = OnboardingDocument.objects.all()
    serializer_class = OnboardingDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

class OnboardingFeedbackViewSet(viewsets.ModelViewSet):
    queryset = OnboardingFeedback.objects.all()
    serializer_class = OnboardingFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

# HR Calendar ViewSets
class HRCalendarEventViewSet(viewsets.ModelViewSet):
    queryset = HRCalendarEvent.objects.all()
    serializer_class = HRCalendarEventSerializer
    permission_classes = [permissions.IsAuthenticated]

class HRHolidayViewSet(viewsets.ModelViewSet):
    queryset = HRHoliday.objects.all()
    serializer_class = HRHolidaySerializer
    permission_classes = [permissions.IsAuthenticated]

class HRDeadlineViewSet(viewsets.ModelViewSet):
    queryset = HRDeadline.objects.all()
    serializer_class = HRDeadlineSerializer
    permission_classes = [permissions.IsAuthenticated]

class EnhancedAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = EnhancedAnnouncement.objects.all()
    serializer_class = EnhancedAnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]

class HRCalendarNotificationViewSet(viewsets.ModelViewSet):
    queryset = HRCalendarNotification.objects.all()
    serializer_class = HRCalendarNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

class AnnouncementReadViewSet(viewsets.ModelViewSet):
    queryset = AnnouncementRead.objects.all()
    serializer_class = AnnouncementReadSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_notifications(request):
    """Get notifications for the current user (leave and procurement)"""
    from notifications.models import Notification
    
    # Get notifications for leave requests and procurement requests
    notifications = Notification.objects.filter(
        recipient=request.user,
        notification_type__in=['leave_request', 'leave_approval', 'leave_decline', 'procurement_request', 'procurement_approval', 'procurement_decline']
    ).order_by('-created_at')[:20]  # Latest 20 notifications
    
    notification_data = []
    for notif in notifications:
        notification_data.append({
            'id': notif.id,
            'title': notif.subject,
            'message': notif.message,
            'type': notif.notification_type,
            'status': notif.status,
            'created_at': notif.created_at,
            'read_at': notif.read_at,
            'reference_id': notif.reference_id,
            'reference_type': notif.reference_type
        })
    
    return Response(notification_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read"""
    from notifications.models import Notification
    
    try:
        notification = Notification.objects.get(
            id=notification_id,
            recipient=request.user
        )
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_summary(request):
    """Get notification summary for dashboard"""
    from notifications.models import Notification
    
    user = request.user
    
    # Count unread notifications
    unread_leave = Notification.objects.filter(
        recipient=user,
        notification_type__in=['leave_request', 'leave_approval', 'leave_decline'],
        status__in=['pending', 'sent', 'delivered']
    ).count()
    
    unread_procurement = Notification.objects.filter(
        recipient=user,
        notification_type__in=['procurement_request', 'procurement_approval', 'procurement_decline'],
        status__in=['pending', 'sent', 'delivered']
    ).count()
    
    # Count pending approvals (where user is the approver)
    pending_leave_approvals = LeaveRequest.objects.filter(
        approver=user,
        status='pending'
    ).count()
    
    from procurement.models import ProcurementRequest
    pending_procurement_approvals = ProcurementRequest.objects.filter(
        current_approver=user,
        status='pending'
    ).count()
    
    return Response({
        'unread_leave_notifications': unread_leave,
        'unread_procurement_notifications': unread_procurement,
        'pending_leave_approvals': pending_leave_approvals,
        'pending_procurement_approvals': pending_procurement_approvals,
        'total_unread': unread_leave + unread_procurement,
        'total_pending_approvals': pending_leave_approvals + pending_procurement_approvals
    })
