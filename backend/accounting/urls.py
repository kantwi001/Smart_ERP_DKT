from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, TransactionViewSet, ReceivablesViewSet

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'receivables', ReceivablesViewSet, basename='receivables')

urlpatterns = router.urls
