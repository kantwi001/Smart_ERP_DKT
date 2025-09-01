#!/bin/bash
echo "🍎 Testing iOS App"
echo "=================="

if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    echo "📱 Opening Xcode project..."
    open frontend/ios/App/App.xcworkspace
    echo "✅ Xcode opened. Select a simulator and click Run"
else
    echo "❌ iOS project not found. Rebuilding..."
    cd frontend
    npx cap sync ios
    if [ -d "ios/App/App.xcworkspace" ]; then
        echo "✅ iOS project created"
        open ios/App/App.xcworkspace
    else
        echo "❌ Failed to create iOS project"
    fi
fi
