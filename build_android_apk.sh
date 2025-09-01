#!/bin/bash

echo "🔨 Building Android APK"
echo "======================"

# Set Java environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Build React app
echo "📱 Building React app..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    
    # Find and copy APK
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Location: $(pwd)/../../SmartERP-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install APK:"
        echo "adb install ../../SmartERP-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found"
    fi
else
    echo "❌ Build failed"
fi
