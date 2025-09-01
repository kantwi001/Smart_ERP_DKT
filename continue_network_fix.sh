#!/bin/bash

# Continue Mobile Network Connectivity Fix
# Continues from where the previous script left off due to TypeScript dependency conflict

set -e

echo "🔄 Continuing Mobile Network Connectivity Fix..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-NetworkFixed-${TIMESTAMP}.apk"
BACKEND_URL="https://backend-shy-sun-4450.fly.dev"

echo -e "${BLUE}Continuing from Step 5...${NC}"
echo ""

# Step 5: Install dependencies and build React app (with fix)
echo -e "${YELLOW}Step 5: Building React application (with dependency fix)...${NC}"

cd frontend

# Fix TypeScript version conflict by using legacy peer deps
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
echo "• Fixed TypeScript dependency conflicts"
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
