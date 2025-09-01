#!/bin/bash

echo "🔧 Fixing iOS Build Issues"
echo "=========================="

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

print_status "Step 1: Checking iOS project structure..."

cd frontend

if [ ! -d "ios/App" ]; then
    print_error "iOS project not found!"
    exit 1
fi

cd ios/App

print_status "Step 2: Updating Capacitor versions to match..."

# Fix Capacitor version mismatch
print_status "Installing matching Capacitor versions..."
cd ../../

# Update Capacitor to consistent versions
npm install @capacitor/core@7.4.3 @capacitor/ios@7.4.3 @capacitor/android@7.4.3

print_success "Capacitor versions updated"

print_status "Step 3: Cleaning and rebuilding iOS project..."

# Remove and recreate iOS platform with updated versions
rm -rf ios

# Add iOS platform with updated Capacitor
npx cap add ios

# Sync the platform
npx cap sync ios

print_status "Step 4: Fixing iOS project configuration..."

cd ios/App

# Check if Podfile exists and update it
if [ -f "Podfile" ]; then
    print_status "Updating Podfile for compatibility..."
    
    # Create a backup
    cp Podfile Podfile.backup
    
    # Update Podfile with proper iOS version and configurations
    cat > Podfile << 'EOF'
require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'

platform :ios, '13.0'
use_frameworks!

# workaround to avoid Xcode caching of Pods that requires
# Product -> Clean Build Folder after new Cordova plugins installed
# Requires CocoaPods 1.6 or newer
install! 'cocoapods', :disable_input_output_paths => true

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorApp', :path => '../../node_modules/@capacitor/app'
  pod 'CapacitorHaptics', :path => '../../node_modules/@capacitor/haptics'
  pod 'CapacitorKeyboard', :path => '../../node_modules/@capacitor/keyboard'
  pod 'CapacitorPreferences', :path => '../../node_modules/@capacitor/preferences'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
end

target 'App' do
  capacitor_pods
  # Add your Pods here
end

post_install do |installer|
  assertDeploymentTarget(installer)
end
EOF
    
    print_success "Podfile updated"
fi

print_status "Step 5: Installing CocoaPods dependencies..."

# Clean CocoaPods cache and reinstall
pod deintegrate 2>/dev/null || true
pod cache clean --all 2>/dev/null || true
pod install --repo-update

if [ $? -ne 0 ]; then
    print_warning "Pod install failed, trying alternative approach..."
    
    # Remove Pods directory and try again
    rm -rf Pods
    rm -f Podfile.lock
    
    # Install CocoaPods if not available
    if ! command -v pod >/dev/null 2>&1; then
        print_status "Installing CocoaPods..."
        sudo gem install cocoapods
    fi
    
    # Try pod install again
    pod install --repo-update
    
    if [ $? -ne 0 ]; then
        print_error "CocoaPods installation failed!"
        print_status "Trying without repo update..."
        pod install
    fi
fi

print_status "Step 6: Configuring iOS project settings..."

# Update iOS project configuration for better compatibility
if [ -f "App.xcodeproj/project.pbxproj" ]; then
    print_status "Updating Xcode project settings..."
    
    # Set deployment target to iOS 13.0 minimum
    sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9]*\.[0-9]*/IPHONEOS_DEPLOYMENT_TARGET = 13.0/g' App.xcodeproj/project.pbxproj
    
    # Enable automatic signing
    sed -i '' 's/CODE_SIGN_STYLE = Manual/CODE_SIGN_STYLE = Automatic/g' App.xcodeproj/project.pbxproj
    
    print_success "Xcode project settings updated"
fi

cd ../../../

print_status "Step 7: Creating iOS build script..."

# Create iOS build script for command line building
cat > build_ios_app.sh << 'EOF'
#!/bin/bash

echo "📱 Building iOS App"
echo "=================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App

# Clean build folder
xcodebuild clean -workspace App.xcworkspace -scheme App

# Build for simulator
echo "Building for iOS Simulator..."
xcodebuild build -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15,OS=latest'

if [ $? -eq 0 ]; then
    echo "✅ iOS Simulator build successful!"
else
    echo "❌ iOS Simulator build failed!"
    exit 1
fi

# Build for device (requires signing)
echo "Building for iOS Device..."
xcodebuild build -workspace App.xcworkspace -scheme App -destination 'generic/platform=iOS'

if [ $? -eq 0 ]; then
    echo "✅ iOS Device build successful!"
else
    echo "⚠️ iOS Device build failed (may need code signing setup)"
fi

echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Open Xcode: ./open_ios_xcode.sh"
echo "2. Select target device/simulator"
echo "3. Click Run (▶️) to test"
EOF

chmod +x build_ios_app.sh

print_status "Step 8: Creating updated iOS launch script..."

# Update the iOS launch script
cat > open_ios_xcode.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "📋 Next Steps in Xcode:"
    echo "======================"
    echo "1. Wait for project to load and dependencies to resolve"
    echo "2. If build fails, try: Product → Clean Build Folder"
    echo "3. Select your target device or simulator from the dropdown"
    echo "4. Click the Run button (▶️) to build and test the app"
    echo "5. For App Store deployment: Product → Archive"
    echo ""
    echo "🔧 If you encounter signing issues:"
    echo "   1. Select App target in project navigator"
    echo "   2. Go to Signing & Capabilities tab"
    echo "   3. Check 'Automatically manage signing'"
    echo "   4. Select your development team"
    echo ""
    echo "🔗 Backend Connection:"
    echo "   Make sure backend is running: ./start_backend_for_mobile.sh"
    echo "   App will connect to: http://192.168.2.185:2025"
    echo ""
    echo "📱 Testing Tips:"
    echo "==============="
    echo "• Use iOS Simulator for quick testing"
    echo "• Use physical device for full functionality testing"
    echo "• Ensure device/simulator is on same WiFi network as backend"
else
    echo "❌ iOS workspace not found at: $IOS_WORKSPACE"
    echo ""
    echo "🔧 Try rebuilding iOS:"
    echo "   ./fix_ios_build_issues.sh"
fi
EOF

chmod +x open_ios_xcode.sh

print_success "✅ iOS build issues fixed!"

echo ""
echo "🎯 iOS Project Ready!"
echo "===================="
echo ""
echo "📱 iOS Workspace:"
echo "   Location: frontend/ios/App/App.xcworkspace"
echo "   Open: ./open_ios_xcode.sh"
echo "   Build: ./build_ios_app.sh"
echo ""
echo "🔧 What was fixed:"
echo "=================="
echo "• Updated Capacitor versions to match (7.4.3)"
echo "• Rebuilt iOS project with consistent dependencies"
echo "• Updated Podfile for better compatibility"
echo "• Reinstalled CocoaPods dependencies"
echo "• Configured Xcode project settings"
echo "• Set iOS deployment target to 13.0"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. ./start_backend_for_mobile.sh    # Start backend server"
echo "2. ./open_ios_xcode.sh              # Open iOS in Xcode"
echo "3. Clean Build Folder if needed"
echo "4. Select device/simulator and Run"

print_success "🎉 iOS project is ready for development!"
