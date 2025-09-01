#!/bin/bash

echo "🍎 Opening Fixed iOS Project"
echo "============================"

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened!"
    echo ""
    echo "📋 In Xcode (IMPORTANT STEPS):"
    echo "=============================="
    echo "1. Wait for project to load completely"
    echo "2. Product → Clean Build Folder (⌘⇧K)"
    echo "3. Select 'App' scheme and iPhone simulator"
    echo "4. If signing errors: App target → Signing & Capabilities → Automatically manage signing"
    echo "5. Click Run (▶️)"
    echo ""
    echo "🔧 If build still fails:"
    echo "• Check that all Capacitor versions are 5.7.8"
    echo "• Try different simulator (iPhone 14, iPhone 15)"
    echo "• Restart Xcode if needed"
    echo ""
    echo "🔗 Backend: ./start_backend_for_mobile.sh"
else
    echo "❌ iOS workspace not found!"
    echo "Try running: ./fix_ios_complete.sh"
fi
