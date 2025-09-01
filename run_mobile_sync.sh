#!/bin/bash

echo "🚀 Mobile App Build and Sync"
echo "============================"

# Set error handling
set -e

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Set Java environment if available
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java environment configured"
fi

echo "🏗️ Step 1: Building React app..."
export GENERATE_SOURCEMAP=false
export CI=false
export REACT_APP_API_URL=https://erp.tarinnovation.com/api

npm run build

if [ $? -eq 0 ]; then
    echo "✅ React build successful"
else
    echo "❌ React build failed"
    exit 1
fi

echo "📱 Step 2: Adding Capacitor platforms..."
# Only add if they don't exist
if [ ! -d "ios" ]; then
    npx cap add ios
    echo "✅ iOS platform added"
else
    echo "✅ iOS platform already exists"
fi

if [ ! -d "android" ]; then
    npx cap add android
    echo "✅ Android platform added"
else
    echo "✅ Android platform already exists"
fi

echo "🔄 Step 3: Syncing Capacitor..."
npx cap sync
npx cap copy

echo "🤖 Step 4: Building Android APK..."
if [ -d "android" ]; then
    cd android
    ./gradlew clean
    ./gradlew assembleRelease
    cd ..
    
    # Copy APK to root
    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release.apk ../smart-erp-mobile-ready.apk
        echo "✅ Android APK created: smart-erp-mobile-ready.apk"
    fi
fi

cd ..

echo ""
echo "🎉 MOBILE APP BUILD COMPLETED!"
echo "=============================="
echo ""
echo "✅ React Build: Successful"
echo "✅ Capacitor: Platforms synced"
echo "✅ Android APK: Generated"
echo ""
echo "📱 Deployment artifacts:"
echo "   • Android APK: smart-erp-mobile-ready.apk"
echo "   • iOS Project: frontend/ios/App/App.xcworkspace"
echo ""
echo "🚀 Ready for app store deployment!"
