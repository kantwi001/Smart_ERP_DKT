#!/bin/bash

echo "🧪 Mobile Build Testing & Verification Script"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" >/dev/null 2>&1; then
        if [ "$expected_result" = "success" ]; then
            echo -e "${GREEN}✅ PASS: $test_name${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL: $test_name (unexpected success)${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        if [ "$expected_result" = "fail" ]; then
            echo -e "${GREEN}✅ PASS: $test_name (expected failure)${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}❌ FAIL: $test_name${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    fi
}

# Function to check file existence
check_file() {
    local file_path="$1"
    local description="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ -f "$file_path" ]; then
        echo -e "${GREEN}✅ FOUND: $description${NC}"
        echo -e "   📁 $file_path"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ MISSING: $description${NC}"
        echo -e "   📁 $file_path"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check directory existence
check_directory() {
    local dir_path="$1"
    local description="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    if [ -d "$dir_path" ]; then
        echo -e "${GREEN}✅ FOUND: $description${NC}"
        echo -e "   📂 $dir_path"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ MISSING: $description${NC}"
        echo -e "   📂 $dir_path"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "frontend/capacitor.config.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the erp-system root directory${NC}"
    exit 1
fi

echo -e "${BLUE}🔧 Starting comprehensive mobile build verification...${NC}"
echo ""

# Test 1: System Requirements
echo -e "${YELLOW}📋 Phase 1: System Requirements${NC}"
echo "================================"

run_test "Node.js availability" "command -v node" "success"
run_test "npm availability" "command -v npm" "success"
run_test "npx availability" "command -v npx" "success"
run_test "Java availability" "command -v java" "success"

if command -v java >/dev/null 2>&1; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo -e "${BLUE}   Java Version: $JAVA_VERSION${NC}"
    
    if java -version 2>&1 | grep -q "17\."; then
        echo -e "${GREEN}   ✅ Java 17 detected - Android compatible${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Java 17 not detected - may cause Android build issues${NC}"
    fi
fi

echo ""

# Test 2: Project Structure
echo -e "${YELLOW}📋 Phase 2: Project Structure${NC}"
echo "=============================="

cd frontend

check_file "package.json" "React package configuration"
check_file "capacitor.config.ts" "Capacitor configuration"
check_directory "src" "React source directory"
check_directory "public" "React public assets"

echo ""

# Test 3: Build Artifacts
echo -e "${YELLOW}📋 Phase 3: Build Artifacts${NC}"
echo "==========================="

check_directory "build" "React production build"
check_file "build/index.html" "React build entry point"
check_file "build/static/js/main.*.js" "React JavaScript bundle" || \
check_file "build/static/js/main.js" "React JavaScript bundle (alternative)"

echo ""

# Test 4: Mobile Platform Configuration
echo -e "${YELLOW}📋 Phase 4: Mobile Platform Configuration${NC}"
echo "========================================="

check_directory "android" "Android platform"
check_directory "ios" "iOS platform"

if [ -d "android" ]; then
    check_file "android/app/build.gradle" "Android app build configuration"
    check_file "android/variables.gradle" "Android variables configuration"
    check_file "android/build.gradle" "Android root build configuration"
fi

if [ -d "ios" ]; then
    check_directory "ios/App" "iOS app directory"
    check_file "ios/App/App.xcodeproj/project.pbxproj" "iOS project file"
    check_file "ios/App/App/Info.plist" "iOS Info.plist"
fi

echo ""

# Test 5: Capacitor Integration
echo -e "${YELLOW}📋 Phase 5: Capacitor Integration${NC}"
echo "================================="

run_test "Capacitor CLI availability" "npx @capacitor/cli --version" "success"

if [ -f "capacitor.config.ts" ]; then
    echo -e "${BLUE}🔍 Checking Capacitor configuration...${NC}"
    
    if grep -q "com.smarterpsoftware.app" capacitor.config.ts; then
        echo -e "${GREEN}✅ App ID configured correctly${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ App ID not configured${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if grep -q "SmartERPSoftware" capacitor.config.ts; then
        echo -e "${GREEN}✅ App name configured correctly${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ App name not configured${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if grep -q "localhost:2025" capacitor.config.ts; then
        echo -e "${GREEN}✅ Backend server URLs configured${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Backend server URLs may need configuration${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
fi

echo ""

# Test 6: Android Build Verification
echo -e "${YELLOW}📋 Phase 6: Android Build Verification${NC}"
echo "======================================"

if [ -d "android" ]; then
    cd android
    
    # Check if Gradle wrapper exists
    check_file "gradlew" "Gradle wrapper script"
    
    # Test Gradle configuration
    if [ -f "gradlew" ]; then
        echo -e "${BLUE}🔍 Testing Gradle configuration...${NC}"
        
        # Make gradlew executable
        chmod +x gradlew
        
        # Test Gradle tasks
        if ./gradlew tasks --quiet >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Gradle configuration valid${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}❌ Gradle configuration issues${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    fi
    
    # Check for existing APK
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        APK_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
        echo -e "${GREEN}✅ Android APK exists (Size: $APK_SIZE)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Android APK not found (may need build)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Android platform not available${NC}"
fi

echo ""

# Test 7: iOS Build Verification
echo -e "${YELLOW}📋 Phase 7: iOS Build Verification${NC}"
echo "=================================="

if [ -d "ios/App" ]; then
    # Check iOS project structure
    check_file "ios/App/App.xcodeproj/project.pbxproj" "iOS project file"
    check_file "ios/App/App/Info.plist" "iOS Info.plist"
    
    # Check iOS configuration
    if [ -f "ios/App/App/Info.plist" ]; then
        echo -e "${BLUE}🔍 Checking iOS configuration...${NC}"
        
        if /usr/libexec/PlistBuddy -c "Print :CFBundleDisplayName" ios/App/App/Info.plist 2>/dev/null | grep -q "SmartERPSoftware"; then
            echo -e "${GREEN}✅ iOS app display name configured${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${YELLOW}⚠️  iOS app display name may need configuration${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
        
        if /usr/libexec/PlistBuddy -c "Print :NSAppTransportSecurity:NSAllowsArbitraryLoads" ios/App/App/Info.plist 2>/dev/null | grep -q "true"; then
            echo -e "${GREEN}✅ iOS network security configured${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${YELLOW}⚠️  iOS network security may need configuration${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
    fi
    
    # Check for Xcode availability
    if command -v xcodebuild >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Xcode command line tools available${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${YELLOW}⚠️  Xcode command line tools not found${NC}"
        echo -e "   Run: xcode-select --install"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    echo -e "${YELLOW}⚠️  iOS platform not available${NC}"
fi

cd ..

echo ""

# Test 8: Generated APK Files
echo -e "${YELLOW}📋 Phase 8: Generated APK Files${NC}"
echo "==============================="

APK_COUNT=0
for apk in smart-erp-*.apk; do
    if [ -f "$apk" ]; then
        APK_SIZE=$(ls -lh "$apk" | awk '{print $5}')
        echo -e "${GREEN}✅ Found APK: $apk (Size: $APK_SIZE)${NC}"
        APK_COUNT=$((APK_COUNT + 1))
    fi
done

if [ $APK_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ $APK_COUNT APK file(s) available for testing${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${YELLOW}⚠️  No APK files found in root directory${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo ""

# Final Results
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "======================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}📋 Total Tests: $TESTS_TOTAL${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Mobile build is ready for deployment.${NC}"
    echo ""
    echo -e "${BLUE}📱 Next Steps for Testing:${NC}"
    echo ""
    echo -e "${YELLOW}Android Testing:${NC}"
    echo "1. Install APK on Android device/emulator"
    echo "2. Open Android Studio and import frontend/android/"
    echo "3. Build and run the project"
    echo ""
    echo -e "${YELLOW}iOS Testing:${NC}"
    echo "1. Open frontend/ios/App/App.xcworkspace in Xcode"
    echo "2. Select development team and device/simulator"
    echo "3. Build and run the project"
    echo ""
    echo -e "${YELLOW}Backend Connection Testing:${NC}"
    echo "1. Start backend server: cd backend && python manage.py runserver 2025"
    echo "2. Test mobile app connectivity to localhost:2025"
    echo "3. Verify ERP functionality in mobile environment"
    
elif [ $TESTS_FAILED -lt 3 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Minor issues detected. Mobile build is mostly ready.${NC}"
    echo -e "${BLUE}Consider addressing the failed tests before deployment.${NC}"
    
else
    echo ""
    echo -e "${RED}❌ Significant issues detected. Please address failed tests.${NC}"
    echo ""
    echo -e "${BLUE}🔧 Recommended Actions:${NC}"
    echo "1. Install Java 17: ./install_java17_macos.sh"
    echo "2. Run build fix script: ./fix_mobile_build_issues_updated.sh"
    echo "3. Re-run this test script to verify fixes"
fi

echo ""
echo -e "${BLUE}📋 Additional Resources:${NC}"
echo "- Capacitor docs: https://capacitorjs.com/docs"
echo "- Android Studio: https://developer.android.com/studio"
echo "- Xcode: https://developer.apple.com/xcode/"
echo ""

exit $TESTS_FAILED
