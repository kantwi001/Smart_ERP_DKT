#!/bin/bash

# Force Mobile Apps to Connect to Fly.dev Backend
# This script ensures mobile apps ONLY use https://backend-shy-sun-4450.fly.dev/

set -e

echo "🚀 Forcing Mobile Apps to Use Fly.dev Backend"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd frontend

echo -e "${BLUE}📋 Step 1: Cleaning previous builds${NC}"
rm -rf build/
rm -rf node_modules/.cache/
rm -rf android/app/build/

echo -e "${BLUE}📋 Step 2: Building React app${NC}"
GENERATE_SOURCEMAP=false npm run build

echo -e "${BLUE}📋 Step 3: Syncing Capacitor${NC}"
npx cap sync

echo -e "${BLUE}📋 Step 4: Building Android APK${NC}"
cd android
./gradlew clean assembleDebug
cd ..

# Copy APK with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-FlydevForced-${TIMESTAMP}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"

echo -e "${GREEN}✅ SUCCESS: Mobile app rebuilt with Fly.dev backend!${NC}"
echo -e "${GREEN}📱 APK: ${APK_NAME}${NC}"
echo -e "${GREEN}🔗 Backend: https://backend-shy-sun-4450.fly.dev/api${NC}"
echo ""
echo -e "${YELLOW}📋 Install the new APK and test - it will connect to Fly.dev${NC}"
