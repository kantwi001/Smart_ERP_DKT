from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views
from . import sync_api
from .views import (
    ReportViewSet, RevenueView, TransactionsPerStaffView, CustomerBalancesView,
    SurveyViewSet, SurveyQuestionViewSet, SurveyResponseViewSet, SurveyAnswerViewSet,
    RouteViewSet, RouteStopViewSet, RouteAssignmentViewSet
)

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'surveys', SurveyViewSet)
router.register(r'survey-questions', SurveyQuestionViewSet)
router.register(r'survey-responses', SurveyResponseViewSet)
router.register(r'survey-answers', SurveyAnswerViewSet)
router.register(r'routes', RouteViewSet)
router.register(r'route-stops', RouteStopViewSet)
router.register(r'route-assignments', RouteAssignmentViewSet)

urlpatterns = [
    path('sync/download/', sync_api.SyncDownloadAPIView.as_view(), name='sync-download'),
    path('sync/upload/', sync_api.SyncUploadAPIView.as_view(), name='sync-upload'),
    path('dashboard/revenue/', RevenueView.as_view(), name='dashboard-revenue'),
    path('dashboard/transactions-per-staff/', TransactionsPerStaffView.as_view(), name='dashboard-transactions-per-staff'),
    path('dashboard/customer-balances/', CustomerBalancesView.as_view(), name='dashboard-customer-balances'),
    path('powerbi/embed/', views.PowerBIEmbedAPIView.as_view(), name='powerbi-embed'),
]
urlpatterns += router.urls
