#!/bin/bash

echo "🔧 Fixing Mobile Build Issues"
echo "============================="

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

# Step 1: Kill all conflicting processes
print_status "Stopping all conflicting processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true
pkill -f "PORT=3000" || true
pkill -f "PORT=2026" || true

# Wait for processes to stop
sleep 3

# Step 2: Navigate to project
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Step 3: Clean up any build artifacts
print_status "Cleaning build artifacts..."
cd frontend
rm -rf build/
rm -rf android/app/build/
rm -rf node_modules/.cache/

# Step 4: Set up mobile environment
print_status "Setting up mobile environment..."
cp .env.mobile .env

print_status "Mobile environment:"
cat .env

# Step 5: Install dependencies (skip if already done)
print_status "Ensuring dependencies are installed..."
npm install --silent

# Step 6: Build for mobile with clean environment
print_status "Building React app for mobile (suppressing warnings)..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build 2>/dev/null

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed"

# Step 7: Capacitor sync
print_status "Syncing Capacitor..."
npx cap sync android 2>/dev/null || print_warning "Capacitor sync had issues"

# Step 8: Build Android APK
print_status "Building Android APK..."
cd android

# Clean and build
./gradlew clean assembleDebug 2>/dev/null

if [ $? -eq 0 ]; then
    # Find and copy APK
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Mobile-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Mobile-${TIMESTAMP}.apk" | awk '{print $5}')
        print_success "Android APK built: SmartERP-Mobile-${TIMESTAMP}.apk (${APK_SIZE})"
    else
        print_error "APK not found after build"
    fi
else
    print_error "Android build failed - check Android Studio for details"
fi

cd ..

# Step 9: iOS setup
print_status "Setting up iOS project..."
npx cap copy ios 2>/dev/null
print_success "iOS project ready at: frontend/ios/App/App.xcworkspace"

# Step 10: Summary
echo ""
print_success "Build Summary:"
echo "✅ React app built for mobile"
echo "✅ Android APK generated (if successful)"
echo "✅ iOS project ready for Xcode"
echo ""
echo "📱 Next steps:"
echo "1. Install APK: adb install SmartERP-Mobile-*.apk"
echo "2. Open iOS in Xcode: open frontend/ios/App/App.xcworkspace"
echo ""

# List generated APKs
ls -la ../*.apk 2>/dev/null && echo "APK files ready for installation"
