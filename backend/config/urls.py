from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import View
from django.conf import settings
from django.conf.urls.static import static

from reporting.dashboard_views import StatsView, ActivityView

class APIRootView(View):
    def get(self, request):
        return JsonResponse({
            'message': 'ERP System API Server',
            'version': '1.0.0',
            'endpoints': {
                'admin': '/admin/',
                'api': '/api/',
                'auth': '/api/token/',
                'dashboard_stats': '/api/dashboard/stats/',
                'dashboard_activity': '/api/dashboard/activity/',
                'users': '/api/users/',
                'inventory': '/api/inventory/',
                'hr': '/api/hr/',
                'sales': '/api/sales/',
                'accounting': '/api/accounting/',
                'purchasing': '/api/purchasing/',
                'manufacturing': '/api/manufacturing/',
                'pos': '/api/pos/',
                'reporting': '/api/reporting/',
                'procurement': '/api/procurement/',
            },
            'frontend_url': 'http://localhost:3000',
            'note': 'This is the API backend. Access the frontend at http://localhost:3000'
        })

class APIListView(View):
    def get(self, request):
        return JsonResponse({
            'message': 'ERP System API Endpoints',
            'available_endpoints': {
                'Authentication': {
                    'login': '/api/token/',
                    'refresh': '/api/token/refresh/',
                },
                'Dashboard': {
                    'stats': '/api/dashboard/stats/',
                    'activity': '/api/dashboard/activity/',
                },
                'Modules': {
                    'users': '/api/users/',
                    'inventory': '/api/inventory/',
                    'hr': '/api/hr/',
                    'sales': '/api/sales/',
                    'accounting': '/api/accounting/',
                    'purchasing': '/api/purchasing/',
                    'manufacturing': '/api/manufacturing/',
                    'pos': '/api/pos/',
                    'reporting': '/api/reporting/',
                    'procurement': '/api/procurement/',
                    'workflows': '/api/workflows/',
                }
            }
        })

urlpatterns = [
    path('', APIRootView.as_view(), name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', APIListView.as_view(), name='api-list'),
    path('api/', include('config.simplejwt_urls')),
    path('api/dashboard/stats/', StatsView.as_view(), name='dashboard-stats'),
    path('api/dashboard/activity/', ActivityView.as_view(), name='dashboard-activity'),
    path('api/users/', include('users.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/hr/', include('hr.urls')),
    path('api/sales/', include('sales.urls')),
    path('api/accounting/', include('accounting.urls')),
    path('api/purchasing/', include('purchasing.urls')),
    path('api/manufacturing/', include('manufacturing.urls')),
    path('api/pos/', include('pos.urls')),
    path('api/reporting/', include('reporting.urls')),
    path('api/procurement/', include('procurement.urls')),
    path('api/warehouse/', include('warehouse.urls')),
    path('api/surveys/', include('surveys.urls')),
    path('api/route-planning/', include('route_planning.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/workflows/', include('workflows.urls')),
    # API endpoints will be included here
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
