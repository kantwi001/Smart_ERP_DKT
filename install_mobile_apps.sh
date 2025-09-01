#!/bin/bash

echo "📱 Installing Mobile Apps"
echo "========================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Find the latest APK
LATEST_APK=$(ls -t SmartERP-Fixed-*.apk 2>/dev/null | head -1)

if [ -z "$LATEST_APK" ]; then
    print_error "No APK found! Please build first:"
    echo "   ./fix_java_and_rebuild_mobile.sh"
    exit 1
fi

echo "📱 Found APK: $LATEST_APK"
APK_SIZE=$(ls -lh "$LATEST_APK" | awk '{print $5}')
echo "📊 Size: $APK_SIZE"

# Check if ADB is available
if ! command -v adb >/dev/null 2>&1; then
    print_warning "ADB not found. Installing Android Platform Tools..."
    if command -v brew >/dev/null 2>&1; then
        brew install --cask android-platform-tools
    else
        print_error "Please install ADB manually or use Homebrew"
        exit 1
    fi
fi

# Check for connected devices
echo ""
echo "🔍 Checking for connected Android devices..."
adb devices

DEVICE_COUNT=$(adb devices | grep -v "List of devices" | grep -c "device$")

if [ "$DEVICE_COUNT" -eq 0 ]; then
    print_warning "No Android devices connected!"
    echo ""
    echo "📋 To connect a device:"
    echo "======================"
    echo "1. Enable Developer Options on your Android device"
    echo "2. Enable USB Debugging"
    echo "3. Connect via USB cable"
    echo "4. Allow USB debugging when prompted"
    echo ""
    echo "Or use Android Studio emulator"
    exit 1
fi

echo ""
print_success "Installing APK on connected device(s)..."

# Install APK
if adb install -r "$LATEST_APK"; then
    print_success "✅ APK installed successfully!"
    echo ""
    echo "📱 App Details:"
    echo "==============="
    echo "   Name: Smart ERP"
    echo "   Package: com.smarterp.app"
    echo "   File: $LATEST_APK"
    echo "   Size: $APK_SIZE"
    echo ""
    echo "🚀 Next Steps:"
    echo "=============="
    echo "1. Start backend: ./start_backend_for_mobile.sh"
    echo "2. Open Smart ERP app on your device"
    echo "3. Ensure device is on same WiFi network"
    echo "4. Test app functionality"
else
    print_error "APK installation failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "=================="
    echo "1. Check USB debugging is enabled"
    echo "2. Try: adb kill-server && adb start-server"
    echo "3. Disconnect and reconnect device"
    echo "4. Or install manually by copying APK to device"
fi
