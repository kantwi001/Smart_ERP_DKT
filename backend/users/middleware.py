from django.http import JsonResponse
from django.urls import resolve
import json

class RoleBasedAccessMiddleware:
    """
    Middleware to enforce role-based access control for Sales Reps and other restricted users.
    Sales Reps should only access their assigned warehouse data and region/zone information.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Define restricted endpoints for Sales Reps
        self.sales_rep_restrictions = {
            # Warehouse endpoints - only assigned warehouse
            '/warehouse/warehouses/': 'warehouse_filter',
            '/warehouse/transfers/': 'warehouse_filter',
            '/warehouse/stock/': 'warehouse_filter',
            
            # Sales endpoints - only their region/zone
            '/sales/orders/': 'region_filter',
            '/sales/customers/': 'region_filter',
            '/sales/analytics/': 'region_filter',
            
            # POS endpoints - only their warehouse POS
            '/pos/transactions/': 'warehouse_filter',
            '/pos/analytics/': 'warehouse_filter',
            
            # Inventory endpoints - only their warehouse inventory
            '/inventory/stock/': 'warehouse_filter',
            '/inventory/movements/': 'warehouse_filter',
            
            # Reporting endpoints - only their data
            '/reporting/sales/': 'region_filter',
            '/reporting/inventory/': 'warehouse_filter',
        }
    
    def __call__(self, request):
        # Process request
        response = self.get_response(request)
        return response
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Check if user has access to the requested view based on their role and restrictions.
        """
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        user = request.user
        
        # Skip restrictions for superusers and admins
        if user.is_superuser or user.role in ['superadmin', 'admin']:
            return None
        
        # Get the current URL path
        current_url = request.path
        
        # Check if this is a restricted endpoint for Sales Reps
        if user.role == 'sales' or (user.department and 'sales' in user.department.name.lower()):
            return self._enforce_sales_rep_restrictions(request, current_url, user)
        
        # Check module-level access restrictions for all users
        if user.is_module_restricted:
            return self._enforce_module_restrictions(request, current_url, user)
        
        return None
    
    def _enforce_sales_rep_restrictions(self, request, current_url, user):
        """
        Enforce specific restrictions for Sales Representatives.
        """
        # Check if the endpoint requires warehouse filtering
        for restricted_path, filter_type in self.sales_rep_restrictions.items():
            if current_url.startswith(restricted_path):
                if filter_type == 'warehouse_filter':
                    # Ensure user has an assigned warehouse
                    if not user.assigned_warehouse:
                        return JsonResponse({
                            'error': 'Access denied: No warehouse assigned to your account. Contact administrator.'
                        }, status=403)
                    
                    # Add warehouse filter to request
                    if request.method == 'GET':
                        request.GET = request.GET.copy()
                        request.GET['warehouse'] = str(user.assigned_warehouse.id)
                    elif request.method == 'POST' and hasattr(request, 'data'):
                        if isinstance(request.data, dict):
                            request.data['warehouse'] = user.assigned_warehouse.id
                
                elif filter_type == 'region_filter':
                    # Add region/zone filter based on assigned warehouse
                    if user.assigned_warehouse:
                        if request.method == 'GET':
                            request.GET = request.GET.copy()
                            request.GET['region'] = user.assigned_warehouse.region if hasattr(user.assigned_warehouse, 'region') else None
                            request.GET['zone'] = user.assigned_warehouse.zone if hasattr(user.assigned_warehouse, 'zone') else None
        
        return None
    
    def _enforce_module_restrictions(self, request, current_url, user):
        """
        Enforce module-level access restrictions for all restricted users.
        """
        # Map URL patterns to modules
        module_mappings = {
            '/inventory/': 'inventory',
            '/warehouse/': 'warehouse',
            '/sales/': 'sales',
            '/accounting/': 'accounting',
            '/manufacturing/': 'manufacturing',
            '/procurement/': 'procurement',
            '/hr/': 'hr',
            '/pos/': 'pos',
            '/reporting/': 'reporting',
            '/customers/': 'customers',
            '/users/': 'users',
            '/surveys/': 'surveys',
            '/route-planning/': 'route_planning',
            '/system-settings/': 'system_settings',
        }
        
        # Check if user has access to the requested module
        for url_pattern, module_name in module_mappings.items():
            if current_url.startswith(url_pattern):
                if module_name not in user.accessible_modules:
                    return JsonResponse({
                        'error': f'Access denied: You do not have permission to access the {module_name} module.'
                    }, status=403)
                break
        
        return None
