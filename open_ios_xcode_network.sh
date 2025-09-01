#!/bin/bash

echo "🍎 Opening iOS Project with Network Configuration"
echo "=============================================="

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened!"
    echo ""
    echo "📋 In Xcode:"
    echo "============"
    echo "1. Wait for project to load"
    echo "2. Product → Clean Build Folder (⌘⇧K)"
    echo "3. Select iPhone simulator"
    echo "4. Click Run (▶️)"
    echo ""
    echo "🔗 Backend: ./start_backend_network.sh"
else
    echo "❌ iOS workspace not found!"
fi
