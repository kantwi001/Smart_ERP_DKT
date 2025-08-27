// Mobile App Configuration
// Defines routes and settings for the mobile ERP app

export const MOBILE_CONFIG = {
  appName: 'SmartERP Mobile',
  version: '1.0.0',
  backendUrl: 'https://erp.tarinnovation.com',
  syncInterval: 30000, // 30 seconds
  offlineMode: true,
  maxRetries: 3,
  timeout: 10000
};

export const MOBILE_ROUTES = [
  {
    path: '/',
    name: 'Dashboard',
    icon: 'home',
    component: 'Dashboard'
  },
  {
    path: '/employee-dashboard',
    name: 'Employee Dashboard',
    icon: 'person',
    component: 'EmployeeDashboard'
  },
  {
    path: '/sales',
    name: 'Sales',
    icon: 'point-of-sale',
    component: 'SalesDashboard'
  },
  {
    path: '/warehouse-transfer',
    name: 'Warehouse Transfers',
    icon: 'warehouse-transfer',
    component: 'WarehouseTransferModule'
  },
  {
    path: '/sync',
    name: 'Sync',
    icon: 'sync',
    component: 'SyncDashboard'
  }
];

export const MOBILE_FEATURES = {
  enableOfflineMode: true,
  enableAutoSync: true,
  enablePushNotifications: false,
  enableBiometricAuth: false,
  enableLocationTracking: false
};

export const SYNC_CONFIG = {
  autoSyncInterval: 30000,
  maxOfflineRecords: 1000,
  syncOnStartup: true,
  syncOnNetworkRestore: true,
  enableConflictResolution: true
};

// API Endpoints for mobile sync
export const MOBILE_ENDPOINTS = {
  salesOrders: '/sales/sales-orders/',
  customers: '/sales/customers/',
  payments: '/sales/payments/',
  products: '/inventory/products/',
  employees: '/hr/employees/',
  warehouseTransfers: '/api/warehouse/transfers/',
  warehouses: '/api/warehouse/warehouses/',
  auth: '/auth/',
  sync: '/api/sync/'
};

// Storage keys for offline data
export const STORAGE_KEYS = {
  pendingSalesOrders: 'pendingSalesOrders',
  pendingCustomers: 'pendingCustomers',
  pendingPayments: 'pendingPayments',
  pendingWarehouseTransfers: 'pendingWarehouseTransfers',
  warehouseData: 'warehouseData',
  syncHistory: 'syncHistory',
  lastSyncTime: 'lastSyncTime',
  offlineData: 'offlineData'
};

export default {
  MOBILE_CONFIG,
  MOBILE_ROUTES,
  MOBILE_FEATURES,
  SYNC_CONFIG,
  MOBILE_ENDPOINTS,
  STORAGE_KEYS
};
