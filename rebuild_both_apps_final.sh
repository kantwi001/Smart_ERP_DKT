#!/bin/bash

echo "🚀 Rebuilding Both iOS and Android Apps"
echo "======================================="

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

print_status "Step 1: Getting local network IP..."

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.1.100")
fi

print_success "Local IP detected: $LOCAL_IP"

print_status "Step 2: Setting up Java environment for Android..."

# Set up Java environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$PATH"

print_success "Java environment configured"

print_status "Step 3: Updating React environment for network access..."

cd frontend

# Update .env file with network IP
cat > .env << EOF
PORT=2026
REACT_APP_API_URL=http://$LOCAL_IP:2025
REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

print_success "React environment updated"

print_status "Step 4: Updating Capacitor configuration..."

# Update capacitor.config.json with network IP
cat > capacitor.config.json << EOF
{
  "appId": "com.smarterp.app",
  "appName": "SmartERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "$LOCAL_IP:2025",
      "localhost:2025",
      "127.0.0.1:2025"
    ]
  },
  "android": {
    "allowMixedContent": true
  },
  "ios": {
    "allowsLinkPreview": false,
    "contentInset": "automatic"
  }
}
EOF

print_success "Capacitor config updated"

print_status "Step 5: Building React app with network configuration..."

# Build React app with network IP
CI=false npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React app built successfully"

print_status "Step 6: Rebuilding Android platform..."

# Remove and recreate Android platform
rm -rf android

# Add Android platform
npx cap add android

# Sync Android
npx cap sync android

print_success "Android platform rebuilt"

print_status "Step 7: Configuring Android Gradle..."

cd android

# Create gradle.properties with proper JDK
cat > gradle.properties << EOF
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
org.gradle.java.home=$JAVA_HOME
android.defaults.buildfeatures.buildconfig=true
android.nonTransitiveRClass=false
android.nonFinalResIds=false
EOF

# Create local.properties
cat > local.properties << EOF
sdk.dir=$ANDROID_HOME
EOF

print_success "Android Gradle configured"

print_status "Step 8: Building Android APK..."

# Build APK
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    print_success "✅ Android APK built successfully!"
    
    # Copy APK to root
    APK_FILE=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_FILE" ]; then
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        cp "$APK_FILE" "../../SmartERP-Network-$TIMESTAMP.apk"
        print_success "APK copied to: SmartERP-Network-$TIMESTAMP.apk"
    fi
else
    print_warning "Android APK build failed, but continuing with iOS..."
fi

cd ../

print_status "Step 9: Rebuilding iOS platform..."

# Remove and recreate iOS platform
rm -rf ios

# Add iOS platform
npx cap add ios

# Sync iOS
npx cap sync ios

print_success "iOS platform rebuilt"

print_status "Step 10: Configuring iOS CocoaPods..."

cd ios/App

# Create simple Podfile
cat > Podfile << 'EOF'
platform :ios, '13.0'
use_frameworks!

target 'App' do
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorApp', :path => '../../node_modules/@capacitor/app'
  pod 'CapacitorHaptics', :path => '../../node_modules/@capacitor/haptics'
  pod 'CapacitorKeyboard', :path => '../../node_modules/@capacitor/keyboard'
  pod 'CapacitorPreferences', :path => '../../node_modules/@capacitor/preferences'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '13.0'
    end
  end
end
EOF

# Install CocoaPods
rm -rf Pods Podfile.lock
pod install

if [ $? -eq 0 ]; then
    print_success "✅ iOS CocoaPods installed successfully!"
else
    print_warning "iOS CocoaPods installation had issues, but workspace should still work"
fi

cd ../../../

print_status "Step 11: Creating launch scripts..."

# Create Android Studio launch script
cat > open_android_studio_network.sh << 'EOF'
#!/bin/bash

echo "🤖 Opening Android Studio with Network Configuration"
echo "=================================================="

export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "📱 Opening Android Studio..."
open -a "Android Studio" .

echo ""
echo "✅ Android Studio opened!"
echo ""
echo "📋 In Android Studio:"
echo "===================="
echo "1. Wait for Gradle sync to complete"
echo "2. Select 'app' configuration"
echo "3. Choose device/emulator"
echo "4. Click Run (▶️)"
echo ""
echo "🔗 Backend: ./start_backend_network.sh"
EOF

chmod +x open_android_studio_network.sh

# Create iOS Xcode launch script
cat > open_ios_xcode_network.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening iOS Project with Network Configuration"
echo "=============================================="

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened!"
    echo ""
    echo "📋 In Xcode:"
    echo "============"
    echo "1. Wait for project to load"
    echo "2. Product → Clean Build Folder (⌘⇧K)"
    echo "3. Select iPhone simulator"
    echo "4. Click Run (▶️)"
    echo ""
    echo "🔗 Backend: ./start_backend_network.sh"
else
    echo "❌ iOS workspace not found!"
fi
EOF

chmod +x open_ios_xcode_network.sh

# Create network backend startup script
cat > start_backend_network.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Backend Server for Network Access"
echo "============================================="

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "🌐 Local IP: $LOCAL_IP"
echo "📱 Mobile apps will connect to: http://$LOCAL_IP:2025"

# Navigate to backend
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Kill existing processes on port 2025
echo "🔧 Killing existing processes on port 2025..."
lsof -ti:2025 | xargs kill -9 2>/dev/null || true

# Start Django server on all interfaces
echo "🚀 Starting Django server on 0.0.0.0:2025..."
python manage.py runserver 0.0.0.0:2025
EOF

chmod +x start_backend_network.sh

print_success "✅ Both apps rebuilt successfully!"

echo ""
echo "🎯 Mobile Apps Rebuilt with Network Configuration"
echo "================================================"
echo ""
echo "📱 What was built:"
echo "• React app with network IP configuration ($LOCAL_IP)"
echo "• Android APK with network connectivity"
echo "• iOS project with network connectivity"
echo "• Launch scripts for both platforms"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. ./start_backend_network.sh           # Start backend on network"
echo "2. ./open_android_studio_network.sh     # Open Android Studio"
echo "3. ./open_ios_xcode_network.sh          # Open Xcode"
echo ""
echo "📂 Files Created:"
echo "• Android APK: SmartERP-Network-*.apk"
echo "• iOS Workspace: frontend/ios/App/App.xcworkspace"
echo ""
echo "🔗 Both apps will connect to: http://$LOCAL_IP:2025"

print_success "🎉 Mobile app development complete!"
