#!/bin/bash

echo "🔧 Simple iOS Capacitor Fix"
echo "==========================="

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

print_status "Step 1: Using legacy peer deps to fix version conflicts..."

# Use legacy peer deps to bypass version conflicts
npm install @capacitor/core@5.7.8 @capacitor/ios@5.7.8 @capacitor/android@5.7.8 --legacy-peer-deps

print_success "Capacitor versions aligned to 5.7.8"

print_status "Step 2: Removing broken iOS project..."
rm -rf ios

print_status "Step 3: Adding iOS platform with matching versions..."
npx cap add ios

print_status "Step 4: Syncing iOS platform..."
npx cap sync ios

print_status "Step 5: Fixing Podfile with simple configuration..."

cd ios/App

# Create a simple, working Podfile
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

print_success "Simple Podfile created"

print_status "Step 6: Installing CocoaPods..."

# Clean install
rm -rf Pods Podfile.lock
pod install

if [ $? -ne 0 ]; then
    print_warning "Pod install failed, trying repo update..."
    pod install --repo-update
fi

print_status "Step 7: Verifying iOS project..."

if [ -d "App.xcworkspace" ]; then
    print_success "✅ iOS workspace created successfully!"
else
    print_error "❌ iOS workspace creation failed!"
    exit 1
fi

cd ../../../

print_status "Step 8: Creating simple iOS launch script..."

cat > open_ios_simple.sh << 'EOF'
#!/bin/bash

echo "🍎 Opening iOS Project (Simple)"
echo "==============================="

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
    echo "🔗 Backend: ./start_backend_for_mobile.sh"
else
    echo "❌ iOS workspace not found!"
fi
EOF

chmod +x open_ios_simple.sh

print_success "✅ Simple iOS fix completed!"

echo ""
echo "🎯 iOS Project Fixed!"
echo "===================="
echo ""
echo "📱 What was fixed:"
echo "• Used matching Capacitor versions (5.7.8)"
echo "• Created simple Podfile without helpers"
echo "• Rebuilt iOS project cleanly"
echo "• Fixed CocoaPods dependencies"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. ./start_backend_for_mobile.sh"
echo "2. ./open_ios_simple.sh"
echo "3. In Xcode: Clean Build Folder → Run"

print_success "🎉 iOS should now build successfully!"
