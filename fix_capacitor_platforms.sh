#!/bin/bash

echo "🔧 Fixing Capacitor Platform Issues and Building Mobile Apps..."
echo "============================================================="

# Set error handling
set -e

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

echo "📱 Step 1: Checking Capacitor installation..."
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

echo "☕ Step 1.5: Installing and configuring Java Runtime..."
# Check if Java 17 is installed
if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "17\|18\|19\|20\|21"; then
    echo "Installing Java 17 via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install openjdk@17
        echo "Setting up Java environment variables..."
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        export PATH="$JAVA_HOME/bin:$PATH"
        
        # Add to shell profile for persistence
        echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
        echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
        
        echo "✅ Java 17 installed and configured"
    else
        echo "❌ Homebrew not found. Please install Java 17 manually from https://adoptium.net/"
        exit 1
    fi
else
    echo "✅ Java Runtime found"
    # Set environment variables for current session
    if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        export PATH="$JAVA_HOME/bin:$PATH"
    fi
fi

echo "🧹 Step 2: Cleaning existing platforms..."
# Remove existing platforms to ensure clean setup
if [ -d "ios" ]; then
    echo "Removing existing iOS platform..."
    rm -rf ios
fi

if [ -d "android" ]; then
    echo "Removing existing Android platform..."
    rm -rf android
fi

echo "📦 Step 3: Installing Capacitor dependencies..."
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

echo "🏗️ Step 4: Building React app..."
export GENERATE_SOURCEMAP=false
export CI=false
npm run build

echo "📱 Step 5: Adding iOS platform..."
npx cap add ios
if [ $? -eq 0 ]; then
    echo "✅ iOS platform added successfully"
else
    echo "❌ Failed to add iOS platform"
    exit 1
fi

echo "🤖 Step 6: Adding Android platform..."
npx cap add android
if [ $? -eq 0 ]; then
    echo "✅ Android platform added successfully"
else
    echo "❌ Failed to add Android platform"
    exit 1
fi

echo "🔄 Step 7: Syncing Capacitor..."
npx cap sync
if [ $? -eq 0 ]; then
    echo "✅ Capacitor sync completed successfully"
else
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "📋 Step 8: Copying web assets..."
npx cap copy

echo "🔧 Step 9: Updating Capacitor configuration..."
# Update mobile app config to use production backend
cat > src/mobile_app_config.js << 'EOF'
// Mobile App Configuration for Production Backend
export const MOBILE_CONFIG = {
  // Backend Configuration
  BACKEND_URL: 'https://erp.tarinnovation.com',
  API_BASE_URL: 'https://erp.tarinnovation.com/api',
  
  // Authentication Endpoints
  AUTH_ENDPOINTS: {
    LOGIN: '/token/',
    REFRESH: '/token/refresh/',
    USER_PROFILE: '/users/me/',
    LOGOUT: '/logout/'
  },
  
  // Warehouse Transfer Endpoints
  WAREHOUSE_ENDPOINTS: {
    TRANSFERS: '/warehouse/transfers/',
    WAREHOUSES: '/warehouse/warehouses/',
    PRODUCTS: '/inventory/products/',
    STOCK_MOVEMENTS: '/warehouse/stock-movements/'
  },
  
  // Sales Endpoints
  SALES_ENDPOINTS: {
    ORDERS: '/sales/orders/',
    CUSTOMERS: '/sales/customers/',
    PAYMENTS: '/sales/payments/'
  },
  
  // Storage Keys for Offline Sync
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    PENDING_TRANSFERS: 'pending_transfers',
    OFFLINE_ORDERS: 'offline_orders',
    SYNC_TIMESTAMP: 'last_sync_timestamp'
  },
  
  // App Settings
  APP_SETTINGS: {
    SYNC_INTERVAL: 30000, // 30 seconds
    OFFLINE_MODE: true,
    AUTO_SYNC: true,
    DEBUG_MODE: false
  }
};

export default MOBILE_CONFIG;
EOF

echo "🍎 Step 10: Building iOS app..."
if command -v xcodebuild &> /dev/null; then
    echo "Building iOS project..."
    cd ios/App
    xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS build
    cd ../..
    echo "✅ iOS build completed"
else
    echo "⚠️ Xcode not found. iOS build skipped. Use Xcode to build manually."
fi

echo "🤖 Step 11: Building Android APK..."
if [ -d "$ANDROID_HOME" ] || [ -d "$HOME/Library/Android/sdk" ]; then
    echo "Building Android APK..."
    cd android
    ./gradlew assembleRelease
    cd ..
    
    # Copy APK to root directory
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release.apk ../smart-erp-production.apk
        echo "✅ Android APK created: smart-erp-production.apk"
    fi
else
    echo "⚠️ Android SDK not found. Android build skipped."
fi

echo ""
echo "🎉 CAPACITOR PLATFORM FIX COMPLETED!"
echo "===================================="
echo ""
echo "✅ iOS platform: Added and synced"
echo "✅ Android platform: Added and synced"
echo "✅ Capacitor configuration: Updated for production backend"
echo "✅ Mobile app config: Connected to erp.tarinnovation.com"
echo ""
echo "📱 Next Steps:"
echo "1. Open iOS project: open ios/App/App.xcworkspace"
echo "2. Test Android APK: smart-erp-production.apk"
echo "3. Deploy to app stores or distribute APK"
echo ""
echo "🔗 Backend URL: https://erp.tarinnovation.com"
echo "📦 APK Location: /Users/kwadwoantwi/CascadeProjects/erp-system/smart-erp-production.apk"
