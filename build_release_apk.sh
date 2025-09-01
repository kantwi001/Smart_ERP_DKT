#!/bin/bash

echo "🚀 Building Release APK"
echo "======================"

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "☕ Java Version: $(java -version 2>&1 | head -n1)"
echo ""

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🔨 Building release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release APK built successfully!"
    
    APK_PATH=$(find . -name "*release*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Release-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Release-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 Release APK:"
        echo "File: SmartERP-Release-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo ""
        echo "⚠️  Note: This APK is unsigned"
        echo "For production, sign with your keystore"
    fi
else
    echo "❌ Release build failed"
fi
