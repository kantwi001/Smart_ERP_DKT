// Mobile App Configuration for Limited Modules
// Only include: Dashboard, Employee Dashboard, Sales, Sync

export const MOBILE_MODULES = {
  DASHBOARD: 'dashboard',
  EMPLOYEE_DASHBOARD: 'employee_dashboard', 
  SALES: 'sales',
  SYNC: 'sync'
};

export const MOBILE_ROUTES = [
  {
    path: '/',
    name: 'Dashboard',
    icon: 'home',
    module: MOBILE_MODULES.DASHBOARD,
    component: 'Dashboard'
  },
  {
    path: '/employee-dashboard',
    name: 'Employee Dashboard', 
    icon: 'person',
    module: MOBILE_MODULES.EMPLOYEE_DASHBOARD,
    component: 'EmployeeDashboard'
  },
  {
    path: '/sales',
    name: 'Sales',
    icon: 'point-of-sale',
    module: MOBILE_MODULES.SALES,
    component: 'SalesDashboard',
    subRoutes: [
      { path: '/sales/orders', name: 'Sales Orders' },
      { path: '/sales/customers', name: 'Customers' },
      { path: '/sales/pos', name: 'POS' }
    ]
  },
  {
    path: '/sync',
    name: 'Sync',
    icon: 'sync',
    module: MOBILE_MODULES.SYNC,
    component: 'SyncDashboard'
  }
];

// Excluded modules for mobile
export const EXCLUDED_MODULES = [
  'finance',
  'inventory', 
  'warehouse',
  'manufacturing',
  'reporting',
  'procurement',
  'hr',
  'users',
  'system-settings'
];

export const MOBILE_CONFIG = {
  appName: 'SmartERP Mobile',
  version: '2.0.0',
  backendUrl: 'http://192.168.2.185:2025',
  syncInterval: 30000, // 30 seconds
  offlineMode: true,
  modules: MOBILE_ROUTES
};
