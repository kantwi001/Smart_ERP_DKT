from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, InventoryTransferViewSet, ProductPriceViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-prices', ProductPriceViewSet)
router.register(r'transfers', InventoryTransferViewSet)

urlpatterns = router.urls
