from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sessions', views.POSSessionViewSet)
router.register(r'sales', views.SaleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('products/', views.products_list, name='pos-products'),
    path('transactions/', views.transactions_list, name='pos-transactions'),
]
