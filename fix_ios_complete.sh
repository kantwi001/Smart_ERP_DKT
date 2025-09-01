#!/bin/bash

echo "🔧 Complete iOS Fix"
echo "==================="

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
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

print_status "Step 1: Installing missing dependencies..."

# Install TypeScript and fix dependencies
npm install -D typescript --legacy-peer-deps
npm install @capacitor/core@5.7.8 @capacitor/ios@5.7.8 @capacitor/android@5.7.8 --legacy-peer-deps

print_success "Dependencies installed"

print_status "Step 2: Converting capacitor.config.ts to capacitor.config.json..."

# Create simple JSON config instead of TypeScript
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.smarterp.app",
  "appName": "SmartERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "192.168.2.185:2025",
      "localhost:2025"
    ]
  },
  "android": {
    "allowMixedContent": true
  },
  "ios": {
    "allowsLinkPreview": false
  }
}
EOF

# Remove TypeScript config if it exists
rm -f capacitor.config.ts

print_success "Capacitor config converted to JSON"

print_status "Step 3: Removing broken iOS project..."
rm -rf ios

print_status "Step 4: Adding iOS platform..."
npx cap add ios

if [ ! -d "ios/App" ]; then
    print_error "iOS platform creation failed!"
    print_status "Trying alternative approach..."
    
    # Try with explicit config
    npx capacitor add ios --config=capacitor.config.json
    
    if [ ! -d "ios/App" ]; then
        print_error "Still failed. Checking Capacitor installation..."
        npm list @capacitor/cli
        npx cap --version
        exit 1
    fi
fi

print_success "iOS platform added"

print_status "Step 5: Syncing iOS platform..."
npx cap sync ios

print_status "Step 6: Creating working Podfile..."

cd ios/App

# Create simple Podfile that works
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
      config.build_settings['CODE_SIGN_IDENTITY'] = ''
      config.build_settings['CODE_SIGNING_REQUIRED'] = 'NO'
    end
  end
end
EOF

print_success "Podfile created"

print_status "Step 7: Installing CocoaPods..."

# Clean install
rm -rf Pods Podfile.lock

# Install CocoaPods if not available
if ! command -v pod >/dev/null 2>&1; then
    print_status "Installing CocoaPods..."
    sudo gem install cocoapods
fi

pod install

if [ $? -ne 0 ]; then
    print_warning "Pod install failed, trying repo update..."
    pod install --repo-update
    
    if [ $? -ne 0 ]; then
        print_error "CocoaPods installation failed!"
        print_status "Checking project structure..."
        ls -la
        exit 1
    fi
fi

print_status "Step 8: Verifying iOS project..."

if [ -d "App.xcworkspace" ]; then
    print_success "✅ iOS workspace created successfully!"
    
    # List workspace contents
    print_status "Workspace contents:"
    ls -la App.xcworkspace/
else
    print_error "❌ iOS workspace creation failed!"
    print_status "Project structure:"
    ls -la
    exit 1
fi

cd ../../../

print_status "Step 9: Creating iOS launch script..."

cat > open_ios_fixed.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening Fixed iOS Project"
echo "============================"

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -d "$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened!"
    echo ""
    echo "📋 In Xcode (IMPORTANT STEPS):"
    echo "=============================="
    echo "1. Wait for project to load completely"
    echo "2. Product → Clean Build Folder (⌘⇧K)"
    echo "3. Select 'App' scheme and iPhone simulator"
    echo "4. If signing errors: App target → Signing & Capabilities → Automatically manage signing"
    echo "5. Click Run (▶️)"
    echo ""
    echo "🔧 If build still fails:"
    echo "• Check that all Capacitor versions are 5.7.8"
    echo "• Try different simulator (iPhone 14, iPhone 15)"
    echo "• Restart Xcode if needed"
    echo ""
    echo "🔗 Backend: ./start_backend_for_mobile.sh"
else
    echo "❌ iOS workspace not found!"
    echo "Try running: ./fix_ios_complete.sh"
fi
EOF

chmod +x open_ios_fixed.sh

print_success "✅ Complete iOS fix finished!"

echo ""
echo "🎯 iOS Project Status"
echo "===================="
echo ""
echo "📱 What was fixed:"
echo "• Installed TypeScript dependency"
echo "• Converted capacitor.config.ts to JSON"
echo "• Used matching Capacitor versions (5.7.8)"
echo "• Created working iOS project structure"
echo "• Fixed CocoaPods configuration"
echo "• Disabled code signing for development"
echo ""
echo "📂 Project Structure:"
echo "• iOS Workspace: frontend/ios/App/App.xcworkspace"
echo "• Capacitor Config: frontend/capacitor.config.json"
echo "• Launch Script: ./open_ios_fixed.sh"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. ./start_backend_for_mobile.sh    # Start backend"
echo "2. ./open_ios_fixed.sh              # Open Xcode"
echo "3. Clean Build Folder → Run"

print_success "🎉 iOS should now build successfully!"
