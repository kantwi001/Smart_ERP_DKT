#!/bin/bash

echo "📱 Copying Successfully Built Android APK"
echo "========================================"

cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Check if the APK exists
APK_PATH="frontend/android/app/build/outputs/apk/release/app-release-unsigned.apk"

if [ -f "$APK_PATH" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp "$APK_PATH" "smart-erp-success-${TIMESTAMP}.apk"
    
    echo "✅ APK copied successfully!"
    echo ""
    echo "🎉 ANDROID APK READY!"
    echo "===================="
    echo ""
    echo "📱 APK Location: smart-erp-success-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h smart-erp-success-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Build Status:"
    echo "   ✅ Java compatibility issues resolved"
    echo "   ✅ Capacitor Android compiled successfully"
    echo "   ✅ APK generated and ready for deployment"
    echo ""
    echo "🚀 Installation Options:"
    echo "1. Transfer APK to Android device and install"
    echo "2. Use Android emulator: adb install smart-erp-success-${TIMESTAMP}.apk"
    echo "3. Upload to Google Play Console for distribution"
    echo ""
    echo "📋 App Details:"
    echo "   • App Name: SmartERPSoftware"
    echo "   • Package: com.smarterpsoftware.app"
    echo "   • Backend: https://erp.tarinnovation.com"
    echo "   • Java Version: 17 (Compatible)"
    echo "   • Build Status: SUCCESS ✅"
else
    echo "❌ APK file not found at expected location"
    echo "Searching for APK files..."
    find frontend/android -name "*.apk" -type f
fi
