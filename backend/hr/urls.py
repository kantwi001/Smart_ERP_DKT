from django.urls import path
from rest_framework import routers
from .views import (
    DepartmentViewSet, EmployeeViewSet, JobPostingViewSet, ApplicationViewSet, 
    LeaveRequestViewSet, LeaveBalanceViewSet, NotificationViewSet, AttendanceViewSet, PayrollViewSet, 
    AnnouncementViewSet, TrainingSessionViewSet, TrainingMaterialViewSet, TrainingVideoViewSet, TrainingProgressViewSet, HRTaskViewSet, ExitInterviewViewSet, 
    VisitLogViewSet, MeetingViewSet, PerformanceReviewViewSet, leave_balance,
    OnboardingTemplateViewSet, OnboardingStepViewSet, OnboardingProcessViewSet,
    OnboardingStepInstanceViewSet, OnboardingDocumentViewSet, OnboardingFeedbackViewSet,
    onboarding_dashboard_stats, HRCalendarEventViewSet, HRHolidayViewSet, HRDeadlineViewSet,
    EnhancedAnnouncementViewSet, HRCalendarNotificationViewSet, hr_calendar_dashboard_stats
)

router = routers.DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'job-postings', JobPostingViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'leave-balances', LeaveBalanceViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'payroll', PayrollViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'training-sessions', TrainingSessionViewSet)
router.register(r'training-materials', TrainingMaterialViewSet)
router.register(r'training-videos', TrainingVideoViewSet)
router.register(r'training-progress', TrainingProgressViewSet)
router.register(r'tasks', HRTaskViewSet)
router.register(r'exit-interviews', ExitInterviewViewSet)
router.register(r'visit-logs', VisitLogViewSet)
router.register(r'meetings', MeetingViewSet)
router.register(r'performance-reviews', PerformanceReviewViewSet)
router.register(r'notifications', NotificationViewSet)

# Onboarding routes
router.register(r'onboarding-templates', OnboardingTemplateViewSet)
router.register(r'onboarding-steps', OnboardingStepViewSet)
router.register(r'onboarding-processes', OnboardingProcessViewSet)
router.register(r'onboarding-step-instances', OnboardingStepInstanceViewSet)
router.register(r'onboarding-documents', OnboardingDocumentViewSet)
router.register(r'onboarding-feedback', OnboardingFeedbackViewSet)

# Enhanced HR Calendar routes
router.register(r'calendar-events', HRCalendarEventViewSet)
router.register(r'holidays', HRHolidayViewSet)
router.register(r'deadlines', HRDeadlineViewSet)
router.register(r'enhanced-announcements', EnhancedAnnouncementViewSet)
router.register(r'calendar-notifications', HRCalendarNotificationViewSet)

urlpatterns = [
    path('leave-balance/', leave_balance, name='leave-balance'),
    path('onboarding-dashboard-stats/', onboarding_dashboard_stats, name='onboarding-dashboard-stats'),
    path('calendar-dashboard-stats/', hr_calendar_dashboard_stats, name='hr-calendar-dashboard-stats'),
] + router.urls
