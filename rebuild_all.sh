#!/bin/bash

# SmartERPSoftware Complete System Rebuild Script
# Rebuilds backend, frontend, and mobile applications with all latest fixes
# Author: SmartERP Development Team
# Version: 2.0

set -e  # Exit on any error

echo "🚀 SmartERPSoftware Complete System Rebuild"
echo "=============================================="
echo ""

# Color codes for output
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

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the ERP system root directory"
    exit 1
fi

print_status "Starting complete system rebuild..."
echo ""

# Step 1: Clean previous builds
print_status "🧹 Cleaning previous builds..."
rm -rf frontend/build/
rm -rf frontend/node_modules/.cache/
rm -rf node_modules/.cache/
rm -f *.apk
rm -rf frontend/android/app/build/
rm -rf frontend/ios/App/build/
print_success "Previous builds cleaned"
echo ""

# Step 2: Install/Update Dependencies
print_status "📦 Installing and updating dependencies..."
npm install
cd frontend
npm install
cd ..
print_success "Dependencies updated"
echo ""

# Step 3: Backend Setup and Migration
print_status "🔧 Setting up backend..."
cd backend

# Activate virtual environment if it exists
if [ -d "../venv" ]; then
    print_status "Activating virtual environment..."
    source ../venv/bin/activate
elif [ -d "venv" ]; then
    print_status "Activating virtual environment..."
    source venv/bin/activate
else
    print_warning "No virtual environment found. Using system Python."
fi

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Run migrations
print_status "Running database migrations..."
python3 manage.py makemigrations
python3 manage.py migrate

# Collect static files
print_status "Collecting static files..."
python3 manage.py collectstatic --noinput

cd ..
print_success "Backend setup complete"
echo ""

# Step 4: Frontend Build
print_status "⚛️ Building React frontend..."
cd frontend

# Build for production
print_status "Building production frontend..."
npm run build

# Copy build to root for mobile apps
print_status "Preparing build for mobile apps..."
cp -r build ../build

cd ..
print_success "Frontend build complete"
echo ""

# Step 5: Mobile App Configuration
print_status "📱 Configuring mobile apps..."

# Ensure Capacitor is installed
cd frontend
if ! command -v npx cap &> /dev/null; then
    print_status "Installing Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# Sync Capacitor
print_status "Syncing Capacitor..."
npx cap sync

# Copy web assets
print_status "Copying web assets to mobile platforms..."
npx cap copy

cd ..
print_success "Mobile app configuration complete"
echo ""

# Step 6: Android Build
print_status "🤖 Building Android APK..."
cd frontend

if [ -d "android" ]; then
    print_status "Building Android APK..."
    
    # Build debug APK (doesn't require keystore)
    cd android
    if command -v ./gradlew &> /dev/null; then
        print_status "Using Gradle wrapper to build debug APK..."
        ./gradlew assembleDebug
    else
        print_status "Using system Gradle to build debug APK..."
        gradle assembleDebug
    fi
    cd ..
    
    # Find and copy APK
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk ../smart-erp-software-mobile.apk
        print_success "Android APK created: smart-erp-software-mobile.apk"
    elif [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release.apk ../smart-erp-software-mobile.apk
        print_success "Android APK created: smart-erp-software-mobile.apk"
    else
        print_warning "APK not found in expected location. Checking all APK outputs..."
        find android -name "*.apk" -type f | head -5
        
        # Try to copy any APK found
        APK_FILE=$(find android -name "*.apk" -type f | head -1)
        if [ -n "$APK_FILE" ]; then
            cp "$APK_FILE" ../smart-erp-software-mobile.apk
            print_success "Android APK created from: $APK_FILE"
        else
            print_error "No APK files found. Android build may have failed."
        fi
    fi
else
    print_warning "Android platform not found. Run 'npx cap add android' first."
fi

cd ..
echo ""

# Step 7: iOS Build Preparation
print_status "🍎 Preparing iOS build..."
cd frontend

if [ -d "ios" ]; then
    print_status "iOS project ready for Xcode build"
    print_status "Open ios/App/App.xcworkspace in Xcode to build iOS app"
else
    print_warning "iOS platform not found. Run 'npx cap add ios' first."
fi

cd ..
echo ""

# Step 8: Final Verification
print_status "🔍 Verifying build outputs..."

# Check backend
if [ -f "backend/manage.py" ]; then
    print_success "✓ Backend ready"
else
    print_error "✗ Backend not found"
fi

# Check frontend build
if [ -d "frontend/build" ]; then
    print_success "✓ Frontend build ready"
else
    print_error "✗ Frontend build not found"
fi

# Check mobile APK
if [ -f "smart-erp-software-mobile.apk" ]; then
    APK_SIZE=$(du -h smart-erp-software-mobile.apk | cut -f1)
    print_success "✓ Android APK ready (${APK_SIZE})"
else
    print_warning "⚠ Android APK not found"
fi

# Check iOS
if [ -d "frontend/ios/App" ]; then
    print_success "✓ iOS project ready for Xcode"
else
    print_warning "⚠ iOS project not found"
fi

echo ""
echo "🎉 Complete System Rebuild Finished!"
echo "====================================="
echo ""
echo "📋 What's Ready:"
echo "  🔧 Backend: Django API with migrations and static files"
echo "  ⚛️  Frontend: Production React build"
echo "  🤖 Android: APK file ready for installation"
echo "  🍎 iOS: Xcode project ready for building"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start backend: ./start_backend.sh"
echo "  2. Start frontend: cd frontend && npm start"
echo "  3. Install Android APK on devices"
echo "  4. Build iOS app in Xcode (ios/App/App.xcworkspace)"
echo ""
echo "🔗 Default URLs:"
echo "  Backend API: http://localhost:2025"
echo "  Frontend Web: http://localhost:2026"
echo ""
echo "✨ All recent fixes included:"
echo "  • Sales order invoice printing with correct prices"
echo "  • Finance pending transactions with invoice numbers"
echo "  • Customer data consistency across modules"
echo "  • Offline sync and mobile optimizations"
echo ""
print_success "SmartERPSoftware rebuild complete! 🎯"
