#!/bin/bash

echo "📱 Building Mobile Apps with Backend Connectivity"
echo "================================================"

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🌐 Using backend URL: http://$LOCAL_IP:2025"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Set environment variables for build
export REACT_APP_API_URL=http://$LOCAL_IP:2025
export REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
export REACT_APP_MOBILE_MODE=true

# Build React app
echo "📱 Building React app..."
GENERATE_SOURCEMAP=false npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android
npx cap sync ios

# Build Android APK
echo "🤖 Building Android APK..."
cd android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

./gradlew assembleDebug

if [ $? -eq 0 ]; then
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Connected-${TIMESTAMP}.apk"
        echo "✅ Android APK: SmartERP-Connected-${TIMESTAMP}.apk"
    fi
fi

cd ..

echo ""
echo "🎯 Mobile Apps Ready!"
echo "===================="
echo "Backend URL: http://$LOCAL_IP:2025"
echo "Android APK: SmartERP-Connected-*.apk"
echo "iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
