#!/bin/bash

echo "🤖 Setting Up Android Studio for APK Building"
echo "=============================================="

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

print_status "Preparing Android project for Android Studio..."

# Ensure React build is ready
print_status "Building React app for mobile..."
cd frontend

# Set mobile environment
cp .env.mobile .env

# Build React app
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed"

# Sync Capacitor
print_status "Syncing Capacitor Android project..."
npx cap sync android
npx cap copy android

# Return to project root
cd ..

# Check if Android Studio is installed
print_status "Checking Android Studio installation..."
if [ -d "/Applications/Android Studio.app" ]; then
    print_success "Android Studio found"
    ANDROID_STUDIO_INSTALLED=true
else
    print_warning "Android Studio not found"
    ANDROID_STUDIO_INSTALLED=false
fi

# Install Android Studio if not present
if [ "$ANDROID_STUDIO_INSTALLED" = false ]; then
    print_status "Installing Android Studio..."
    if command -v brew &> /dev/null; then
        brew install --cask android-studio
        print_success "Android Studio installed"
    else
        print_error "Homebrew not found. Please install Android Studio manually from:"
        echo "https://developer.android.com/studio"
        exit 1
    fi
fi

# Create Android Studio launch script
print_status "Creating Android Studio launch script..."

cat > open_android_studio.sh << 'EOF'
#!/bin/bash

echo "🚀 Opening Android Project in Android Studio"
echo "==========================================="

# Navigate to Android project
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

# Open in Android Studio
if [ -d "/Applications/Android Studio.app" ]; then
    echo "📱 Opening Android project in Android Studio..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened with your project!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "================================"
    echo ""
    echo "1. Wait for Gradle sync to complete"
    echo "2. If prompted, update Gradle or Android SDK"
    echo "3. Select 'Build' → 'Build Bundle(s) / APK(s)' → 'Build APK(s)'"
    echo "4. Or click the green 'Run' button to test on device/emulator"
    echo ""
    echo "📱 APK Location after build:"
    echo "app/build/outputs/apk/debug/app-debug.apk"
    
else
    echo "❌ Android Studio not found. Please install it first:"
    echo "brew install --cask android-studio"
fi
EOF

chmod +x open_android_studio.sh

# Create build APK script for Android Studio
cat > build_apk_android_studio.sh << 'EOF'
#!/bin/bash

echo "🔨 Building APK via Android Studio Command Line"
echo "==============================================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🔨 Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    
    # Find and copy APK
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-AndroidStudio-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Location: $(pwd)/../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install APK:"
        echo "adb install ../../SmartERP-AndroidStudio-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found after build"
    fi
else
    echo "❌ APK build failed"
fi
EOF

chmod +x build_apk_android_studio.sh

# Create release APK build script
cat > build_release_apk.sh << 'EOF'
#!/bin/bash

echo "🚀 Building Release APK via Android Studio"
echo "=========================================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🔨 Building release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release APK built successfully!"
    
    # Find and copy APK
    APK_PATH=$(find . -name "app-release-unsigned.apk" -o -name "app-release.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Release-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Release-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 Release APK Details:"
        echo "File: SmartERP-Release-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Location: $(pwd)/../../SmartERP-Release-${TIMESTAMP}.apk"
        
        echo ""
        echo "⚠️  Note: This is an unsigned release APK"
        echo "For production, you'll need to sign it with a keystore"
    else
        echo "❌ Release APK file not found after build"
    fi
else
    echo "❌ Release APK build failed"
fi
EOF

chmod +x build_release_apk.sh

print_success "Android Studio setup completed!"

echo ""
echo "🚀 Android Studio Build Options:"
echo "================================"
echo ""
echo "Option 1 - Open in Android Studio GUI:"
echo "   ./open_android_studio.sh"
echo ""
echo "Option 2 - Build APK via Command Line:"
echo "   ./build_apk_android_studio.sh"
echo ""
echo "Option 3 - Build Release APK:"
echo "   ./build_release_apk.sh"

echo ""
echo "📋 Android Studio Build Steps:"
echo "=============================="
echo ""
echo "1. Open Android Studio with your project:"
echo "   ./open_android_studio.sh"
echo ""
echo "2. In Android Studio:"
echo "   • Wait for Gradle sync to complete"
echo "   • Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "   • Or click Run button for device testing"
echo ""
echo "3. APK will be generated at:"
echo "   frontend/android/app/build/outputs/apk/debug/app-debug.apk"

# Check Android project structure
print_status "Verifying Android project structure..."
if [ -f "frontend/android/build.gradle" ]; then
    print_success "Android project structure is ready"
else
    print_error "Android project not properly set up"
    echo "Run: cd frontend && npx cap add android"
fi

print_success "Ready to build APK in Android Studio!"
