#!/bin/bash

echo "🤖 Opening Android Project in Android Studio"
echo "============================================"

# Set Java environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

ANDROID_PROJECT="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android"

if [ -d "$ANDROID_PROJECT" ] && [ -f "$ANDROID_PROJECT/build.gradle" ]; then
    echo "📱 Opening Android Studio..."
    echo "Java: $JAVA_HOME"
    
    cd "$ANDROID_PROJECT"
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "==============================="
    echo "1. Wait for Gradle sync to complete"
    echo "2. If sync fails, click 'Sync Project with Gradle Files'"
    echo "3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "4. Or click Run button to test on device"
    echo ""
    echo "🔧 If you get Java errors:"
    echo "   File → Project Structure → SDK Location"
    echo "   Set JDK location to: $JAVA_HOME"
else
    echo "❌ Android project not found at: $ANDROID_PROJECT"
    echo "Please run: ./fix_java_and_rebuild_mobile.sh first"
fi
