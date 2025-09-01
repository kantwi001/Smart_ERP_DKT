#!/bin/bash

echo "📱 Rebuilding Both iOS and Android Mobile Apps"
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

# Set Java environment for Android builds
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

print_status "Using Java: $(java -version 2>&1 | head -n1)"

# Get local IP for backend connectivity
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    print_error "Could not detect local IP address"
    exit 1
fi

print_success "Detected local IP: $LOCAL_IP"

print_status "Step 1: Setting up mobile environment..."

cd frontend

# Create mobile environment configuration
cat > .env.mobile << EOF
PORT=2026
REACT_APP_API_URL=http://$LOCAL_IP:2025
REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

# Use mobile environment
cp .env.mobile .env

print_success "Mobile environment configured with IP: $LOCAL_IP"

print_status "Step 2: Building React app for mobile..."

# Build React app with mobile configuration
REACT_APP_API_URL=http://$LOCAL_IP:2025 REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025 GENERATE_SOURCEMAP=false npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React app built successfully"

print_status "Step 3: Configuring Capacitor..."

# Create optimized Capacitor configuration
cat > capacitor.config.json << EOF
{
  "appId": "com.smarterp.app",
  "appName": "Smart ERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "$LOCAL_IP:2025",
      "localhost:2025"
    ]
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  },
  "ios": {
    "allowsLinkPreview": false,
    "handleApplicationURL": false
  }
}
EOF

print_success "Capacitor configuration updated"

print_status "Step 4: Rebuilding mobile platforms..."

# Remove existing platforms
print_warning "Removing existing mobile platforms..."
rm -rf android ios

# Add platforms fresh
print_status "Adding Android platform..."
npx cap add android

print_status "Adding iOS platform..."
npx cap add ios

# Sync platforms
print_status "Syncing platforms..."
npx cap sync android
npx cap sync ios

print_success "Mobile platforms rebuilt"

print_status "Step 5: Configuring Android project..."

cd android

# Configure gradle.properties
cat > gradle.properties << EOF
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
android.useAndroidX=true
android.enableJetifier=true
android.enableR8.fullMode=true
android.enableBuildCache=true

# Use Android Studio's embedded JDK
org.gradle.java.home=/Applications/Android Studio.app/Contents/jbr/Contents/Home
EOF

# Configure local.properties
cat > local.properties << EOF
# SDK and JDK locations
sdk.dir=$HOME/Library/Android/sdk
org.gradle.java.home=/Applications/Android Studio.app/Contents/jbr/Contents/Home
EOF

print_success "Android project configured"

print_status "Step 6: Building Android APK..."

# Build Android APK
./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Find and copy APK
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Rebuilt-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Rebuilt-${TIMESTAMP}.apk" | awk '{print $5}')
        
        print_success "✅ Android APK built successfully!"
        echo "📱 APK Details:"
        echo "   File: SmartERP-Rebuilt-${TIMESTAMP}.apk"
        echo "   Size: $APK_SIZE"
        echo "   Backend URL: http://$LOCAL_IP:2025"
    else
        print_error "APK file not found after build"
    fi
else
    print_error "Android APK build failed"
fi

cd ../..

print_status "Step 7: Preparing iOS project for Xcode..."

# Verify iOS project structure
if [ -d "frontend/ios/App/App.xcworkspace" ]; then
    print_success "✅ iOS project ready for Xcode"
    echo "📱 iOS Project Location: frontend/ios/App/App.xcworkspace"
else
    print_error "iOS project structure incomplete"
fi

print_status "Step 8: Creating convenience scripts..."

# Create script to open iOS in Xcode
cat > open_ios_xcode.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App

if [ -f "App.xcworkspace" ]; then
    echo "📱 Opening Xcode workspace..."
    open App.xcworkspace
    
    echo ""
    echo "✅ Xcode opened!"
    echo ""
    echo "📋 Next Steps in Xcode:"
    echo "======================"
    echo "1. Select your target device or simulator"
    echo "2. Click the Run button (▶️) to build and test"
    echo "3. For App Store: Product → Archive"
    echo ""
    echo "🔗 Backend URL configured: Check your local IP"
else
    echo "❌ iOS workspace not found!"
    echo "Run: ./rebuild_both_mobile_apps.sh first"
fi
EOF

chmod +x open_ios_xcode.sh

# Create script to open Android Studio
cat > open_android_studio.sh << 'EOF'
#!/bin/bash

echo "🤖 Opening Android Project in Android Studio"
echo "============================================"

# Set environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

if [ -f "build.gradle" ]; then
    echo "📱 Opening Android Studio..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "==============================="
    echo "1. Wait for Gradle sync to complete"
    echo "2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "3. Or click Run button to test on device"
else
    echo "❌ Android project not found!"
    echo "Run: ./rebuild_both_mobile_apps.sh first"
fi
EOF

chmod +x open_android_studio.sh

# Create backend startup script
cat > start_backend_for_mobile.sh << EOF
#!/bin/bash

echo "🖥️ Starting Backend Server for Mobile Apps"
echo "=========================================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
fi

echo ""
echo "🌐 Backend accessible at:"
echo "   Local: http://localhost:2025"
echo "   Mobile: http://$LOCAL_IP:2025"
echo ""
echo "📱 Mobile apps configured to connect to: http://$LOCAL_IP:2025"
echo ""

# Start Django server on all interfaces
python manage.py runserver 0.0.0.0:2025
EOF

chmod +x start_backend_for_mobile.sh

print_success "✅ Both mobile apps rebuilt successfully!"

echo ""
echo "🎯 Mobile Apps Ready!"
echo "===================="
echo ""
echo "📱 Android APK:"
echo "   File: SmartERP-Rebuilt-*.apk"
echo "   Install: adb install SmartERP-Rebuilt-*.apk"
echo "   Or open: ./open_android_studio.sh"
echo ""
echo "🍎 iOS Project:"
echo "   Open: ./open_ios_xcode.sh"
echo "   Location: frontend/ios/App/App.xcworkspace"
echo ""
echo "🖥️ Backend Server:"
echo "   Start: ./start_backend_for_mobile.sh"
echo "   URL: http://$LOCAL_IP:2025"
echo ""
echo "📋 Testing Workflow:"
echo "==================="
echo "1. Start backend: ./start_backend_for_mobile.sh"
echo "2. Install Android APK or run iOS in Xcode"
echo "3. Ensure device is on same WiFi network"
echo "4. Test app functionality with backend connectivity"

print_success "🎉 Mobile app rebuild completed!"
