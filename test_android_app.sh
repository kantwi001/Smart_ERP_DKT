#!/bin/bash
echo "🤖 Testing Android App"
echo "====================="

# Check for devices
DEVICES=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)
if [ $DEVICES -eq 0 ]; then
    echo "❌ No Android devices found. Please connect a device or start an emulator."
    echo "Run: ./setup_mobile_testing_environment.sh for setup instructions"
    exit 1
fi

echo "📱 Installing APK..."
adb install -r smart-erp-software-mobile.apk

if [ $? -eq 0 ]; then
    echo "✅ APK installed successfully!"
    echo "📱 Launch the 'Smart ERP' app on your device"
else
    echo "❌ APK installation failed"
fi
