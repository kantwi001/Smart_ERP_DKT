#!/bin/bash

echo "🔧 Fixing Android Java Compatibility Issue"
echo "=========================================="

# Set error handling
set -e

# Navigate to Android project
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

echo "📝 Step 1: Adding Java 17 compatibility to app/build.gradle..."
# Backup original file
cp app/build.gradle app/build.gradle.backup

# Add Java compatibility configuration after compileSdk line
sed -i '' '/compileSdk rootProject.ext.compileSdkVersion/a\
\
    compileOptions {\
        sourceCompatibility JavaVersion.VERSION_17\
        targetCompatibility JavaVersion.VERSION_17\
    }
' app/build.gradle

echo "✅ Java 17 compatibility added to app/build.gradle"

echo "📝 Step 2: Setting Gradle JVM to Java 17..."
# Update gradle.properties to use Java 17
echo "" >> gradle.properties
echo "# Java 17 compatibility" >> gradle.properties
echo "org.gradle.java.home=/opt/homebrew/opt/openjdk@17" >> gradle.properties

echo "✅ Gradle configured to use Java 17"

echo "🧹 Step 3: Cleaning previous builds..."
./gradlew clean

echo "🏗️ Step 4: Building Android APK with Java 17..."
./gradlew assembleRelease

# Check if APK was created
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK built successfully with Java 17!"
    
    # Copy to project root with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/release/app-release.apk ../../smart-erp-java17-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 ANDROID APK READY!"
    echo "===================="
    echo ""
    echo "📱 APK Location: smart-erp-java17-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../../smart-erp-java17-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Fixed Issues:"
    echo "   ✅ Java 17 compatibility configured"
    echo "   ✅ Gradle JVM set to Java 17"
    echo "   ✅ Build completed successfully"
    echo ""
    echo "🚀 Installation Options:"
    echo "1. Transfer APK to Android device and install"
    echo "2. Use Android emulator: adb install smart-erp-java17-${TIMESTAMP}.apk"
    echo "3. Upload to Google Play Console for distribution"
    echo ""
    echo "📋 App Details:"
    echo "   • App Name: SmartERPSoftware"
    echo "   • Package: com.smarterpsoftware.app"
    echo "   • Backend: https://erp.tarinnovation.com"
    echo "   • Java Version: 17 (Compatible)"
else
    echo "❌ APK build failed - file not found"
    echo "Restoring original build.gradle..."
    cp app/build.gradle.backup app/build.gradle
    exit 1
fi
