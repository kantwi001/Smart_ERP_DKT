#!/bin/bash

echo "🚀 Opening Android Studio with Fixed JDK Configuration"
echo "====================================================="

# Set Android Studio's embedded JDK
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Set Android SDK
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "🔧 Environment configured:"
echo "JAVA_HOME: $JAVA_HOME"
echo "Android SDK: $ANDROID_HOME"
echo ""

if [ -d "/Applications/Android Studio.app" ]; then
    echo "📱 Opening Android project with fixed JDK configuration..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened with embedded JDK!"
    echo ""
    echo "📋 In Android Studio:"
    echo "===================="
    echo "1. Wait for Gradle sync to complete"
    echo "2. If you see JDK issues, go to:"
    echo "   File → Project Structure → SDK Location → Gradle Settings"
    echo "   Set Gradle JDK to: 'Use Embedded JDK'"
    echo "3. Click 'Apply' and 'OK'"
    echo "4. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    
else
    echo "❌ Android Studio not found!"
fi
