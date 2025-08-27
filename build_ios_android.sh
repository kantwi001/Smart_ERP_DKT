#!/bin/bash

echo "🚀 BUILDING iOS & ANDROID APPS WITH USER DELETION UPDATES"
echo "================================================================================"

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Step 1: Clean and prepare
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf node_modules/.cache/
npm run build:clean 2>/dev/null || true

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build React app
echo "🔨 Building React app..."
npm run build

# Step 4: Initialize Capacitor platforms if needed
echo "🔧 Initializing Capacitor platforms..."
npx cap add ios 2>/dev/null || echo "iOS platform already exists"
npx cap add android 2>/dev/null || echo "Android platform already exists"

# Step 5: Sync with both platforms
echo "🔄 Syncing with iOS and Android..."
npx cap sync

# Step 6: Copy assets to both platforms
echo "📱 Copying assets to platforms..."
npx cap copy ios
npx cap copy android

# Step 7: Update platforms
echo "🔧 Updating platforms..."
npx cap update ios
npx cap update android

# Step 8: Build Android APK
echo "📦 Building Android APK..."
if [ -d "android" ]; then
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    cd ..
    
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk ../erp-system-mobile-updated.apk
        echo "✅ Android APK created: erp-system-mobile-updated.apk"
    fi
fi

# Step 9: Prepare iOS build
echo "🍎 Preparing iOS build..."
if [ -d "ios" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "✅ macOS detected - iOS build ready"
        echo "📱 Opening Xcode for iOS deployment..."
        npx cap open ios &
    else
        echo "ℹ️ iOS requires macOS - project prepared for Mac deployment"
    fi
fi

# Step 10: Open Android Studio
echo "📲 Opening Android Studio..."
if [ -d "android" ]; then
    npx cap open android &
fi

echo ""
echo "🎉 BUILD COMPLETE!"
echo "================================================================================"
echo ""
echo "📦 Build Artifacts:"
if [ -f "../erp-system-mobile-updated.apk" ]; then
    echo "✅ Android APK: erp-system-mobile-updated.apk"
fi
if [ -d "ios" ]; then
    echo "✅ iOS Project: frontend/ios/ (ready for Xcode)"
fi
echo ""
echo "🚀 Next Steps:"
echo "🤖 Android: Use Android Studio to deploy APK"
echo "🍎 iOS: Use Xcode to build and deploy to simulator/device"
echo ""
echo "✨ Both platforms ready with user deletion updates!"
