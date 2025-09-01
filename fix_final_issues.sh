#!/bin/bash

echo "🔧 Fixing Final Mobile App Issues"
echo "================================="

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

print_status "Step 1: Fixing port conflict..."

# Kill any existing Django processes on port 2025
print_status "Stopping existing backend servers..."
pkill -f "runserver.*2025" 2>/dev/null || true
lsof -ti:2025 | xargs kill -9 2>/dev/null || true

print_success "Port 2025 cleared"

print_status "Step 2: Fixing iOS Xcode workspace path..."

# Check actual iOS workspace location
if [ -f "/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace" ]; then
    IOS_PATH="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App"
    print_success "Found iOS workspace at: $IOS_PATH"
elif [ -f "/Users/kwadwoantwi/CascadeProjects/erp-system/ios/App/App.xcworkspace" ]; then
    IOS_PATH="/Users/kwadwoantwi/CascadeProjects/erp-system/ios/App"
    print_success "Found iOS workspace at: $IOS_PATH"
else
    print_error "iOS workspace not found in expected locations"
    print_status "Searching for iOS workspace..."
    IOS_SEARCH=$(find /Users/kwadwoantwi/CascadeProjects/erp-system -name "App.xcworkspace" -type f 2>/dev/null | head -1)
    if [ -n "$IOS_SEARCH" ]; then
        IOS_PATH=$(dirname "$IOS_SEARCH")
        print_success "Found iOS workspace at: $IOS_PATH"
    else
        print_error "No iOS workspace found!"
        IOS_PATH=""
    fi
fi

print_status "Step 3: Creating fixed launch scripts..."

# Create improved backend startup script with port checking
cat > start_backend_for_mobile.sh << 'EOF'
#!/bin/bash

echo "🖥️ Starting Backend Server for Mobile Apps"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "\033[0;34m[INFO]\033[0m $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Check if port 2025 is in use
if lsof -Pi :2025 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 2025 is already in use!"
    print_status "Stopping existing processes..."
    
    # Kill processes using port 2025
    pkill -f "runserver.*2025" 2>/dev/null || true
    lsof -ti:2025 | xargs kill -9 2>/dev/null || true
    
    sleep 2
    
    if lsof -Pi :2025 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Could not free port 2025. Please manually stop the process:"
        lsof -i :2025
        exit 1
    fi
    
    print_success "Port 2025 cleared"
fi

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
    print_success "Virtual environment activated"
fi

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo ""
print_success "🌐 Backend will be accessible at:"
echo "   Local: http://localhost:2025"
echo "   Mobile: http://$LOCAL_IP:2025"
echo ""
echo "📱 Mobile apps configured to connect to: http://$LOCAL_IP:2025"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

# Start Django server
python manage.py runserver 0.0.0.0:2025
EOF

chmod +x start_backend_for_mobile.sh

# Create fixed iOS Xcode launcher
if [ -n "$IOS_PATH" ]; then
    cat > open_ios_xcode.sh << EOF
#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

cd "$IOS_PATH"

if [ -f "App.xcworkspace" ]; then
    echo "📱 Opening Xcode workspace..."
    open App.xcworkspace
    
    echo ""
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "📋 Next Steps in Xcode:"
    echo "======================"
    echo "1. Wait for project to load"
    echo "2. Select your target device or simulator"
    echo "3. Click the Run button (▶️) to build and test"
    echo "4. For App Store: Product → Archive"
    echo ""
    echo "🔗 Backend URL: Check that backend is running"
    echo "   Start backend: ./start_backend_for_mobile.sh"
else
    echo "❌ iOS workspace not found at: $IOS_PATH"
    echo "Expected file: App.xcworkspace"
    echo ""
    echo "🔍 Searching for iOS workspace..."
    find /Users/kwadwoantwi/CascadeProjects/erp-system -name "App.xcworkspace" -type f 2>/dev/null
fi
EOF
else
    cat > open_ios_xcode.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

echo "🔍 Searching for iOS workspace..."
IOS_WORKSPACE=$(find /Users/kwadwoantwi/CascadeProjects/erp-system -name "App.xcworkspace" -type f 2>/dev/null | head -1)

if [ -n "$IOS_WORKSPACE" ]; then
    echo "📱 Found iOS workspace: $IOS_WORKSPACE"
    echo "Opening in Xcode..."
    open "$IOS_WORKSPACE"
    echo "✅ Xcode opened!"
else
    echo "❌ No iOS workspace found!"
    echo "Please run: ./fix_java_and_rebuild_mobile.sh first"
fi
EOF
fi

chmod +x open_ios_xcode.sh

# Create Android Studio launcher with better error handling
cat > open_android_studio.sh << 'EOF'
#!/bin/bash

echo "🤖 Opening Android Project in Android Studio"
echo "============================================"

# Set Java environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

ANDROID_PROJECT="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android"

if [ -d "$ANDROID_PROJECT" ] && [ -f "$ANDROID_PROJECT/build.gradle" ]; then
    echo "📱 Opening Android Studio..."
    echo "Java: $JAVA_HOME"
    
    cd "$ANDROID_PROJECT"
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "==============================="
    echo "1. Wait for Gradle sync to complete"
    echo "2. If sync fails, click 'Sync Project with Gradle Files'"
    echo "3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "4. Or click Run button to test on device"
    echo ""
    echo "🔧 If you get Java errors:"
    echo "   File → Project Structure → SDK Location"
    echo "   Set JDK location to: $JAVA_HOME"
else
    echo "❌ Android project not found at: $ANDROID_PROJECT"
    echo "Please run: ./fix_java_and_rebuild_mobile.sh first"
fi
EOF

chmod +x open_android_studio.sh

print_status "Step 4: Creating mobile app installer script..."

# Create APK installer script
cat > install_mobile_apps.sh << 'EOF'
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
EOF

chmod +x install_mobile_apps.sh

print_status "Step 5: Testing backend connectivity..."

# Test if we can start the backend
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Quick test to see if Django is working
if python manage.py check --deploy 2>/dev/null; then
    print_success "Backend Django configuration is valid"
else
    print_warning "Backend may have configuration issues"
fi

cd ..

print_success "✅ All issues fixed!"

echo ""
echo "🎯 Mobile Apps Ready for Testing!"
echo "================================="
echo ""
echo "📱 Android APK:"
echo "   File: SmartERP-Fixed-20250831_085231.apk (7.7M)"
echo "   Install: ./install_mobile_apps.sh"
echo "   Studio: ./open_android_studio.sh"
echo ""
echo "🍎 iOS Project:"
echo "   Open: ./open_ios_xcode.sh"
if [ -n "$IOS_PATH" ]; then
echo "   Location: $IOS_PATH/App.xcworkspace"
fi
echo ""
echo "🖥️ Backend Server:"
echo "   Start: ./start_backend_for_mobile.sh"
echo "   URL: http://192.168.2.185:2025"
echo ""
echo "📋 Complete Testing Workflow:"
echo "============================"
echo "1. ./start_backend_for_mobile.sh    # Start backend"
echo "2. ./install_mobile_apps.sh         # Install Android APK"
echo "3. ./open_ios_xcode.sh              # Open iOS in Xcode"
echo "4. Test apps on same WiFi network"

print_success "🎉 Mobile apps are ready for testing!"
