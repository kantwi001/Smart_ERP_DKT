from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'currencies', views.CurrencyViewSet)
router.register(r'chart-of-accounts', views.ChartOfAccountsViewSet)
router.register(r'journal-entries', views.JournalEntryViewSet)
router.register(r'journal-batches', views.JournalBatchViewSet)
router.register(r'budgets', views.BudgetViewSet)
router.register(r'fixed-assets', views.FixedAssetViewSet)
router.register(r'expense-reports', views.ExpenseReportViewSet)
router.register(r'finance-dashboard', views.FinanceDashboardViewSet, basename='finance-dashboard')
router.register(r'receivables', views.ReceivablesViewSet, basename='receivables')

# Legacy routes for backward compatibility
router.register(r'accounts', views.LegacyAccountViewSet)
router.register(r'transactions', views.LegacyTransactionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
