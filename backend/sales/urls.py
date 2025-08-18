from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CustomerViewSet, SaleViewSet, CustomerApprovalViewSet, QuoteViewSet, LeadViewSet, PromotionViewSet, PromotionProductViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'customer-approvals', CustomerApprovalViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'quotes', QuoteViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'promotions', PromotionViewSet)
router.register(r'promotion-products', PromotionProductViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
