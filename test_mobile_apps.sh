#!/bin/bash

echo "📱 Testing Mobile Apps - Setup and Instructions"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

print_status "Checking mobile app files..."

# Check APK files
echo "📱 Android APK Files:"
ls -lh *.apk 2>/dev/null || print_warning "No APK files found in root directory"

# Check iOS project
echo ""
echo "🍎 iOS Project:"
if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    print_success "iOS project found at: frontend/ios/App/App.xcworkspace"
else
    print_warning "iOS project not found. Let's check the structure..."
    find . -name "App.xcworkspace" -type d 2>/dev/null || print_error "No Xcode workspace found"
fi

echo ""
echo "🔧 Android Device Setup:"
print_status "Checking for connected Android devices..."

# Check ADB installation
if command -v adb &> /dev/null; then
    print_success "ADB is installed"
    
    # Check for devices
    DEVICES=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)
    if [ $DEVICES -eq 0 ]; then
        print_warning "No Android devices/emulators connected"
        echo ""
        echo "To connect an Android device:"
        echo "1. Enable Developer Options on your Android device"
        echo "2. Enable USB Debugging"
        echo "3. Connect via USB cable"
        echo "4. Accept the debugging prompt on your device"
        echo ""
        echo "To start an Android emulator:"
        echo "1. Open Android Studio"
        echo "2. Go to Tools > AVD Manager"
        echo "3. Create or start a virtual device"
    else
        print_success "$DEVICES Android device(s) connected"
        echo "Connected devices:"
        adb devices
    fi
else
    print_error "ADB not found. Install Android SDK Platform Tools"
    echo "Install via Homebrew: brew install android-platform-tools"
fi

echo ""
echo "📋 Testing Instructions:"
echo "========================"

echo ""
echo "🤖 Android Testing:"
echo "1. Connect Android device or start emulator"
echo "2. Install APK:"
echo "   cd /Users/kwadwoantwi/CascadeProjects/erp-system"
echo "   adb install smart-erp-software-mobile.apk"
echo "3. Launch the app on your device"

echo ""
echo "🍎 iOS Testing:"
echo "1. Open Xcode project:"
if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    echo "   open frontend/ios/App/App.xcworkspace"
else
    echo "   First, let's rebuild the iOS project..."
    echo "   cd frontend && npx cap sync ios"
    echo "   Then: open ios/App/App.xcworkspace"
fi
echo "2. Select a simulator or connected iOS device"
echo "3. Click the Run button in Xcode"

echo ""
echo "🖥️ Backend Server:"
echo "Make sure the backend is running for API connectivity:"
echo "cd backend && python manage.py runserver 0.0.0.0:2025"

echo ""
echo "🧪 Test Scenarios:"
echo "=================="
echo "✓ Login with existing credentials"
echo "✓ Navigate through different modules (Sales, HR, Inventory)"
echo "✓ Create a new customer or product"
echo "✓ Test offline functionality (disconnect internet)"
echo "✓ Check data synchronization when back online"

# Check if backend is running
echo ""
print_status "Checking backend connectivity..."
if curl -s http://localhost:2025/api/health/ > /dev/null 2>&1; then
    print_success "Backend is running on localhost:2025"
else
    print_warning "Backend not running. Start it with:"
    echo "cd backend && python manage.py runserver 0.0.0.0:2025"
fi

echo ""
print_success "Mobile app testing setup complete!"
echo "Follow the instructions above to test your mobile apps."
