#!/bin/bash

echo "📱 Updating Mobile Apps with Production Backend"
echo "=============================================="

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

echo "🔧 Step 1: Updating mobile app configuration for production..."
cd frontend

# Update mobile_app_config.js with production backend
cat > src/mobile_app_config.js << 'EOF'
// Mobile App Configuration for Production
const MOBILE_CONFIG = {
  // Production Backend Configuration
  BACKEND_URL: 'https://erp.tarinnovation.com',
  API_BASE_URL: 'https://erp.tarinnovation.com/api',
  
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
    VERSION: '2.0.0',
    BUILD_NUMBER: '20250827',
    THEME_COLOR: '#1976d2',
    SPLASH_DURATION: 2000,
    AUTO_SYNC_INTERVAL: 30000, // 30 seconds
    OFFLINE_STORAGE_LIMIT: 50, // MB
    SESSION_TIMEOUT: 3600000 // 1 hour
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

echo "✅ Mobile app config updated with production backend"

echo "🔧 Step 2: Updating Capacitor configuration for production..."
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'https://erp.tarinnovation.com',
      'https://erp.tarinnovation.com/*',
      'https://*.tarinnovation.com',
      'https://api.tarinnovation.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1976d2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1976d2'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Preferences: {
      group: 'SmartERPSoftware'
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scheme: 'SmartERPSoftware',
    contentInset: 'automatic'
  }
};

export default config;
EOF

echo "✅ Capacitor config updated for production"

echo "🔧 Step 3: Updating API configuration for production backend..."
cat > src/api.js << 'EOF'
import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Production backend configuration
const API_BASE_URL = 'https://erp.tarinnovation.com/api';

// Create axios instance with production settings
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add platform info for mobile apps
    if (Capacitor.isNativePlatform()) {
      config.headers['X-Platform'] = Capacitor.getPlatform();
      config.headers['X-App-Version'] = '2.0.0';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (Capacitor.isNativePlatform()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints for production
export const authEndpoints = [
  '/token/',
  '/token/refresh/',
  '/users/me/',
  '/users/system/settings/'
];

export { API_BASE_URL };
export default api;
EOF

echo "✅ API configuration updated for production"

echo "🔧 Step 4: Updating environment variables for production build..."
cat > .env.production << 'EOF'
REACT_APP_API_BASE_URL=https://erp.tarinnovation.com/api
REACT_APP_BACKEND_URL=https://erp.tarinnovation.com
REACT_APP_APP_NAME=SmartERPSoftware
REACT_APP_VERSION=2.0.0
REACT_APP_BUILD_ENV=production
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
IMAGE_INLINE_SIZE_LIMIT=0
PORT=3000
EOF

echo "✅ Production environment variables set"

echo "🏗️ Step 5: Building optimized React app for production..."
npm run build

echo "📱 Step 6: Syncing Capacitor with production configuration..."
npx cap sync

echo "🔧 Step 7: Updating Android configuration for production..."
cd android

# Update strings.xml with production values
cat > app/src/main/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SmartERPSoftware</string>
    <string name="title_activity_main">SmartERPSoftware</string>
    <string name="package_name">com.smarterpsoftware.app</string>
    <string name="custom_url_scheme">smarterpsoftware</string>
</resources>
EOF

# Update network security config for production HTTPS
mkdir -p app/src/main/res/xml
cat > app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">erp.tarinnovation.com</domain>
        <domain includeSubdomains="true">tarinnovation.com</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
EOF

# Update AndroidManifest.xml for production
cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize"
            android:screenOrientation="portrait">

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="@string/custom_url_scheme" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Production Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />

</manifest>
EOF

echo "✅ Android configuration updated for production"

echo "🚀 Step 8: Building production APK..."
./gradlew clean
./gradlew assembleRelease

echo "🔍 Step 9: Checking build results..."
if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/release/app-release-unsigned.apk ../../SmartERP-Production-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 PRODUCTION APK READY!"
    echo "======================="
    echo ""
    echo "📱 APK Location: SmartERP-Production-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../../SmartERP-Production-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Production Features:"
    echo "   ✅ Connected to https://erp.tarinnovation.com"
    echo "   ✅ All webapp changes included"
    echo "   ✅ HTTPS-only secure connections"
    echo "   ✅ Production-optimized build"
    echo "   ✅ Network security enforced"
    echo "   ✅ Mobile-optimized performance"
    echo ""
    echo "📋 App Details:"
    echo "   • App Name: SmartERPSoftware"
    echo "   • Package: com.smarterpsoftware.app"
    echo "   • Backend: https://erp.tarinnovation.com"
    echo "   • Version: 2.0.0"
    echo "   • Build: ${TIMESTAMP}"
    echo ""
    echo "🍎 For iOS:"
    echo "   • Open ios/App/App.xcworkspace in Xcode"
    echo "   • Build and run for iOS devices"
    echo "   • Same production backend configuration applied"
    echo ""
    echo "✅ Production mobile apps ready for deployment!"
else
    echo "❌ Production APK build failed"
    echo "Checking for any APK files..."
    find app/build/outputs/apk -name "*.apk" -type f
fi

cd ..
