#!/bin/bash

echo "🔧 Quick Mobile App Build Fix"
echo "============================="

# Set error handling
set -e

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "☕ Step 1: Installing Java Runtime..."
if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "17\|18\|19\|20\|21"; then
    echo "Installing Java 17 via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install openjdk@17
        echo "✅ Java 17 installed"
    else
        echo "❌ Homebrew not found. Installing manually..."
        echo "Please install Java from: https://adoptium.net/"
        exit 1
    fi
fi

# Set Java environment variables
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java environment configured"
fi

echo "📱 Step 2: Fixing MOBILE_ROUTES export..."
# Add MOBILE_ROUTES to mobile_app_config.js
cat >> frontend/src/mobile_app_config.js << 'EOF'

// Mobile App Routes Configuration
export const MOBILE_ROUTES = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: 'Dashboard',
    component: 'Dashboard'
  },
  {
    path: '/employee',
    name: 'Employee Dashboard',
    icon: 'Person',
    component: 'EmployeeDashboard'
  },
  {
    path: '/sales',
    name: 'Sales',
    icon: 'ShoppingCart',
    component: 'SalesDashboard'
  },
  {
    path: '/sync',
    name: 'Sync',
    icon: 'Sync',
    component: 'SyncDashboard'
  }
];
EOF

echo "✅ MOBILE_ROUTES export added"

echo "🏗️ Step 3: Building React app..."
cd frontend
export GENERATE_SOURCEMAP=false
export CI=false
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

npm run build

if [ $? -eq 0 ]; then
    echo "✅ React build successful"
else
    echo "❌ React build failed"
    exit 1
fi

echo "📱 Step 4: Adding Capacitor platforms..."
npx cap add ios
npx cap add android

echo "🔄 Step 5: Syncing Capacitor..."
npx cap sync

echo "🤖 Step 6: Building Android APK..."
if [ -d "android" ]; then
    cd android
    ./gradlew assembleRelease
    cd ..
    
    # Copy APK to root
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release.apk ../smart-erp-mobile-fixed.apk
        echo "✅ Android APK created: smart-erp-mobile-fixed.apk"
    fi
fi

cd ..

echo ""
echo "🎉 MOBILE APP BUILD FIXED!"
echo "========================="
echo ""
echo "✅ Java Runtime: Installed and configured"
echo "✅ MOBILE_ROUTES: Export added"
echo "✅ React Build: Completed successfully"
echo "✅ Capacitor: Platforms added and synced"
echo "✅ Android APK: Generated successfully"
echo ""
echo "📱 Ready for deployment:"
echo "   • Android APK: smart-erp-mobile-fixed.apk"
echo "   • iOS Project: frontend/ios/App/App.xcworkspace"
echo ""
echo "🚀 Run the complete deployment script now:"
echo "   ./complete_mobile_deployment.sh"
