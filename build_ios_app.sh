#!/bin/bash

echo "📱 Building iOS App"
echo "=================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App

# Clean build folder
xcodebuild clean -workspace App.xcworkspace -scheme App

# Build for simulator
echo "Building for iOS Simulator..."
xcodebuild build -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest'

if [ $? -eq 0 ]; then
    echo "✅ iOS Simulator build successful!"
else
    echo "❌ iOS Simulator build failed!"
    exit 1
fi

# Build for device (requires signing)
echo "Building for iOS Device..."
xcodebuild build -workspace App.xcworkspace -scheme App -destination 'generic/platform=iOS'

if [ $? -eq 0 ]; then
    echo "✅ iOS Device build successful!"
else
    echo "⚠️ iOS Device build failed (may need code signing setup)"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Open Xcode: ./open_ios_xcode.sh"
echo "2. Select target device/simulator"
echo "3. Click Run (▶️) to test"
