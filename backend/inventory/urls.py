from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, InventoryTransferViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'transfers', InventoryTransferViewSet)

urlpatterns = router.urls
