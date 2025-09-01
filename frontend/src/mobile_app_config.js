// Mobile App Configuration for ERP System
import { getApiBaseUrl } from './api';

const getBackendUrl = () => getApiBaseUrl().replace('/api', '');

const MOBILE_CONFIG = {
  // Backend Configuration
  BACKEND_URL: getBackendUrl(),
  API_BASE_URL: getApiBaseUrl(),
  
  // API Endpoints
  API_ENDPOINTS: {
    // Authentication
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    USER_PROFILE: '/users/me/',
    
    // Core Modules
    USERS: '/users/',
    DEPARTMENTS: '/hr/departments/',
    EMPLOYEES: '/hr/employees/',
    
    // Inventory & Warehouse
    PRODUCTS: '/inventory/products/',
    WAREHOUSES: '/warehouse/',
    WAREHOUSE_TRANSFERS: '/inventory/warehouse-transfers/',
    STOCK_MOVEMENTS: '/inventory/stock-movements/',
    
    // Sales & Customers
    CUSTOMERS: '/sales/customers/',
    SALES_ORDERS: '/sales/sales-orders/',
    TRANSACTIONS: '/sales/transactions/',
    
    // Accounting & Finance
    ACCOUNTS: '/accounting/accounts/',
    TRANSACTIONS_ACCOUNTING: '/accounting/transactions/',
    BUDGETS: '/accounting/budgets/',
    REPORTS: '/accounting/reports/',
    
    // System
    SYSTEM_SETTINGS: '/users/system/settings/',
    NOTIFICATIONS: '/notifications/',
    SYNC: '/sync/'
  },
  
  // Mobile App Settings
  appName: 'Smart ERP Mobile',
  version: '2.0.0',
  syncInterval: 30000, // 30 seconds
  offlineStorageLimit: 100,
  sessionTimeout: 3600000, // 1 hour
  
  // Storage Keys for Offline Data
  STORAGE_KEYS: {
    AUTH_TOKEN: 'erp_auth_token',
    USER_DATA: 'erp_user_data',
    OFFLINE_DATA: 'erp_offline_data',
    SYNC_QUEUE: 'erp_sync_queue',
    LAST_SYNC: 'erp_last_sync',
    SETTINGS: 'erp_settings'
  },
  
  // Network Configuration
  NETWORK: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  }
};

// Mobile Routes Configuration with Card-based Navigation
const MOBILE_ROUTES = [
  {
    path: '/',
    name: 'Dashboard',
    icon: 'home',
    component: 'Dashboard',
    requiresAuth: true,
    color: '#2196F3',
    description: 'Overview & Analytics'
  },
  {
    path: '/employee-dashboard',
    name: 'Employee',
    icon: 'person',
    component: 'EmployeeDashboard',
    requiresAuth: true,
    color: '#4CAF50',
    description: 'Employee Management'
  },
  {
    path: '/sales',
    name: 'Sales',
    icon: 'point-of-sale',
    component: 'SalesDashboard',
    requiresAuth: true,
    color: '#FF9800',
    description: 'Sales & Orders'
  },
  {
    path: '/warehouse-transfer',
    name: 'Warehouse',
    icon: 'warehouse-transfer',
    component: 'WarehouseTransferModule',
    requiresAuth: true,
    color: '#9C27B0',
    description: 'Inventory & Transfers'
  },
  {
    path: '/sync',
    name: 'Sync',
    icon: 'sync',
    component: 'SyncDashboard',
    requiresAuth: true,
    color: '#607D8B',
    description: 'Data Synchronization'
  }
];

export { MOBILE_CONFIG, MOBILE_ROUTES };
export default MOBILE_CONFIG;
