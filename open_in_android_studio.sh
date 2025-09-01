#!/bin/bash

echo "🚀 Opening Android Project in Android Studio"
echo "==========================================="

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

# Set Android environment
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "📱 Environment configured:"
echo "Java: $(java -version 2>&1 | head -n1)"
echo "Android Home: $ANDROID_HOME"
echo ""

if [ -d "/Applications/Android Studio.app" ]; then
    echo "🎯 Opening Android project in Android Studio..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "================================"
    echo "1. Wait for Gradle sync to complete (may take a few minutes)"
    echo "2. If prompted, accept SDK updates"
    echo "3. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "4. Or run on device: Click green 'Run' button"
    echo ""
    echo "📱 APK will be generated at:"
    echo "app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Android Studio not found!"
    echo "Install with: brew install --cask android-studio"
fi
