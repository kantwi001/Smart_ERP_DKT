#!/bin/bash

echo "🔍 React Build Diagnostic & Fix Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd frontend

echo -e "${BLUE}📋 Step 1: Checking Node.js and npm versions${NC}"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

echo -e "${BLUE}📋 Step 2: Checking package.json dependencies${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json found${NC}"
else
    echo -e "${RED}❌ package.json missing${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}📋 Step 3: Installing/updating dependencies${NC}"
echo "Running npm install..."
npm install --no-audit --no-fund
echo ""

echo -e "${BLUE}📋 Step 4: Clearing previous build artifacts${NC}"
rm -rf build/
rm -rf node_modules/.cache/
echo -e "${GREEN}✅ Build artifacts cleared${NC}"
echo ""

echo -e "${BLUE}📋 Step 5: Checking for JavaScript/TypeScript errors${NC}"
echo "Running npm run build with detailed output..."
echo ""

# Set environment variables for production build
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false
export NODE_OPTIONS="--max-old-space-size=4096"

# Attempt React build with detailed logging
npm run build 2>&1 | tee build.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo -e "${BLUE}📋 Step 6: Analyzing build results${NC}"

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ React build successful!${NC}"
    
    # Check build directory contents
    if [ -d "build" ] && [ "$(ls -A build)" ]; then
        BUILD_SIZE=$(du -sh build | cut -f1)
        FILE_COUNT=$(find build -type f | wc -l)
        echo -e "${GREEN}✅ Build directory created with $FILE_COUNT files (Size: $BUILD_SIZE)${NC}"
        
        # List key build files
        echo -e "${BLUE}📁 Key build files:${NC}"
        ls -la build/
        echo ""
        
        echo -e "${GREEN}🎉 Build is ready for mobile app deployment!${NC}"
        echo ""
        echo -e "${YELLOW}Next steps:${NC}"
        echo "1. Run: npx cap sync"
        echo "2. Run: npx cap build android"
        echo "3. Or use: ./fix_mobile_build_issues_updated.sh"
        
    else
        echo -e "${RED}❌ Build directory is empty despite successful exit code${NC}"
        BUILD_EXIT_CODE=1
    fi
else
    echo -e "${RED}❌ React build failed with exit code: $BUILD_EXIT_CODE${NC}"
    echo ""
    echo -e "${BLUE}📋 Common build failure solutions:${NC}"
    echo ""
    echo -e "${YELLOW}1. Memory Issues:${NC}"
    echo "   export NODE_OPTIONS=\"--max-old-space-size=8192\""
    echo "   npm run build"
    echo ""
    echo -e "${YELLOW}2. Dependency Issues:${NC}"
    echo "   rm -rf node_modules package-lock.json"
    echo "   npm install"
    echo "   npm run build"
    echo ""
    echo -e "${YELLOW}3. JavaScript/TypeScript Errors:${NC}"
    echo "   Check build.log for specific error details"
    echo "   Fix any import/export or syntax errors"
    echo ""
    echo -e "${YELLOW}4. Environment Variables:${NC}"
    echo "   Check .env and .env.production files"
    echo "   Ensure no invalid environment variable values"
    echo ""
    
    # Show last 20 lines of build log for debugging
    if [ -f "build.log" ]; then
        echo -e "${BLUE}📋 Last 20 lines of build log:${NC}"
        echo "=================================="
        tail -20 build.log
        echo "=================================="
        echo ""
        echo -e "${BLUE}💡 Full build log saved to: frontend/build.log${NC}"
    fi
fi

echo ""
echo -e "${BLUE}📋 Step 7: System recommendations${NC}"

# Check available memory
if command -v free >/dev/null 2>&1; then
    echo "Available memory:"
    free -h
elif command -v vm_stat >/dev/null 2>&1; then
    echo "macOS memory status:"
    vm_stat | head -5
fi

echo ""
echo -e "${BLUE}📋 Build diagnostic complete${NC}"

exit $BUILD_EXIT_CODE
