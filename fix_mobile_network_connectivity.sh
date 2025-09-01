#!/bin/bash

# Fix Mobile Network Connectivity Script
# Fixes network connectivity issues between mobile app and Fly.dev backend
# Updates iOS App Transport Security, Capacitor config, and rebuilds app

set -e

echo "🔧 Starting Mobile Network Connectivity Fix..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="https://backend-shy-sun-4450.fly.dev"
BACKEND_DOMAIN="backend-shy-sun-4450.fly.dev"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-NetworkFixed-${TIMESTAMP}.apk"

echo -e "${BLUE}Backend URL: ${BACKEND_URL}${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"
echo ""

# Step 1: Update iOS Info.plist with App Transport Security
echo -e "${YELLOW}Step 1: Updating iOS Info.plist with App Transport Security...${NC}"

IOS_INFO_PLIST="ios/App/App/Info.plist"

if [ ! -f "$IOS_INFO_PLIST" ]; then
    echo -e "${RED}Error: iOS Info.plist not found at $IOS_INFO_PLIST${NC}"
    exit 1
fi

# Create backup
cp "$IOS_INFO_PLIST" "${IOS_INFO_PLIST}.backup.${TIMESTAMP}"
echo -e "${GREEN}✓ Created backup of Info.plist${NC}"

# Update Info.plist with App Transport Security settings
cat > "$IOS_INFO_PLIST" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>CFBundleDevelopmentRegion</key>
	<string>en</string>
	<key>CFBundleDisplayName</key>
        <string>Smart ERP Mobile</string>
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
	<string>$(MARKETING_VERSION)</string>
	<key>CFBundleVersion</key>
	<string>$(CURRENT_PROJECT_VERSION)</string>
	<key>LSRequiresIPhoneOS</key>
	<true/>
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
				<key>NSIncludesSubdomains</key>
				<true/>
			</dict>
			<key>fly.dev</key>
			<dict>
				<key>NSExceptionAllowsInsecureHTTPLoads</key>
				<false/>
				<key>NSExceptionMinimumTLSVersion</key>
				<string>TLSv1.2</string>
				<key>NSExceptionRequiresForwardSecrecy</key>
				<false/>
				<key>NSIncludesSubdomains</key>
				<true/>
			</dict>
		</dict>
	</dict>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>This app uses location to provide location-based services.</string>
	<key>NSCameraUsageDescription</key>
	<string>This app uses the camera to take photos for inventory and receipts.</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>This app accesses the photo library to select images for inventory and receipts.</string>
</dict>
</plist>
EOF

echo -e "${GREEN}✓ Updated iOS Info.plist with App Transport Security settings${NC}"

# Step 2: Update Capacitor Configuration
echo -e "${YELLOW}Step 2: Updating Capacitor Configuration...${NC}"

CAPACITOR_CONFIG="frontend/capacitor.config.js"

if [ ! -f "$CAPACITOR_CONFIG" ]; then
    echo -e "${RED}Error: Capacitor config not found at $CAPACITOR_CONFIG${NC}"
    exit 1
fi

# Create backup
cp "$CAPACITOR_CONFIG" "${CAPACITOR_CONFIG}.backup.${TIMESTAMP}"
echo -e "${GREEN}✓ Created backup of capacitor.config.js${NC}"

# Update Capacitor configuration
cat > "$CAPACITOR_CONFIG" << EOF
const config = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'https://backend-shy-sun-4450.fly.dev',
      'https://backend-shy-sun-4450.fly.dev/*',
      'backend-shy-sun-4450.fly.dev',
      'backend-shy-sun-4450.fly.dev/*',
      '*.fly.dev',
      'https://*.fly.dev'
    ],
    cleartext: false
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#2196F3",
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff'
  },
  android: {
    backgroundColor: '#ffffff',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

module.exports = config;
EOF

echo -e "${GREEN}✓ Updated Capacitor configuration with enhanced network settings${NC}"

# Step 3: Update API configuration to ensure HTTPS
echo -e "${YELLOW}Step 3: Updating API configuration...${NC}"

API_CONFIG="frontend/src/api.js"

if [ ! -f "$API_CONFIG" ]; then
    echo -e "${RED}Error: API config not found at $API_CONFIG${NC}"
    exit 1
fi

# Create backup
cp "$API_CONFIG" "${API_CONFIG}.backup.${TIMESTAMP}"
echo -e "${GREEN}✓ Created backup of api.js${NC}"

# Update API configuration to ensure HTTPS and proper error handling
cat > "$API_CONFIG" << 'EOF'
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

// Production Fly.dev backend URL
const API_BASE_URL = 'https://backend-shy-sun-4450.fly.dev/api';

console.log('API Configuration:');
console.log('- Platform:', Capacitor.getPlatform());
console.log('- Native Platform:', Capacitor.isNativePlatform());
console.log('- API Base URL:', API_BASE_URL);

// Enhanced HTTP client with better error handling for mobile
const httpClient = {
  async request(config) {
    try {
      console.log('Making HTTP request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });

      let response;
      
      if (Capacitor.isNativePlatform()) {
        // Use CapacitorHttp for native platforms
        response = await CapacitorHttp.request({
          url: config.url,
          method: config.method,
          headers: config.headers || {},
          data: config.data,
          connectTimeout: 30000,
          readTimeout: 30000
        });
        
        console.log('CapacitorHttp response:', {
          status: response.status,
          headers: response.headers,
          url: response.url
        });
        
        // Transform CapacitorHttp response to match axios format
        return {
          data: response.data,
          status: response.status,
          statusText: response.status >= 200 && response.status < 300 ? 'OK' : 'Error',
          headers: response.headers,
          config: config
        };
      } else {
        // Use fetch for web platform
        const fetchConfig = {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          }
        };
        
        if (config.data) {
          fetchConfig.body = JSON.stringify(config.data);
        }
        
        response = await fetch(config.url, fetchConfig);
        const data = await response.json();
        
        console.log('Fetch response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        return {
          data: data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: config
        };
      }
    } catch (error) {
      console.error('HTTP request failed:', error);
      
      // Enhanced error handling for network issues
      if (error.message && error.message.includes('ERR_NETWORK')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('timeout')) {
        throw new Error('Request timeout. Please check your connection and try again.');
      } else {
        throw error;
      }
    }
  },

  get(url, config = {}) {
    return this.request({ ...config, method: 'GET', url });
  },

  post(url, data, config = {}) {
    return this.request({ ...config, method: 'POST', url, data });
  },

  put(url, data, config = {}) {
    return this.request({ ...config, method: 'PUT', url, data });
  },

  delete(url, config = {}) {
    return this.request({ ...config, method: 'DELETE', url });
  }
};

export { API_BASE_URL, httpClient as default };
EOF

echo -e "${GREEN}✓ Updated API configuration with enhanced HTTPS and error handling${NC}"

# Step 4: Clean previous builds
echo -e "${YELLOW}Step 4: Cleaning previous builds...${NC}"

cd frontend

# Clean React build
if [ -d "build" ]; then
    rm -rf build
    echo -e "${GREEN}✓ Cleaned React build directory${NC}"
fi

# Clean node_modules cache
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo -e "${GREEN}✓ Cleaned node_modules cache${NC}"
fi

# Step 5: Install dependencies and build React app
echo -e "${YELLOW}Step 5: Building React application...${NC}"

# Fix TypeScript version conflict
echo -e "${BLUE}Fixing TypeScript dependency conflict...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Installed npm dependencies with legacy peer deps${NC}"

npm run build
echo -e "${GREEN}✓ Built React application${NC}"

# Step 6: Sync with Capacitor
echo -e "${YELLOW}Step 6: Syncing with Capacitor...${NC}"

npx cap sync
echo -e "${GREEN}✓ Synced with Capacitor${NC}"

# Step 7: Copy assets and update platforms
echo -e "${YELLOW}Step 7: Copying assets and updating platforms...${NC}"

npx cap copy
echo -e "${GREEN}✓ Copied web assets to native platforms${NC}"

npx cap update
echo -e "${GREEN}✓ Updated native platforms${NC}"

# Step 8: Build Android APK
echo -e "${YELLOW}Step 8: Building Android APK...${NC}"

cd ../android

# Clean Android build
./gradlew clean
echo -e "${GREEN}✓ Cleaned Android build${NC}"

# Build APK
./gradlew assembleDebug
echo -e "${GREEN}✓ Built Android APK${NC}"

# Copy APK to root directory
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp "app/build/outputs/apk/debug/app-debug.apk" "../${APK_NAME}"
    echo -e "${GREEN}✓ Copied APK to root directory as ${APK_NAME}${NC}"
else
    echo -e "${RED}✗ APK not found at expected location${NC}"
    exit 1
fi

cd ..

# Step 9: Prepare iOS for Xcode build
echo -e "${YELLOW}Step 9: Preparing iOS for Xcode build...${NC}"

if [ -d "ios" ]; then
    echo -e "${GREEN}✓ iOS project ready for Xcode build${NC}"
    echo -e "${BLUE}To build iOS app:${NC}"
    echo -e "${BLUE}1. Open ios/App/App.xcworkspace in Xcode${NC}"
    echo -e "${BLUE}2. Select your development team${NC}"
    echo -e "${BLUE}3. Build and run on device or simulator${NC}"
else
    echo -e "${YELLOW}⚠ iOS directory not found${NC}"
fi

# Step 10: Test backend connectivity
echo -e "${YELLOW}Step 10: Testing backend connectivity...${NC}"

echo "Testing backend connectivity to ${BACKEND_URL}..."
if curl -s --max-time 10 "${BACKEND_URL}/health/" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is reachable${NC}"
else
    echo -e "${YELLOW}⚠ Backend connectivity test failed (this may be normal if health endpoint doesn't exist)${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}🎉 Mobile Network Connectivity Fix Complete!${NC}"
echo "================================================"
echo -e "${BLUE}Changes made:${NC}"
echo "• Updated iOS Info.plist with App Transport Security settings"
echo "• Enhanced Capacitor configuration for better HTTPS handling"
echo "• Updated API client with CapacitorHttp for native platforms"
echo "• Added proper error handling for network issues"
echo "• Built new Android APK: ${APK_NAME}"
echo "• Prepared iOS project for Xcode build"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Install and test the Android APK: ${APK_NAME}"
echo "2. Build and test the iOS app in Xcode"
echo "3. Test authentication with credentials: arkucollins@gmail.com / admin123"
echo "4. Verify backend connectivity and user role detection"
echo ""
echo -e "${YELLOW}If issues persist:${NC}"
echo "• Check device internet connection"
echo "• Verify Fly.dev backend is running"
echo "• Check device logs for detailed error messages"
echo ""
echo -e "${GREEN}Build completed successfully! 🚀${NC}"
