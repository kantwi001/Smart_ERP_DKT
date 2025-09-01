#!/bin/bash

echo "🔧 Setting Up Mobile Testing Environment"
echo "========================================"

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

print_status "Setting up Python environment for backend..."

# Check Python installation
if command -v python3 &> /dev/null; then
    print_success "Python3 found"
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    print_success "Python found"
    PYTHON_CMD="python"
else
    print_error "Python not found. Installing via Homebrew..."
    if command -v brew &> /dev/null; then
        brew install python
        PYTHON_CMD="python3"
    else
        print_error "Please install Python manually"
        exit 1
    fi
fi

# Setup backend virtual environment
print_status "Setting up backend virtual environment..."
cd backend

if [ ! -d "venv" ]; then
    print_status "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

print_status "Activating virtual environment..."
source venv/bin/activate

print_status "Installing backend dependencies..."
pip install -r requirements.txt

print_success "Backend environment ready"

# Return to project root
cd ..

print_status "Setting up Android testing environment..."

# Install ADB if missing
if ! command -v adb &> /dev/null; then
    print_warning "Installing Android Platform Tools..."
    if command -v brew &> /dev/null; then
        brew install android-platform-tools
        print_success "ADB installed"
    else
        print_error "Please install Homebrew first"
    fi
else
    print_success "ADB already installed"
fi

# Check for Android devices/emulators
print_status "Checking for Android devices..."
DEVICES=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)

if [ $DEVICES -eq 0 ]; then
    print_warning "No Android devices/emulators found"
    echo ""
    echo "📱 Android Device Setup Options:"
    echo "================================"
    echo ""
    echo "Option 1 - Physical Device:"
    echo "1. Enable Developer Options:"
    echo "   Settings → About Phone → Tap 'Build Number' 7 times"
    echo "2. Enable USB Debugging:"
    echo "   Settings → Developer Options → USB Debugging"
    echo "3. Connect device via USB"
    echo "4. Accept debugging prompt on device"
    echo ""
    echo "Option 2 - Android Emulator:"
    echo "1. Install Android Studio from: https://developer.android.com/studio"
    echo "2. Open Android Studio"
    echo "3. Tools → AVD Manager"
    echo "4. Create Virtual Device → Choose device → Download system image"
    echo "5. Start the emulator"
    echo ""
    echo "Option 3 - Quick Emulator Setup:"
    if command -v brew &> /dev/null; then
        echo "Run: brew install --cask android-studio"
        echo "Then follow Option 2 steps above"
    fi
else
    print_success "$DEVICES Android device(s) connected:"
    adb devices
fi

# Create convenient testing scripts
print_status "Creating convenient testing scripts..."

# Android testing script
cat > test_android_app.sh << 'EOF'
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
EOF

# iOS testing script
cat > test_ios_app.sh << 'EOF'
#!/bin/bash
echo "🍎 Testing iOS App"
echo "=================="

if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    echo "📱 Opening Xcode project..."
    open frontend/ios/App/App.xcworkspace
    echo "✅ Xcode opened. Select a simulator and click Run"
else
    echo "❌ iOS project not found. Rebuilding..."
    cd frontend
    npx cap sync ios
    if [ -d "ios/App/App.xcworkspace" ]; then
        echo "✅ iOS project created"
        open ios/App/App.xcworkspace
    else
        echo "❌ Failed to create iOS project"
    fi
fi
EOF

# Backend startup script
cat > start_backend_server.sh << 'EOF'
#!/bin/bash
echo "🖥️ Starting Backend Server"
echo "=========================="

cd backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run setup_mobile_testing_environment.sh first"
    exit 1
fi

# Start server
echo "🚀 Starting Django server on 0.0.0.0:2025..."
python manage.py runserver 0.0.0.0:2025
EOF

# Make scripts executable
chmod +x test_android_app.sh
chmod +x test_ios_app.sh
chmod +x start_backend_server.sh

print_success "Testing scripts created:"
echo "  • test_android_app.sh - Install and test Android APK"
echo "  • test_ios_app.sh - Open and test iOS project"
echo "  • start_backend_server.sh - Start backend server"

echo ""
echo "🚀 Quick Start Guide:"
echo "===================="
echo ""
echo "1. Start Backend Server:"
echo "   ./start_backend_server.sh"
echo ""
echo "2. Test Android App (in new terminal):"
echo "   ./test_android_app.sh"
echo ""
echo "3. Test iOS App (in new terminal):"
echo "   ./test_ios_app.sh"

print_success "Mobile testing environment setup complete!"
