from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import POSSessionViewSet, SaleViewSet, transactions_list

router = DefaultRouter()
router.register(r'sessions', POSSessionViewSet)
router.register(r'sales', SaleViewSet)

urlpatterns = [
    path('transactions/', transactions_list, name='transactions-list'),
]
urlpatterns += router.urls
