#!/bin/bash

echo "📱 Building Mobile Apps - Android APK & iOS Project"
echo "=================================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Setup environment
print_status "Setting up build environment..."

# Navigate to frontend directory
cd frontend

# Stop any running processes
print_status "Stopping any running frontend processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true
sleep 2

# Step 2: Configure for mobile build
print_status "Configuring mobile environment..."
cp .env.mobile .env

echo "Mobile environment configuration:"
cat .env

# Step 3: Install dependencies
print_status "Installing/updating dependencies..."
npm install

# Step 4: Build React app for mobile
print_status "Building React app for mobile deployment..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed successfully"

# Step 5: Sync Capacitor
print_status "Syncing Capacitor with latest build..."
npx cap sync

if [ $? -ne 0 ]; then
    print_warning "Capacitor sync had issues, continuing..."
fi

# Step 6: Build Android APK
print_status "Building Android APK..."

# Check if Android platform exists
if [ ! -d "android" ]; then
    print_status "Adding Android platform..."
    npx cap add android
fi

# Copy latest build to Android
print_status "Copying build to Android platform..."
npx cap copy android

# Build Android APK
print_status "Building Android APK (this may take a few minutes)..."
cd android

# Clean previous builds
./gradlew clean

# Build APK
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Find and copy APK
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Mobile-${TIMESTAMP}.apk"
        print_success "Android APK built successfully: SmartERP-Mobile-${TIMESTAMP}.apk"
        
        # Get APK size
        APK_SIZE=$(ls -lh "../../SmartERP-Mobile-${TIMESTAMP}.apk" | awk '{print $5}')
        print_success "APK Size: $APK_SIZE"
    else
        print_error "APK file not found after build"
    fi
else
    print_error "Android APK build failed"
fi

# Return to frontend directory
cd ..

# Step 7: Build iOS Project
print_status "Preparing iOS project..."

# Check if iOS platform exists
if [ ! -d "ios" ]; then
    print_status "Adding iOS platform..."
    npx cap add ios
fi

# Copy latest build to iOS
print_status "Copying build to iOS platform..."
npx cap copy ios

print_success "iOS project prepared at: frontend/ios/App/App.xcworkspace"

# Step 8: Summary
echo ""
echo "=================================================="
print_success "Mobile App Build Summary"
echo "=================================================="

# List generated files
echo "Generated files:"
ls -la ../*.apk 2>/dev/null || print_warning "No APK files found"

echo ""
print_success "Android APK: Ready for installation on Android devices"
print_success "iOS Project: Open frontend/ios/App/App.xcworkspace in Xcode"

echo ""
echo "Next steps:"
echo "1. Install APK on Android device: adb install SmartERP-Mobile-*.apk"
echo "2. Open iOS project in Xcode and build for device/simulator"
echo "3. Test mobile app functionality"

# Step 9: Test mobile connectivity
print_status "Testing mobile app connectivity..."

# Check if backend is running
if curl -s http://localhost:2025/api/health/ > /dev/null 2>&1; then
    print_success "Backend is running on localhost:2025"
else
    print_warning "Backend not running - start with: cd backend && python manage.py runserver 0.0.0.0:2025"
fi

print_success "Mobile app build process completed!"
