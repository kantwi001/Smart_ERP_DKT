#!/bin/bash

echo "📱 Building Mobile Apps for Local Development"
echo "============================================"

# Set error handling
set -e

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

echo "🔧 Step 1: Starting backend server..."
cd backend

# Start Django server in background if not running
if ! pgrep -f "manage.py runserver" > /dev/null; then
    echo "Starting Django backend server..."
    python manage.py runserver 0.0.0.0:8000 &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    sleep 3
else
    echo "✅ Backend server already running"
fi

cd ../frontend

echo "🔧 Step 2: Updating mobile app configuration for local development..."

# Update mobile_app_config.js for local development
cat > src/mobile_app_config.js << 'EOF'
// Mobile App Configuration for Local Development
const MOBILE_CONFIG = {
  // Local Development Backend Configuration
  BACKEND_URL: 'http://10.0.2.2:8000',
  API_BASE_URL: 'http://10.0.2.2:8000/api',
  
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
    WAREHOUSES: '/inventory/warehouses/',
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
  APP_SETTINGS: {
    APP_NAME: 'SmartERPSoftware',
    VERSION: '2.0.0-dev',
    BUILD_NUMBER: '20250827',
    THEME_COLOR: '#1976d2',
    SPLASH_DURATION: 2000,
    AUTO_SYNC_INTERVAL: 30000,
    OFFLINE_STORAGE_LIMIT: 50,
    SESSION_TIMEOUT: 3600000
  },
  
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

// Mobile Routes Configuration
const MOBILE_ROUTES = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'dashboard',
    component: 'Dashboard',
    requiresAuth: true
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    icon: 'warehouse',
    component: 'WarehouseDashboard',
    requiresAuth: true
  },
  {
    path: '/sales',
    name: 'Sales',
    icon: 'point_of_sale',
    component: 'SalesDashboard',
    requiresAuth: true
  },
  {
    path: '/inventory',
    name: 'Inventory',
    icon: 'inventory',
    component: 'InventoryDashboard',
    requiresAuth: true
  },
  {
    path: '/customers',
    name: 'Customers',
    icon: 'people',
    component: 'CustomersDashboard',
    requiresAuth: true
  },
  {
    path: '/finance',
    name: 'Finance',
    icon: 'account_balance',
    component: 'FinanceDashboard',
    requiresAuth: true
  },
  {
    path: '/hr',
    name: 'Human Resources',
    icon: 'group',
    component: 'HRDashboard',
    requiresAuth: true
  },
  {
    path: '/reports',
    name: 'Reports',
    icon: 'assessment',
    component: 'ReportingDashboard',
    requiresAuth: true
  },
  {
    path: '/sync',
    name: 'Sync',
    icon: 'sync',
    component: 'SyncDashboard',
    requiresAuth: true
  }
];

export { MOBILE_CONFIG, MOBILE_ROUTES };
export default MOBILE_CONFIG;
EOF

echo "✅ Mobile app config updated for local development"

echo "🔧 Step 3: Building React app for mobile..."
npm run build

echo "📱 Step 4: Syncing Capacitor with local configuration..."
npx cap sync

echo "🚀 Step 5: Building Android APK for local development..."
cd android

# Clean and build APK
./gradlew clean
JAVA_HOME="/opt/homebrew/opt/openjdk@17" ./gradlew assembleDebug --no-daemon

echo "🔍 Step 6: Checking build results..."
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/debug/app-debug.apk ../../SmartERP-Local-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 LOCAL DEVELOPMENT APK READY!"
    echo "==============================="
    echo ""
    echo "📱 APK Location: SmartERP-Local-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../../SmartERP-Local-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Local Development Features:"
    echo "   ✅ Connected to local backend (http://10.0.2.2:8000)"
    echo "   ✅ All webapp changes included"
    echo "   ✅ HTTP connections allowed for development"
    echo "   ✅ Debug mode enabled"
    echo "   ✅ Web debugging enabled"
    echo ""
    echo "📋 App Details:"
    echo "   • App Name: SmartERPSoftware"
    echo "   • Package: com.smarterpsoftware.app"
    echo "   • Backend: http://10.0.2.2:8000 (Android emulator)"
    echo "   • Version: 2.0.0-dev"
    echo "   • Build: ${TIMESTAMP}"
    echo ""
    echo "📲 Testing Instructions:"
    echo "   • Install APK on Android device/emulator"
    echo "   • Ensure backend server is running on http://127.0.0.1:8000"
    echo "   • For physical device, use your computer's IP address"
    echo ""
    echo "🍎 For iOS Development:"
    echo "   • Open ios/App/App.xcworkspace in Xcode"
    echo "   • Update Info.plist to allow HTTP connections"
    echo "   • Build and run for iOS simulator/device"
    echo ""
    echo "✅ Local development mobile apps ready!"
else
    echo "❌ APK build failed"
    find app/build/outputs/apk -name "*.apk" -type f
fi

cd ../..

echo ""
echo "🌐 Development Servers:"
echo "   • Backend: http://127.0.0.1:8000"
echo "   • Frontend: http://localhost:3000"
echo "   • Mobile APK connects to: http://10.0.2.2:8000"
