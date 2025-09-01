#!/bin/bash

# Smart ERP Mobile App Build Script
# Builds both Android APK and iOS app with backend connectivity

echo "🚀 Smart ERP Mobile App Build Script"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/kwadwoantwi/CascadeProjects/erp-system"
FRONTEND_DIR="$PROJECT_DIR/frontend"
BUILD_DIR="$FRONTEND_DIR/build"
BACKEND_URL="http://localhost:2025"

# Functions
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

check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Capacitor CLI
    if ! command -v cap &> /dev/null; then
        print_warning "Capacitor CLI not found, installing..."
        npm install -g @capacitor/cli
    fi
    
    print_success "Dependencies check completed"
}

setup_mobile_environment() {
    print_status "Setting up mobile environment..."
    
    cd "$PROJECT_DIR"
    
    # Install Capacitor if not present
    if [ ! -f "package.json" ]; then
        npm init -y
    fi
    
    # Install Capacitor dependencies
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios --save-dev
    
    # Initialize Capacitor if not done
    if [ ! -f "capacitor.config.json" ]; then
        npx cap init "Smart ERP Mobile" "com.smarterp.mobile" --web-dir="frontend/build"
    fi
    
    print_success "Mobile environment setup completed"
}

build_frontend() {
    print_status "Building React frontend for mobile..."
    
    cd "$FRONTEND_DIR"
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Create mobile-specific environment file
    cat > .env.production << EOF
REACT_APP_API_URL=http://localhost:2025/api
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
GENERATE_SOURCEMAP=false
EOF
    
    # Build for production
    print_status "Building React app for production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
}

setup_capacitor_platforms() {
    print_status "Setting up Capacitor platforms..."
    
    cd "$PROJECT_DIR"
    
    # Add Android platform
    if [ ! -d "android" ]; then
        print_status "Adding Android platform..."
        npx cap add android
    fi
    
    # Add iOS platform (macOS only)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [ ! -d "ios" ]; then
            print_status "Adding iOS platform..."
            npx cap add ios
        fi
    else
        print_warning "iOS platform skipped (not on macOS)"
    fi
    
    print_success "Capacitor platforms setup completed"
}

sync_capacitor() {
    print_status "Syncing Capacitor..."
    
    cd "$PROJECT_DIR"
    
    # Copy web assets and sync
    npx cap copy
    npx cap sync
    
    print_success "Capacitor sync completed"
}

build_android() {
    print_status "Building Android APK..."
    
    cd "$PROJECT_DIR"
    
    # Check if Android SDK is available
    if [ -z "$ANDROID_HOME" ]; then
        print_warning "ANDROID_HOME not set, trying common locations..."
        
        # Common Android SDK locations
        ANDROID_LOCATIONS=(
            "$HOME/Library/Android/sdk"
            "$HOME/Android/Sdk"
            "/usr/local/android-sdk"
            "/opt/android-sdk"
        )
        
        for location in "${ANDROID_LOCATIONS[@]}"; do
            if [ -d "$location" ]; then
                export ANDROID_HOME="$location"
                export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
                print_success "Found Android SDK at: $location"
                break
            fi
        done
        
        if [ -z "$ANDROID_HOME" ]; then
            print_error "Android SDK not found. Please install Android Studio or set ANDROID_HOME"
            return 1
        fi
    fi
    
    # Build APK
    cd android
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Build debug APK
    print_status "Building debug APK..."
    ./gradlew assembleDebug
    
    if [ $? -eq 0 ]; then
        # Find and copy APK
        APK_PATH=$(find . -name "*.apk" -path "*/debug/*" | head -1)
        if [ -n "$APK_PATH" ]; then
            cp "$APK_PATH" "$PROJECT_DIR/smart-erp-mobile-debug.apk"
            print_success "Android APK built successfully: smart-erp-mobile-debug.apk"
        else
            print_error "APK file not found"
        fi
    else
        print_error "Android build failed"
        return 1
    fi
    
    cd "$PROJECT_DIR"
}

build_ios() {
    print_status "Building iOS app..."
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_warning "iOS build skipped (not on macOS)"
        return 0
    fi
    
    cd "$PROJECT_DIR"
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed. iOS build requires Xcode."
        return 1
    fi
    
    # Open iOS project in Xcode for manual build
    print_status "Opening iOS project in Xcode..."
    npx cap open ios
    
    print_success "iOS project opened in Xcode. Build manually from Xcode."
}

create_mobile_launcher() {
    print_status "Creating mobile app launcher..."
    
    cd "$PROJECT_DIR"
    
    # Create mobile launcher script
    cat > launch_mobile_app.sh << 'EOF'
#!/bin/bash

echo "🚀 Launching Smart ERP Mobile App"
echo "================================="

# Start backend server
echo "Starting backend server..."
cd backend
python manage.py runserver 0.0.0.0:2025 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Launch mobile app (if on device/emulator)
echo "Backend running on http://localhost:2025"
echo "Mobile app should connect automatically"

# Keep script running
echo "Press Ctrl+C to stop backend server"
wait $BACKEND_PID
EOF
    
    chmod +x launch_mobile_app.sh
    
    print_success "Mobile launcher created: launch_mobile_app.sh"
}

main() {
    print_status "Starting mobile app build process..."
    
    # Check if we're in the right directory
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi
    
    # Run build steps
    check_dependencies
    setup_mobile_environment
    build_frontend
    setup_capacitor_platforms
    sync_capacitor
    
    # Build platforms
    print_status "Building mobile platforms..."
    
    if build_android; then
        print_success "Android build completed"
    else
        print_warning "Android build failed or skipped"
    fi
    
    if build_ios; then
        print_success "iOS setup completed"
    else
        print_warning "iOS build failed or skipped"
    fi
    
    create_mobile_launcher
    
    # Final summary
    echo ""
    print_success "Mobile App Build Summary"
    echo "========================"
    echo "✅ Frontend built for mobile"
    echo "✅ Capacitor configured"
    echo "✅ Android platform ready"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "✅ iOS platform ready"
    fi
    
    echo ""
    echo "📱 Next Steps:"
    echo "1. For Android: Install smart-erp-mobile-debug.apk on your device"
    echo "2. For iOS: Build from Xcode project in ios/ folder"
    echo "3. Start backend: ./launch_mobile_app.sh"
    echo "4. Ensure your device can reach http://localhost:2025"
    echo ""
    echo "🔧 Development:"
    echo "- Android: npx cap run android"
    echo "- iOS: npx cap run ios"
    echo "- Live reload: npx cap run android -l --external"
}

# Run main function
main "$@"

chmod +x build_mobile_app_complete.sh
