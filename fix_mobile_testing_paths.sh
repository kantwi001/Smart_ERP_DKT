#!/bin/bash

echo "🔧 Fixing Mobile App Testing Paths"
echo "=================================="

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

print_status "Fixing APK file locations..."

# Copy APK to root if not already there
if [ ! -f "smart-erp-software-mobile.apk" ]; then
    # Find APK files and copy to root
    find . -name "*.apk" -exec cp {} . \; 2>/dev/null
    print_success "APK files copied to project root"
fi

print_status "Checking iOS project structure..."

# Check if iOS project exists, if not create it
if [ ! -d "frontend/ios/App/App.xcworkspace" ]; then
    print_warning "iOS project missing. Rebuilding..."
    cd frontend
    
    # Sync Capacitor iOS
    npx cap sync ios
    npx cap copy ios
    
    if [ -d "ios/App/App.xcworkspace" ]; then
        print_success "iOS project created successfully"
    else
        print_error "Failed to create iOS project"
    fi
    
    cd ..
else
    print_success "iOS project already exists"
fi

print_status "Installing ADB if missing..."

# Check and install ADB
if ! command -v adb &> /dev/null; then
    print_warning "ADB not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install android-platform-tools
        print_success "ADB installed"
    else
        print_error "Homebrew not found. Please install ADB manually"
    fi
else
    print_success "ADB is already installed"
fi

echo ""
echo "📱 Ready to Test Mobile Apps!"
echo "============================="

echo ""
echo "🤖 Android Testing (Fixed Paths):"
echo "1. From project root directory:"
echo "   cd /Users/kwadwoantwi/CascadeProjects/erp-system"
echo "2. Connect Android device or start emulator"
echo "3. Install APK:"
echo "   adb install smart-erp-software-mobile.apk"

echo ""
echo "🍎 iOS Testing (Fixed Paths):"
echo "1. From project root directory:"
echo "   cd /Users/kwadwoantwi/CascadeProjects/erp-system"
echo "2. Open Xcode project:"
echo "   open frontend/ios/App/App.xcworkspace"

echo ""
echo "🖥️ Start Backend Server:"
echo "cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend"
echo "python manage.py runserver 0.0.0.0:2025"

# List available APK files
echo ""
print_status "Available APK files:"
ls -lh *.apk 2>/dev/null || print_warning "No APK files found"

# Check iOS project
echo ""
print_status "iOS project status:"
if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    print_success "iOS project ready at: frontend/ios/App/App.xcworkspace"
else
    print_error "iOS project not found"
fi

print_success "Path fixes completed!"
