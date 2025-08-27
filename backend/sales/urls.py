from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    CustomerViewSet, CustomerApprovalViewSet, QuoteViewSet, LeadViewSet,
    SaleViewSet, PromotionViewSet, SalesOrderViewSet, SalesOrderItemViewSet,
    FinanceTransactionViewSet, PaymentViewSet, PromotionProductViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'customer-approvals', CustomerApprovalViewSet)
router.register(r'quotes', QuoteViewSet)
router.register(r'leads', LeadViewSet)
router.register(r'promotions', PromotionViewSet)
router.register(r'promotion-products', PromotionProductViewSet)
router.register(r'sales-orders', SalesOrderViewSet)
router.register(r'sales-order-items', SalesOrderItemViewSet)
router.register(r'finance-transactions', FinanceTransactionViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
