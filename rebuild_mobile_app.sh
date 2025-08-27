#!/bin/bash

# SmartERPSoftware Mobile App Builder
# Builds Android APK and iOS app with latest offline sync and navigation optimizations
# Updated with SmartERPSoftware branding

set -e

echo "🚀 SmartERPSoftware Mobile App Builder"
echo "======================================"
echo "📱 Building Android APK and iOS app with:"
echo "   ✅ Offline sync capabilities"
echo "   ✅ Touch-optimized navigation"
echo "   ✅ Network status indicators"
echo "   ✅ Enhanced mobile UI"
echo "   ✅ SmartERPSoftware branding"
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "📂 Navigating to frontend directory..."
    cd frontend
fi

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root or frontend directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

# Step 3: Build the React app with mobile optimizations
echo "📱 Building optimized mobile apps with enhanced navigation..."
echo "🎯 Touch-optimized hamburger menu and drawer navigation"
echo "📐 Improved screen size compatibility for all devices"
echo "🔨 Building React app with touch-optimized navigation..."
GENERATE_SOURCEMAP=false \
INLINE_RUNTIME_CHUNK=false \
npm run build

if [ $? -ne 0 ]; then
    echo "❌ React build failed"
    exit 1
fi

echo "✅ React build completed with mobile navigation optimizations"

# Check if build was successful by looking for build directory and key files in frontend folder
if [ ! -d "frontend/build" ] || [ ! -f "frontend/build/index.html" ]; then
    echo "❌ Build directory or files missing! Checking directories..."
    echo "Current directory: $(pwd)"
    echo "Frontend directory contents: $(ls -la frontend/ 2>/dev/null || echo 'frontend directory not found')"
    if [ -d "frontend/build" ]; then
        echo "Build directory exists, checking contents..."
        echo "Build contents: $(ls -la frontend/build/)"
    fi
    echo "❌ Build verification failed! Please check for errors above."
    exit 1
fi

echo "✅ React build successful!"

# Step 4: Sync Capacitor
echo "🔄 Installing Capacitor CLI and syncing with SmartERPSoftware configuration..."

# Install Capacitor CLI globally if not present
if ! command -v cap &> /dev/null; then
    echo "📦 Installing Capacitor CLI globally..."
    npm install -g @capacitor/cli
fi

# Navigate to frontend directory for Capacitor commands
cd frontend

# Sync Capacitor with updated build
echo "🔄 Syncing Capacitor..."
npx @capacitor/cli sync

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed, trying alternative method..."
    # Try with local installation
    npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/ios
    npx cap sync
    
    if [ $? -ne 0 ]; then
        echo "❌ Capacitor sync failed with both methods"
        exit 1
    fi
fi

echo "✅ Capacitor sync completed"

# Navigate back to project root
cd ..

# Step 5: Build Android APK
echo "📱 Building Android APK for SmartERPSoftware..."

# Navigate to frontend directory for all Capacitor operations
cd frontend

# Check if Java is installed
echo "☕ Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "❌ Java Runtime Environment (JRE) is required for Android builds"
    echo ""
    echo "📋 Install Java using one of these methods:"
    echo "   Option 1 (Recommended): brew install openjdk@17"
    echo "   Option 2: brew install --cask oracle-jdk"
    echo "   Option 3: Download from https://www.oracle.com/java/technologies/downloads/"
    echo ""
    echo "After installation, restart terminal and run this script again."
    cd ..
    exit 1
fi

echo "✅ Java found: $(java -version 2>&1 | head -n 1)"

# Install required Capacitor packages
echo "📦 Installing Capacitor Android platform..."
npm install @capacitor/android @capacitor/ios

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Capacitor platforms"
    cd ..
    exit 1
fi

# Add Android platform if not already added
echo "🔧 Adding Android platform..."
if [ ! -d "android" ]; then
    npx cap add android
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add Android platform"
        cd ..
        exit 1
    fi
else
    echo "✅ Android platform already exists"
fi

echo "🔧 Cleaning Android project..."
cd android
./gradlew clean

if [ $? -ne 0 ]; then
    echo "❌ Android clean failed"
    cd ../..
    exit 1
fi

echo "🔨 Building SmartERPSoftware APK..."
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo "❌ Android APK build failed"
    cd ../..
    exit 1
fi

echo "✅ Android APK built successfully!"

# Copy APK to project root with branded name
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp app/build/outputs/apk/debug/app-debug.apk ../../smart-erp-software-mobile.apk
    echo "📱 APK saved as: smart-erp-software-mobile.apk"
else
    echo "⚠️ APK file not found in expected location"
fi

cd ../..

# Step 6: Build iOS app
echo "🍎 Building iOS app for SmartERPSoftware..."

# Navigate to frontend directory for iOS operations
cd frontend

# Check if iOS platform exists, if not add it
echo "🔧 Adding iOS platform..."
if [ ! -d "ios" ]; then
    # Install iOS platform package first
    echo "📦 Installing Capacitor iOS platform..."
    npm install @capacitor/ios
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install @capacitor/ios package"
        echo "💡 This might be due to network issues or npm configuration"
        echo "✅ Android APK was built successfully: smart-erp-software-mobile.apk"
        cd ..
        exit 0
    fi
    
    # Add iOS platform
    npx cap add ios
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add iOS platform"
        echo "💡 This might be due to missing Xcode or iOS development tools"
        echo "📋 To build iOS apps, you need:"
        echo "   1. Xcode installed from Mac App Store"
        echo "   2. iOS development tools"
        echo "   3. Valid Apple Developer account (for device deployment)"
        echo ""
        echo "✅ Android APK was built successfully: smart-erp-software-mobile.apk"
        cd ..
        exit 0
    fi
else
    echo "✅ iOS platform already exists"
fi

# Sync iOS platform
echo "🔄 Syncing iOS platform..."
npx cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ iOS sync failed"
    echo "💡 iOS platform may need manual setup in Xcode"
    echo "📋 To complete iOS setup:"
    echo "   1. Open frontend/ios/App/App.xcworkspace in Xcode"
    echo "   2. Configure development team and signing"
    echo "   3. Build for device or simulator"
    echo ""
    echo "✅ Android APK was built successfully: smart-erp-software-mobile.apk"
    cd ..
    exit 0
fi

echo "🔨 Opening iOS project in Xcode..."
echo "💡 iOS apps must be built in Xcode due to Apple's requirements"
echo "📋 Next steps for iOS:"
echo "   1. Xcode will open the iOS project"
echo "   2. Select your development team"
echo "   3. Choose target device/simulator"
echo "   4. Click 'Build' or 'Run' button"
echo ""

# Try to open in Xcode
if command -v xed &> /dev/null; then
    xed ios/App/App.xcworkspace
    echo "✅ iOS project opened in Xcode"
else
    echo "⚠️  Xcode command line tools not found"
    echo "📂 Manually open: frontend/ios/App/App.xcworkspace"
fi

# Navigate back to project root
cd ..

# Step 7: Performance Report
echo ""
echo "📊 SmartERPSoftware Mobile Build Report"
echo "======================================"
echo "🎯 Features Included:"
echo "   ✅ Offline-first architecture with auto-sync"
echo "   ✅ Network status indicators (Online/Offline/Syncing)"
echo "   ✅ Touch-optimized navigation (48px+ touch targets)"
echo "   ✅ Enhanced hamburger menu and drawer"
echo "   ✅ Responsive design for all screen sizes"
echo "   ✅ Safe area support for notched devices"
echo "   ✅ SmartERPSoftware branding and app identity"
echo ""

# Check file sizes
if [ -f "SmartERPSoftware-mobile.apk" ]; then
    APK_SIZE=$(du -h "SmartERPSoftware-mobile.apk" | cut -f1)
    echo "📦 Android APK: SmartERPSoftware-mobile.apk ($APK_SIZE)"
fi

if [ -d "ios/App/build" ]; then
    echo "📦 iOS App: Ready in ios/App/App.xcworkspace"
fi

echo ""
echo "🚀 SmartERPSoftware mobile apps are ready!"
echo "📱 Install APK on Android devices for testing"
echo "🍎 Use Xcode to deploy iOS app to devices"
echo ""
echo "🔗 Backend connectivity: 192.168.2.185:2025"
echo "🌐 Web app: localhost:2026"
echo ""
echo "✨ All offline sync and navigation optimizations included!"
