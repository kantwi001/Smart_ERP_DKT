#!/bin/bash

# ERP System Mobile Testing Setup Script
# Sets up Android emulator and testing environment

echo "🧪 Setting up ERP System Mobile Testing Environment..."
echo "===================================================="

# Check if Android SDK is properly configured
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Attempting to configure..."
    
    # Common Android SDK locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        echo "✅ Found Android SDK at: $ANDROID_HOME"
    elif [ -d "/usr/local/share/android-sdk" ]; then
        export ANDROID_HOME="/usr/local/share/android-sdk"
        echo "✅ Found Android SDK at: $ANDROID_HOME"
    else
        echo "❌ Android SDK not found!"
        echo "💡 Please install Android Studio and configure ANDROID_HOME"
        exit 1
    fi
fi

# Add Android tools to PATH
export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "📱 Step 1: Checking Android SDK components..."

# Check if required SDK components are installed
sdkmanager --list | grep -E "system-images|platforms|build-tools" | head -10

echo "📱 Step 2: Installing required SDK components..."

# Install required components for emulator
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "system-images;android-34;google_apis;arm64-v8a"

if [ $? -ne 0 ]; then
    echo "⚠️  SDK component installation had issues - continuing anyway"
fi

echo "📱 Step 3: Creating Android Virtual Device (AVD)..."

# Create AVD for testing
echo "no" | avdmanager create avd -n "ERP_Test_Device" -k "system-images;android-34;google_apis;arm64-v8a" -d "pixel_7" --force

if [ $? -eq 0 ]; then
    echo "✅ Android Virtual Device created successfully!"
else
    echo "⚠️  AVD creation had issues - you may need to create manually"
fi

echo "📱 Step 4: Starting Android Emulator..."

# Start emulator in background
emulator -avd ERP_Test_Device -no-snapshot-save -no-boot-anim &

if [ $? -eq 0 ]; then
    echo "✅ Android Emulator starting..."
    echo "⏳ Please wait for emulator to fully boot (2-3 minutes)"
else
    echo "⚠️  Emulator start had issues"
fi

echo "📱 Step 5: Preparing APK installation..."

# Wait for device to be ready
echo "⏳ Waiting for device to be ready..."
adb wait-for-device

echo "✅ Device is ready!"

echo ""
echo "🎉 Mobile Testing Environment Setup Complete!"
echo "============================================="
echo ""
echo "📱 Next Steps:"
echo "1. Wait for emulator to fully boot"
echo "2. Run './build_mobile_app.sh' to build APK"
echo "3. Install APK: adb install erp-system-mobile.apk"
echo "4. Test the ERP app on the emulator"
echo ""
echo "🔧 Useful Commands:"
echo "- List devices: adb devices"
echo "- Install APK: adb install erp-system-mobile.apk"
echo "- View logs: adb logcat"
echo "- Screenshot: adb exec-out screencap -p > screenshot.png"
echo ""
echo "💡 Troubleshooting:"
echo "- If emulator doesn't start, try: emulator -list-avds"
echo "- Check available system images: sdkmanager --list"
echo "- Restart adb server: adb kill-server && adb start-server"
