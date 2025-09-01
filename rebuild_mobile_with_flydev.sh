#!/bin/bash

# Rebuild Mobile App with Fly.dev Backend Integration
# This script ensures proper Capacitor platform detection and backend connectivity

set -e

echo "🚀 Rebuilding Mobile App with Fly.dev Backend Integration"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Navigate to frontend directory
cd frontend

echo -e "${BLUE}📋 Step 1: Cleaning previous builds${NC}"
rm -rf build/
rm -rf node_modules/.cache/
rm -rf android/app/build/
rm -rf ios/App/build/

echo -e "${BLUE}📋 Step 2: Installing dependencies${NC}"
npm install --legacy-peer-deps

echo -e "${BLUE}📋 Step 3: Building React app for mobile${NC}"
GENERATE_SOURCEMAP=false npm run build

echo -e "${BLUE}📋 Step 4: Removing existing Capacitor platforms${NC}"
npx cap platform remove android 2>/dev/null || echo "Android platform not found"
npx cap platform remove ios 2>/dev/null || echo "iOS platform not found"

echo -e "${BLUE}📋 Step 5: Adding Capacitor platforms${NC}"
npx cap add android
npx cap add ios

echo -e "${BLUE}📋 Step 6: Syncing Capacitor${NC}"
npx cap sync

echo -e "${BLUE}📋 Step 7: Copying web assets${NC}"
npx cap copy

echo -e "${BLUE}📋 Step 8: Building Android APK${NC}"
cd android
./gradlew assembleDebug
cd ..

# Copy APK with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-FlydevFixed-${TIMESTAMP}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"

echo -e "${GREEN}✅ Mobile app rebuilt successfully!${NC}"
echo -e "${GREEN}📱 APK created: ${APK_NAME}${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Install APK on Android device: adb install ${APK_NAME}"
echo "2. For iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
echo "3. Test mobile app - should now connect to Fly.dev backend"
echo ""
echo -e "${BLUE}🔍 Expected Mobile App Behavior:${NC}"
echo "- Platform: android/ios (not web)"
echo "- Native Platform: true"
echo "- API Base URL: https://backend-shy-sun-4450.fly.dev/api"
