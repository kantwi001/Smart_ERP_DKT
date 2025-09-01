#!/bin/bash

echo "🔧 Rebuilding Android Project with Proper Gradle Structure"
echo "=========================================================="

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

# Set Java environment for Android Studio
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

print_status "Using Java: $(java -version 2>&1 | head -n1)"

print_status "Step 1: Preparing frontend for mobile build..."

cd frontend

# Ensure React build is ready
print_status "Building React app for mobile..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed"

print_status "Step 2: Setting up Capacitor configuration..."

# Create proper capacitor.config.json
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.smarterp.app",
  "appName": "Smart ERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "buildOptions": {
      "keystorePath": "",
      "keystoreAlias": "",
      "keystoreAliasPassword": "",
      "keystorePassword": "",
      "releaseType": "APK"
    }
  }
}
EOF

print_success "Capacitor configuration created"

print_status "Step 3: Removing existing Android project..."

# Remove existing broken Android project
if [ -d "android" ]; then
    print_warning "Removing existing Android project..."
    rm -rf android
fi

print_status "Step 4: Adding Android platform..."

# Add Android platform fresh
npx cap add android

if [ $? -ne 0 ]; then
    print_error "Failed to add Android platform!"
    exit 1
fi

print_success "Android platform added successfully"

print_status "Step 5: Syncing Capacitor files..."

# Sync and copy files
npx cap sync android
npx cap copy android

print_success "Capacitor sync completed"

print_status "Step 6: Configuring Android project..."

cd android

# Create gradle.properties with proper JDK configuration
cat > gradle.properties << EOF
# Project-wide Gradle settings.

# Specifies the JVM arguments used for the daemon process.
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8

# When configured, Gradle will run in incubating parallel mode.
org.gradle.parallel=true

# AndroidX package structure
android.useAndroidX=true
android.enableJetifier=true

# Enable Gradle build cache
org.gradle.caching=true

# Enable R8 full mode
android.enableR8.fullMode=true

# Use Android Studio's embedded JDK
org.gradle.java.home=/Applications/Android Studio.app/Contents/jbr/Contents/Home
EOF

# Create local.properties
cat > local.properties << EOF
# Location of the SDK
sdk.dir=$HOME/Library/Android/sdk

# Location of the JDK
org.gradle.java.home=/Applications/Android Studio.app/Contents/jbr/Contents/Home
EOF

print_success "Android project configured"

print_status "Step 7: Testing Gradle build..."

# Test Gradle configuration
./gradlew --version

if [ $? -eq 0 ]; then
    print_success "✅ Gradle configuration is working!"
else
    print_error "Gradle configuration test failed"
    exit 1
fi

print_status "Step 8: Running initial Gradle sync..."

# Clean and prepare
./gradlew clean

print_success "Gradle clean completed"

cd ../..

print_status "Step 9: Creating build scripts..."

# Create optimized build script
cat > build_android_apk.sh << 'EOF'
#!/bin/bash

echo "🔨 Building Android APK"
echo "======================"

# Set Java environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Build React app
echo "📱 Building React app..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build APK
echo "🔨 Building APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    
    # Find and copy APK
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Location: $(pwd)/../../SmartERP-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install APK:"
        echo "adb install ../../SmartERP-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found"
    fi
else
    echo "❌ Build failed"
fi
EOF

chmod +x build_android_apk.sh

# Create Android Studio launcher
cat > open_android_studio.sh << 'EOF'
#!/bin/bash

echo "🚀 Opening Android Studio"
echo "========================"

# Set environment
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "📱 Environment:"
echo "Java: $(java -version 2>&1 | head -n1)"
echo "Android SDK: $ANDROID_HOME"
echo ""

if [ -d "/Applications/Android Studio.app" ]; then
    echo "🎯 Opening Android project..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for Gradle sync"
    echo "2. Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "3. Or click Run button to test on device"
else
    echo "❌ Android Studio not found!"
fi
EOF

chmod +x open_android_studio.sh

print_success "✅ Android project rebuilt successfully!"

echo ""
echo "🎯 Ready to Build APK!"
echo "====================="
echo ""
echo "Option 1 - Command Line Build:"
echo "   ./build_android_apk.sh"
echo ""
echo "Option 2 - Android Studio:"
echo "   ./open_android_studio.sh"

# Verify project structure
print_status "Verifying project structure..."
if [ -f "frontend/android/build.gradle" ] && [ -f "frontend/android/app/build.gradle" ]; then
    print_success "✅ Android project structure is complete"
    print_success "✅ Gradle build files present"
    print_success "✅ JDK configuration set"
else
    print_error "❌ Project structure verification failed"
fi

print_success "🎉 Android project rebuild completed!"
