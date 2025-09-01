#!/bin/bash

echo "🔨 Building APK via Android Studio Command Line"
echo "==============================================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🔨 Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    
    # Find and copy APK
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-AndroidStudio-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Location: $(pwd)/../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install APK:"
        echo "adb install ../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found after build"
    fi
else
    echo "❌ APK build failed"
fi
