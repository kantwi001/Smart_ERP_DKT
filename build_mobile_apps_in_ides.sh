#!/bin/bash

echo "📱🍎 Building Mobile Apps in Android Studio & Xcode"
echo "=================================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Preparing both platforms..."

# Ensure frontend is built with latest changes
cd frontend
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor for both platforms
echo "   🔄 Syncing with Capacitor (Android & iOS)..."
npx cap sync

# Copy assets to both platforms
echo "   📁 Copying assets..."
npx cap copy

echo ""
echo "2️⃣ Opening Android Studio..."

# Check if Android Studio is installed and open it
if command -v /Applications/Android\ Studio.app/Contents/MacOS/studio &> /dev/null; then
    echo "   🚀 Launching Android Studio..."
    open -a "Android Studio" android/
elif command -v studio &> /dev/null; then
    echo "   🚀 Launching Android Studio via command line..."
    studio android/
else
    echo "   ⚠️  Android Studio not found - will provide manual instructions"
fi

echo ""
echo "3️⃣ Opening Xcode..."

# Check if Xcode is installed and open it
if command -v xcodebuild &> /dev/null; then
    echo "   🚀 Launching Xcode..."
    open ios/App/App.xcworkspace
else
    echo "   ⚠️  Xcode not found - will provide manual instructions"
fi

echo ""
echo "4️⃣ Build Instructions:"
echo ""
echo "📱 ANDROID STUDIO:"
echo "   Project: $(pwd)/android/"
echo "   Steps:"
echo "   1. Wait for Gradle sync to complete"
echo "   2. Select 'app' module in project view"
echo "   3. Build → Make Project (⌘F9)"
echo "   4. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "   5. APK location: android/app/build/outputs/apk/debug/"
echo ""
echo "🍎 XCODE:"
echo "   Project: $(pwd)/ios/App/App.xcworkspace"
echo "   Steps:"
echo "   1. Wait for project to load completely"
echo "   2. Select 'App' target in project navigator"
echo "   3. Choose device/simulator from scheme selector"
echo "   4. Product → Build (⌘B)"
echo "   5. Product → Run (⌘R) to test"
echo "   6. Product → Archive for distribution"

echo ""
echo "5️⃣ Alternative: Command Line Builds..."

# Build Android APK via Gradle
echo "   🔨 Building Android APK..."
cd android
if [ -f "./gradlew" ]; then
    ./gradlew assembleDebug
    if [ $? -eq 0 ]; then
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        APK_NAME="SmartERP-IDE-Build-${TIMESTAMP}.apk"
        cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"
        echo "   ✅ Android APK: ${APK_NAME}"
    fi
fi

cd ../ios/App

# Build iOS app via xcodebuild
echo "   🔨 Building iOS app..."
if command -v xcodebuild &> /dev/null; then
    xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 14' build
    if [ $? -eq 0 ]; then
        echo "   ✅ iOS build completed"
    fi
fi

cd ../..

echo ""
echo "🎉 Both IDEs are ready for mobile app development!"
echo "📱 Android Studio: Build APK for distribution"
echo "🍎 Xcode: Build and test on simulator/device"
