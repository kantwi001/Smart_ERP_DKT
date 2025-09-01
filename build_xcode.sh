#!/bin/bash

echo "🍎 Building Mobile App in Xcode"
echo "==============================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Preparing Xcode build..."

# Ensure frontend is built with latest changes
cd frontend
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor
echo "   🔄 Syncing with Capacitor..."
npx cap sync ios

# Copy assets
echo "   📁 Copying assets..."
npx cap copy ios

echo ""
echo "2️⃣ Opening Xcode..."

# Check if Xcode is installed
if command -v xcodebuild &> /dev/null; then
    echo "   🚀 Launching Xcode..."
    open ios/App/App.xcworkspace
    
    echo ""
    echo "📋 Xcode Build Instructions:"
    echo "   1. Wait for project to load completely"
    echo "   2. Select 'App' target in project navigator"
    echo "   3. Choose your device/simulator from the scheme selector"
    echo "   4. Product → Build (⌘B) to build the project"
    echo "   5. Product → Archive to create distribution build"
    echo "   6. For testing: Product → Run (⌘R)"
    
else
    echo "   ⚠️  Xcode not found"
    echo "   📋 Manual Steps:"
    echo "   1. Open Xcode"
    echo "   2. File → Open → Select: $(pwd)/ios/App/App.xcworkspace"
    echo "   3. Wait for project to load"
    echo "   4. Select 'App' target"
    echo "   5. Product → Build"
fi

echo ""
echo "3️⃣ Alternative: Build via xcodebuild command line..."

if command -v xcodebuild &> /dev/null; then
    cd ios/App
    
    echo "   🔨 Building iOS app via xcodebuild..."
    xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug -destination 'platform=iOS Simulator,name=iPhone 14' build
    
    if [ $? -eq 0 ]; then
        echo "   ✅ iOS build completed successfully"
    else
        echo "   ❌ xcodebuild failed - use Xcode IDE for detailed error information"
    fi
    
    cd ../..
else
    echo "   ⚠️  xcodebuild command not available"
fi

echo ""
echo "4️⃣ iOS Build Requirements:"
echo "   📱 Xcode 14.0 or later"
echo "   🎯 iOS 13.0+ deployment target"
echo "   🔐 Apple Developer account (for device deployment)"
echo "   📝 Code signing certificates configured"

echo ""
echo "🎉 Xcode setup completed!"
echo "📱 Project location: $(pwd)/frontend/ios/App/App.xcworkspace"
echo "🔧 Build the iOS app in Xcode for device/simulator deployment"
