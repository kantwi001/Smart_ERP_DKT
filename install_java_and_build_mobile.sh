#!/bin/bash

echo "☕ Installing Java Runtime and Building Mobile Apps"
echo "=================================================="

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

# Step 1: Check if Java is already installed
print_status "Checking Java installation..."
if java -version 2>&1 >/dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n1 | cut -d'"' -f2)
    print_success "Java is already installed: $JAVA_VERSION"
else
    print_warning "Java not found. Installing Java..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_status "Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install Java 17 (required for Android builds)
    print_status "Installing Java 17 via Homebrew..."
    brew install openjdk@17
    
    # Add Java to PATH
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
    
    # For current session
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    
    # Create symlink for system Java
    sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
    
    print_success "Java 17 installed successfully"
fi

# Step 2: Verify Java installation
print_status "Verifying Java installation..."
java -version
javac -version

# Step 3: Set Android environment variables
print_status "Setting up Android environment..."
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

# Step 4: Navigate to project and run mobile build
print_status "Starting mobile app build process..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Kill any existing processes
print_status "Stopping conflicting processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true
pkill -f "PORT=3000" || true
pkill -f "PORT=2026" || true
sleep 3

# Navigate to frontend
cd frontend

# Clean build artifacts
print_status "Cleaning build artifacts..."
rm -rf build/
rm -rf android/app/build/
rm -rf node_modules/.cache/

# Set mobile environment
print_status "Setting mobile environment..."
cp .env.mobile .env

print_status "Current environment:"
cat .env

# Install dependencies
print_status "Installing dependencies..."
npm install --silent

# Build React app for mobile
print_status "Building React app for mobile..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed"

# Sync Capacitor
print_status "Syncing Capacitor platforms..."
npx cap sync android
npx cap copy android

# Build Android APK
print_status "Building Android APK with Java..."
cd android

# Clean previous builds
./gradlew clean

# Build debug APK
print_status "Building debug APK (this may take several minutes)..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Find and copy APK
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Mobile-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Mobile-${TIMESTAMP}.apk" | awk '{print $5}')
        print_success "Android APK built successfully!"
        print_success "File: SmartERP-Mobile-${TIMESTAMP}.apk"
        print_success "Size: $APK_SIZE"
    else
        print_error "APK file not found after build"
    fi
else
    print_error "Android APK build failed"
    print_status "Check the Gradle output above for specific errors"
fi

# Return to frontend directory
cd ..

# Setup iOS project
print_status "Setting up iOS project..."
npx cap sync ios
npx cap copy ios

print_success "iOS project ready at: frontend/ios/App/App.xcworkspace"

# Final summary
echo ""
echo "=================================================="
print_success "Mobile App Build Summary"
echo "=================================================="

# List generated APKs
echo "Generated files:"
ls -la ../*.apk 2>/dev/null || print_warning "No APK files found"

echo ""
print_success "✅ Java Runtime: Installed and configured"
print_success "✅ React App: Built for mobile"
print_success "✅ Android APK: Generated (if build succeeded)"
print_success "✅ iOS Project: Ready for Xcode"

echo ""
echo "📱 Next Steps:"
echo "1. Install APK on Android device:"
echo "   adb install SmartERP-Mobile-*.apk"
echo ""
echo "2. Test iOS app in Xcode:"
echo "   open frontend/ios/App/App.xcworkspace"
echo ""
echo "3. Start backend server:"
echo "   cd backend && python manage.py runserver 0.0.0.0:2025"

# Test backend connectivity
print_status "Testing backend connectivity..."
if curl -s http://localhost:2025/api/health/ > /dev/null 2>&1; then
    print_success "Backend is running on localhost:2025"
else
    print_warning "Backend not running - start it for mobile app to work properly"
fi

print_success "Mobile app build process completed!"
