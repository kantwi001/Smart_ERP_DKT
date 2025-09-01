#!/bin/bash

echo "🔨 Building APK with Gradle"
echo "==========================="

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "☕ Java Version: $(java -version 2>&1 | head -n1)"
echo ""

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
        cp "$APK_PATH" "../../SmartERP-Gradle-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Gradle-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-Gradle-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Path: $(pwd)/../../SmartERP-Gradle-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install on device:"
        echo "adb install ../../SmartERP-Gradle-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found"
    fi
else
    echo "❌ Build failed - check Gradle output above"
fi
