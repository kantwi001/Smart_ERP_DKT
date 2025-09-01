#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "📋 Next Steps in Xcode:"
    echo "======================"
    echo "1. Wait for project to load and dependencies to resolve"
    echo "2. If build fails, try: Product → Clean Build Folder"
    echo "3. Select your target device or simulator from the dropdown"
    echo "4. Click the Run button (▶️) to build and test the app"
    echo "5. For App Store deployment: Product → Archive"
    echo ""
    echo "🔧 If you encounter signing issues:"
    echo "   1. Select App target in project navigator"
    echo "   2. Go to Signing & Capabilities tab"
    echo "   3. Check 'Automatically manage signing'"
    echo "   4. Select your development team"
    echo ""
    echo "🔗 Backend Connection:"
    echo "   Make sure backend is running: ./start_backend_for_mobile.sh"
    echo "   App will connect to: http://192.168.2.185:2025"
    echo ""
    echo "📱 Testing Tips:"
    echo "==============="
    echo "• Use iOS Simulator for quick testing"
    echo "• Use physical device for full functionality testing"
    echo "• Ensure device/simulator is on same WiFi network as backend"
else
    echo "❌ iOS workspace not found at: $IOS_WORKSPACE"
    echo ""
    echo "🔧 Try rebuilding iOS:"
    echo "   ./fix_ios_build_issues.sh"
fi
