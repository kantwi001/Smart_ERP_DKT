from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProcurementWorkflowStageViewSet, ProcurementRequestViewSet, VendorViewSet

router = DefaultRouter()
router.register(r'workflow-stages', ProcurementWorkflowStageViewSet)
router.register(r'requests', ProcurementRequestViewSet)
router.register(r'vendors', VendorViewSet)

urlpatterns = router.urls
