#!/bin/bash

echo "🤖 Opening Android Studio with Network Configuration"
echo "=================================================="

export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "📱 Opening Android Studio..."
open -a "Android Studio" .

echo ""
echo "✅ Android Studio opened!"
echo ""
echo "📋 In Android Studio:"
echo "===================="
echo "1. Wait for Gradle sync to complete"
echo "2. Select 'app' configuration"
echo "3. Choose device/emulator"
echo "4. Click Run (▶️)"
echo ""
echo "🔗 Backend: ./start_backend_network.sh"
