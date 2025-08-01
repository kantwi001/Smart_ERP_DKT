from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SaleViewSet, CustomerApprovalViewSet, QuoteViewSet, LeadViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'customer-approvals', CustomerApprovalViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'quotes', QuoteViewSet)
router.register(r'leads', LeadViewSet)

urlpatterns = router.urls
