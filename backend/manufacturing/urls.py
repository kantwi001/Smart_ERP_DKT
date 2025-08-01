from rest_framework.routers import DefaultRouter
from .views import WorkOrderViewSet

router = DefaultRouter()
router.register(r'workorders', WorkOrderViewSet)

urlpatterns = router.urls
