#!/bin/bash

echo "📱 Building Mobile App in Android Studio"
echo "======================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Preparing Android Studio build..."

# Ensure frontend is built with latest changes
cd frontend
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor
echo "   🔄 Syncing with Capacitor..."
npx cap sync android

# Copy assets
echo "   📁 Copying assets..."
npx cap copy android

echo ""
echo "2️⃣ Opening Android Studio..."

# Check if Android Studio is installed
if command -v /Applications/Android\ Studio.app/Contents/MacOS/studio &> /dev/null; then
    echo "   🚀 Launching Android Studio..."
    open -a "Android Studio" android/
    
    echo ""
    echo "📋 Android Studio Build Instructions:"
    echo "   1. Wait for Gradle sync to complete"
    echo "   2. Select 'app' module in project view"
    echo "   3. Build → Make Project (⌘F9)"
    echo "   4. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "   5. APK will be generated in: android/app/build/outputs/apk/debug/"
    
elif command -v studio &> /dev/null; then
    echo "   🚀 Launching Android Studio via command line..."
    studio android/
else
    echo "   ⚠️  Android Studio not found in Applications"
    echo "   📋 Manual Steps:"
    echo "   1. Open Android Studio"
    echo "   2. File → Open → Select: $(pwd)/android/"
    echo "   3. Wait for Gradle sync"
    echo "   4. Build → Make Project"
    echo "   5. Build → Build Bundle(s) / APK(s) → Build APK(s)"
fi

echo ""
echo "3️⃣ Alternative: Build via Gradle command line..."
cd android

# Check if gradlew exists
if [ -f "./gradlew" ]; then
    echo "   🔨 Building APK via Gradle..."
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        # Copy APK to root with timestamp
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        APK_NAME="SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"
        echo "   ✅ APK built successfully: ${APK_NAME}"
    else
        echo "   ❌ Gradle build failed"
    fi
else
    echo "   ⚠️  Gradle wrapper not found"
fi

cd ..

echo ""
echo "🎉 Android Studio setup completed!"
echo "📱 Project location: $(pwd)/frontend/android/"
echo "🔧 Build the APK in Android Studio or use the generated APK"
