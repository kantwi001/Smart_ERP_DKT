#!/bin/bash

echo "📱 Opening SmartERPSoftware in Android Studio"
echo "============================================"

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "🔧 Step 1: Ensuring React build is ready..."
cd frontend
npm run build
cd ..

echo "📱 Step 2: Syncing Capacitor with latest build..."
cd frontend
npx cap sync android
cd ..

echo "🚀 Step 3: Opening Android project in Android Studio..."
# Open the Android project in Android Studio
open -a "Android Studio" frontend/android

echo ""
echo "🎯 ANDROID STUDIO INSTRUCTIONS"
echo "=============================="
echo ""
echo "Android Studio should now be opening with your project."
echo ""
echo "📋 Steps to run the app:"
echo "1. Wait for Android Studio to finish indexing and syncing"
echo "2. Make sure you have an Android device connected OR"
echo "3. Create/start an Android Virtual Device (AVD) emulator"
echo "4. Click the green 'Run' button (▶️) or press Ctrl+R"
echo "5. Select your target device (physical device or emulator)"
echo ""
echo "🔧 If you encounter issues:"
echo "• File → Sync Project with Gradle Files"
echo "• Build → Clean Project, then Build → Rebuild Project"
echo "• Tools → AVD Manager to create/start emulator"
echo ""
echo "📋 App Details:"
echo "   • App Name: SmartERPSoftware"
echo "   • Package: com.smarterpsoftware.app"
echo "   • Backend: https://erp.tarinnovation.com"
echo "   • Java Version: 17 (Compatible)"
echo ""
echo "🌐 Features to test:"
echo "   • Login with backend credentials"
echo "   • Warehouse transfer management"
echo "   • Sales order creation"
echo "   • Offline sync capabilities"
echo ""
echo "✅ Ready to run in Android Studio!"
