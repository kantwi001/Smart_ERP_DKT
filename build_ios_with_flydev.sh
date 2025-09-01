#!/bin/bash

# Build iOS App with Fly.dev Backend for Xcode
set -e

echo "🍎 Building iOS App with Fly.dev Backend"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd frontend

echo -e "${BLUE}📋 Step 1: Syncing Capacitor for iOS${NC}"
npx cap sync ios

echo -e "${BLUE}📋 Step 2: Updating iOS Info.plist for Fly.dev${NC}"
# Ensure Info.plist has proper Fly.dev backend configuration
cat > ios/App/App/Info.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
	<string>SmartERP</string>
	<key>CFBundleExecutable</key>
	<string>$(EXECUTABLE_NAME)</string>
	<key>CFBundleIdentifier</key>
	<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
	<key>CFBundleInfoDictionaryVersion</key>
	<string>6.0</string>
	<key>CFBundleName</key>
	<string>$(PRODUCT_NAME)</string>
	<key>CFBundlePackageType</key>
	<string>APPL</string>
	<key>CFBundleShortVersionString</key>
	<string>1.0</string>
	<key>CFBundleVersion</key>
	<string>1</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
	<key>NSAppTransportSecurity</key>
	<dict>
		<key>NSAllowsArbitraryLoads</key>
		<false/>
		<key>NSExceptionDomains</key>
		<dict>
			<key>backend-shy-sun-4450.fly.dev</key>
			<dict>
				<key>NSExceptionAllowsInsecureHTTPLoads</key>
				<false/>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
				<key>NSExceptionRequiresForwardSecrecy</key>
				<false/>
			</dict>
			<key>fly.dev</key>
			<dict>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
				<key>NSExceptionRequiresForwardSecrecy</key>
				<false/>
				<key>NSIncludesSubdomains</key>
				<true/>
			</dict>
		</dict>
	</dict>
	<key>UILaunchStoryboardName</key>
	<string>LaunchScreen</string>
	<key>UIMainStoryboardFile</key>
	<string>Main</string>
	<key>UIRequiredDeviceCapabilities</key>
	<array>
		<string>armv7</string>
	</array>
	<key>UISupportedInterfaceOrientations</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UISupportedInterfaceOrientations~ipad</key>
	<array>
		<string>UIInterfaceOrientationPortrait</string>
		<string>UIInterfaceOrientationPortraitUpsideDown</string>
		<string>UIInterfaceOrientationLandscapeLeft</string>
		<string>UIInterfaceOrientationLandscapeRight</string>
	</array>
	<key>UIViewControllerBasedStatusBarAppearance</key>
	<true/>
</dict>
</plist>
EOF

echo -e "${BLUE}📋 Step 3: Opening Xcode Project${NC}"
echo -e "${YELLOW}🔧 Manual Steps Required in Xcode:${NC}"
echo ""
echo "1. Set Bundle Identifier: com.smarterp.mobile"
echo "2. Set Team/Signing Certificate"
echo "3. Set Deployment Target: iOS 13.0+"
echo "4. Build and Run on device/simulator"
echo ""
echo -e "${GREEN}✅ iOS project ready for Xcode!${NC}"
echo -e "${GREEN}🔗 Backend: https://backend-shy-sun-4450.fly.dev/api${NC}"
echo ""
echo "Opening Xcode workspace..."

# Open Xcode workspace
open ios/App/App.xcworkspace

echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "1. In Xcode: Select your team and signing certificate"
echo "2. Choose target device (iPhone/iPad or Simulator)"
echo "3. Click Run (⌘+R) to build and install"
echo "4. Test app - it will connect to Fly.dev backend"
echo ""
echo -e "${GREEN}🚀 iOS app will use Fly.dev backend automatically!${NC}"
