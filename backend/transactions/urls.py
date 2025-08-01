# transactions/urls.py - URL patterns for transaction API
from django.urls import path
from . import views

urlpatterns = [
    # Transaction CRUD
    path('', views.TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Module-specific endpoints
    path('module/<str:module_id>/', views.module_transactions, name='module-transactions'),
    path('analytics/<str:module_id>/', views.transaction_analytics, name='transaction-analytics'),
    
    # Workflow endpoints
    path('workflow/', views.create_workflow_transaction, name='create-workflow-transaction'),
    path('<int:transaction_id>/complete/', views.complete_transaction, name='complete-transaction'),
    path('<int:transaction_id>/fail/', views.fail_transaction, name='fail-transaction'),
    
    # Cross-module analytics
    path('analytics/cross-module/', views.cross_module_analytics, name='cross-module-analytics'),
]
