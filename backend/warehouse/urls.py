from django.urls import path
from .views import (
    WarehouseListCreateView, WarehouseDetailView, WarehouseLocationListCreateView,
    WarehouseTransferListCreateView, WarehouseTransferDetailView,
    StockMovementListCreateView, warehouse_stats, create_warehouse, add_location,
    create_transfer_request, approve_transfer, reject_transfer, complete_transfer, generate_waybill
)

urlpatterns = [
    path('', WarehouseListCreateView.as_view(), name='warehouse-list-create'),
    path('<int:pk>/', WarehouseDetailView.as_view(), name='warehouse-detail'),
    path('locations/', WarehouseLocationListCreateView.as_view(), name='warehouse-location-list-create'),
    path('locations/add/', add_location, name='add-location'),
    path('transfers/', WarehouseTransferListCreateView.as_view(), name='warehouse-transfer-list-create'),
    path('transfers/<int:pk>/', WarehouseTransferDetailView.as_view(), name='warehouse-transfer-detail'),
    path('transfers/create/', create_transfer_request, name='create-transfer-request'),
    path('transfers/<int:transfer_id>/approve/', approve_transfer, name='approve-transfer'),
    path('transfers/<int:transfer_id>/reject/', reject_transfer, name='reject-transfer'),
    path('transfers/<int:transfer_id>/complete/', complete_transfer, name='complete-transfer'),
    path('transfers/<int:transfer_id>/waybill/', generate_waybill, name='generate-waybill'),
    path('movements/', StockMovementListCreateView.as_view(), name='stock-movement-list-create'),
    path('stats/', warehouse_stats, name='warehouse-stats'),
    path('create/', create_warehouse, name='create-warehouse'),
]
