#!/bin/bash

# ERP System Mobile App Build Script
# This script builds Android APK and iOS app for the ERP System

echo "🚀 Building ERP System Mobile Apps..."
echo "=================================="

# Navigate to frontend directory
cd frontend

echo "📱 Step 1: Building React app for mobile..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed!"
    exit 1
fi

echo "✅ React build completed successfully!"

echo "📱 Step 2: Syncing Capacitor for Android..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Android sync failed!"
    exit 1
fi

echo "✅ Android sync completed!"

echo "📱 Step 3: Building Android APK..."
cd android

# Build debug APK
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Android APK build failed!"
    echo "💡 Make sure you have:"
    echo "   - Java 17 or 21 installed"
    echo "   - Android SDK properly configured"
    echo "   - ANDROID_HOME environment variable set"
    exit 1
fi

echo "✅ Android APK built successfully!"
echo "📍 APK Location: android/app/build/outputs/apk/debug/app-debug.apk"

# Copy APK to project root for easy access
cp app/build/outputs/apk/debug/app-debug.apk ../../erp-system-mobile.apk

echo "📱 Step 4: Setting up iOS (if on macOS with Xcode)..."
cd ..

if command -v xcodebuild &> /dev/null; then
    echo "🍎 Syncing Capacitor for iOS..."
    npx cap sync ios
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS sync completed!"
        echo "💡 Open ios/App/App.xcworkspace in Xcode to build iOS app"
    else
        echo "⚠️  iOS sync had issues - check Xcode setup"
    fi
else
    echo "⚠️  Xcode not found - skipping iOS build"
    echo "💡 Install Xcode from App Store to build iOS app"
fi

echo ""
echo "🎉 Mobile App Build Complete!"
echo "================================"
echo "📱 Android APK: erp-system-mobile.apk"
echo "🍎 iOS: Open ios/App/App.xcworkspace in Xcode"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Install APK on Android device or emulator"
echo "2. For iOS: Build and run from Xcode"
echo "3. Make sure backend server is running on accessible IP"
echo ""
echo "🔧 Troubleshooting:"
echo "- If APK build fails, check Java version (should be 17 or 21)"
echo "- Update ANDROID_HOME environment variable"
echo "- Run 'npx cap doctor' to check setup"
