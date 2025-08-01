from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkflowTemplateViewSet, WorkflowStepViewSet, WorkflowInstanceViewSet,
    WorkflowApprovalViewSet, WorkflowNotificationViewSet, WorkflowAuditLogViewSet,
    WorkflowConfigurationViewSet, WorkflowDashboardViewSet
)

router = DefaultRouter()
router.register(r'templates', WorkflowTemplateViewSet)
router.register(r'steps', WorkflowStepViewSet)
router.register(r'instances', WorkflowInstanceViewSet)
router.register(r'approvals', WorkflowApprovalViewSet)
router.register(r'notifications', WorkflowNotificationViewSet)
router.register(r'audit-logs', WorkflowAuditLogViewSet)
router.register(r'configurations', WorkflowConfigurationViewSet)
router.register(r'dashboard', WorkflowDashboardViewSet, basename='workflow-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
