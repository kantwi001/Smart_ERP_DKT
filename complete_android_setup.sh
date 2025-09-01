#!/bin/bash

echo "🤖 Complete Android Project Setup for Android Studio"
echo "===================================================="

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

print_status "Step 1: Setting up Java environment properly..."

# Check and setup Java
if ! java -version 2>&1 | grep -q "openjdk version"; then
    print_warning "Java not properly configured. Setting up Java 17..."
    
    # Install Java 17 if not present
    if ! brew list openjdk@17 &>/dev/null; then
        print_status "Installing OpenJDK 17..."
        brew install openjdk@17
    fi
    
    # Set Java environment variables
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    
    # Add to shell profile for persistence
    echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
    echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
    
    # Create system symlink
    sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
    
    print_success "Java 17 configured"
else
    print_success "Java is properly configured"
fi

# Verify Java
print_status "Verifying Java installation..."
java -version
javac -version

print_status "Step 2: Setting up Android SDK and tools..."

# Set Android environment variables
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

# Add to shell profile
echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
echo 'export ANDROID_SDK_ROOT="$ANDROID_HOME"' >> ~/.zshrc
echo 'export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"' >> ~/.zshrc

# Install Android Studio if not present
if [ ! -d "/Applications/Android Studio.app" ]; then
    print_status "Installing Android Studio..."
    brew install --cask android-studio
    print_success "Android Studio installed"
else
    print_success "Android Studio already installed"
fi

print_status "Step 3: Preparing React app for mobile..."

cd frontend

# Ensure mobile environment is set
print_status "Setting mobile environment variables..."
cat > .env << 'EOF'
PORT=2026
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

print_status "Installing frontend dependencies..."
npm install --silent

print_status "Building React app for mobile (optimized)..."
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React build completed successfully"

print_status "Step 4: Setting up Capacitor Android project..."

# Initialize Capacitor if not done
if [ ! -f "capacitor.config.json" ]; then
    print_status "Initializing Capacitor..."
    npx cap init "Smart ERP" "com.smarterp.app"
fi

# Add Android platform if not present
if [ ! -d "android" ]; then
    print_status "Adding Android platform..."
    npx cap add android
fi

# Sync and copy files
print_status "Syncing Capacitor files..."
npx cap sync android
npx cap copy android

# Update Capacitor config for better Android Studio integration
print_status "Optimizing Capacitor configuration..."
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

# Update Android project for better compatibility
print_status "Configuring Android project settings..."

# Update gradle.properties for better performance
cat >> android/gradle.properties << 'EOF'

# Performance optimizations
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.caching=true
android.useAndroidX=true
android.enableJetifier=true

# Build optimizations
android.enableR8.fullMode=true
android.enableBuildCache=true
EOF

# Update build.gradle for compatibility
if [ -f "android/app/build.gradle" ]; then
    print_status "Updating Android build configuration..."
    
    # Backup original
    cp android/app/build.gradle android/app/build.gradle.backup
    
    # Update compileSdkVersion and targetSdkVersion
    sed -i '' 's/compileSdkVersion [0-9]*/compileSdkVersion 34/' android/app/build.gradle
    sed -i '' 's/targetSdkVersion [0-9]*/targetSdkVersion 34/' android/app/build.gradle
fi

cd ..

print_status "Step 5: Creating Android Studio workspace scripts..."

# Create script to open in Android Studio
cat > open_in_android_studio.sh << 'EOF'
#!/bin/bash

echo "🚀 Opening Android Project in Android Studio"
echo "==========================================="

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

# Set Android environment
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "📱 Environment configured:"
echo "Java: $(java -version 2>&1 | head -n1)"
echo "Android Home: $ANDROID_HOME"
echo ""

if [ -d "/Applications/Android Studio.app" ]; then
    echo "🎯 Opening Android project in Android Studio..."
    open -a "Android Studio" .
    
    echo ""
    echo "✅ Android Studio opened!"
    echo ""
    echo "📋 Next Steps in Android Studio:"
    echo "================================"
    echo "1. Wait for Gradle sync to complete (may take a few minutes)"
    echo "2. If prompted, accept SDK updates"
    echo "3. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)"
    echo "4. Or run on device: Click green 'Run' button"
    echo ""
    echo "📱 APK will be generated at:"
    echo "app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Android Studio not found!"
    echo "Install with: brew install --cask android-studio"
fi
EOF

# Create Gradle build script
cat > build_apk_gradle.sh << 'EOF'
#!/bin/bash

echo "🔨 Building APK with Gradle"
echo "==========================="

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "☕ Java Version: $(java -version 2>&1 | head -n1)"
echo ""

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
        cp "$APK_PATH" "../../SmartERP-Gradle-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Gradle-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 APK Details:"
        echo "File: SmartERP-Gradle-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo "Path: $(pwd)/../../SmartERP-Gradle-${TIMESTAMP}.apk"
        
        echo ""
        echo "🚀 Install on device:"
        echo "adb install ../../SmartERP-Gradle-${TIMESTAMP}.apk"
    else
        echo "❌ APK file not found"
    fi
else
    echo "❌ Build failed - check Gradle output above"
fi
EOF

# Create release build script
cat > build_release_apk.sh << 'EOF'
#!/bin/bash

echo "🚀 Building Release APK"
echo "======================"

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

echo "☕ Java Version: $(java -version 2>&1 | head -n1)"
echo ""

echo "🧹 Cleaning previous builds..."
./gradlew clean

echo "🔨 Building release APK..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release APK built successfully!"
    
    APK_PATH=$(find . -name "*release*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Release-${TIMESTAMP}.apk"
        APK_SIZE=$(ls -lh "../../SmartERP-Release-${TIMESTAMP}.apk" | awk '{print $5}')
        
        echo "📱 Release APK:"
        echo "File: SmartERP-Release-${TIMESTAMP}.apk"
        echo "Size: $APK_SIZE"
        echo ""
        echo "⚠️  Note: This APK is unsigned"
        echo "For production, sign with your keystore"
    fi
else
    echo "❌ Release build failed"
fi
EOF

# Make scripts executable
chmod +x open_in_android_studio.sh
chmod +x build_apk_gradle.sh
chmod +x build_release_apk.sh

print_success "Android Studio setup completed!"

echo ""
echo "🎯 Ready to Build APK in Android Studio!"
echo "========================================"
echo ""
echo "Option 1 - Open in Android Studio (Recommended):"
echo "   ./open_in_android_studio.sh"
echo ""
echo "Option 2 - Build via Gradle Command Line:"
echo "   ./build_apk_gradle.sh"
echo ""
echo "Option 3 - Build Release APK:"
echo "   ./build_release_apk.sh"

echo ""
echo "📋 Android Studio Workflow:"
echo "=========================="
echo "1. Run: ./open_in_android_studio.sh"
echo "2. Wait for Gradle sync in Android Studio"
echo "3. Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "4. APK location: frontend/android/app/build/outputs/apk/debug/"

# Verify project structure
print_status "Verifying Android project structure..."
if [ -f "frontend/android/build.gradle" ] && [ -f "frontend/android/app/build.gradle" ]; then
    print_success "✅ Android project structure is ready"
    print_success "✅ Java environment configured"
    print_success "✅ Android Studio integration ready"
    print_success "✅ Build scripts created"
else
    print_error "❌ Android project structure incomplete"
fi

print_success "🎉 Complete Android setup finished! Ready for Android Studio."
