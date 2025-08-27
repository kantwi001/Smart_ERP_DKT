#!/bin/bash

echo "🚀 Building Mobile Apps with Backend Connection..."
echo "Backend: https://erp.tarinnovation.com"
echo "=================================================="

# Make scripts executable
chmod +x fix_ios_build.sh
chmod +x fix_android_build.sh

# Step 1: Fix iOS build issues
echo "🍎 Fixing iOS build issues..."
./fix_ios_build.sh

if [ $? -ne 0 ]; then
    echo "❌ iOS fix failed. Continuing with Android..."
fi

# Step 2: Fix Android build issues
echo "🤖 Fixing Android build issues..."
./fix_android_build.sh

if [ $? -ne 0 ]; then
    echo "❌ Android fix failed. Please check Java installation."
fi

# Step 3: Build both platforms
echo "🏗️ Building mobile apps..."

cd frontend

# Build iOS
echo "📱 Building iOS app..."
npx cap build ios

if [ $? -eq 0 ]; then
    echo "✅ iOS build completed successfully!"
    echo "📂 Open ios/App/App.xcworkspace in Xcode to run"
else
    echo "⚠️ iOS build had issues. Check Xcode configuration."
fi

# Build Android
echo "🤖 Building Android app..."
npx cap build android

if [ $? -eq 0 ]; then
    echo "✅ Android build completed successfully!"
    
    # Copy APK to root directory
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk ../smart-erp-backend-connected.apk
        echo "📦 APK created: smart-erp-backend-connected.apk"
    fi
else
    echo "⚠️ Android build had issues. Check Java/Android SDK setup."
fi

cd ..

echo ""
echo "🎉 Mobile app build process completed!"
echo "📋 Summary:"
echo "   - Backend URL: https://erp.tarinnovation.com"
echo "   - iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
echo "   - Android: smart-erp-backend-connected.apk ready for installation"
echo ""
echo "🔧 If builds failed, run individual fix scripts:"
echo "   ./fix_ios_build.sh"
echo "   ./fix_android_build.sh"
