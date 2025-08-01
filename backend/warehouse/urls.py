from django.urls import path
from .views import (
    WarehouseListCreateView, WarehouseDetailView, WarehouseLocationListCreateView,
    StockMovementListCreateView, warehouse_stats, create_warehouse, add_location
)

urlpatterns = [
    path('', WarehouseListCreateView.as_view(), name='warehouse-list-create'),
    path('<int:pk>/', WarehouseDetailView.as_view(), name='warehouse-detail'),
    path('locations/', WarehouseLocationListCreateView.as_view(), name='warehouse-location-list-create'),
    path('movements/', StockMovementListCreateView.as_view(), name='stock-movement-list-create'),
    path('stats/', warehouse_stats, name='warehouse-stats'),
    path('create/', create_warehouse, name='create-warehouse'),
    path('locations/add/', add_location, name='add-location'),
]
