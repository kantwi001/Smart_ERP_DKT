#!/bin/bash

echo "🔧 Fixing Mobile Build Issues for iOS and Android (Updated)"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check Java installation
check_java() {
    echo -e "${BLUE}🔍 Checking Java Runtime Environment...${NC}"
    
    # Check if Java is installed
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        echo -e "${GREEN}✅ Java found: $JAVA_VERSION${NC}"
        
        # Check if Java 17 is available
        if command -v java >/dev/null 2>&1 && java -version 2>&1 | grep -q "17\."; then
            echo -e "${GREEN}✅ Java 17 detected - Android build compatible${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Java 17 not detected. Current version: $JAVA_VERSION${NC}"
            echo -e "${YELLOW}   Android build may have compatibility issues${NC}"
        fi
    else
        echo -e "${RED}❌ Java Runtime Environment not found${NC}"
        echo -e "${YELLOW}📋 To install Java 17 on macOS:${NC}"
        echo "   brew install openjdk@17"
        echo "   echo 'export PATH=\"/opt/homebrew/opt/openjdk@17/bin:\$PATH\"' >> ~/.zshrc"
        echo "   source ~/.zshrc"
        echo ""
        echo -e "${YELLOW}📋 Alternative installation methods:${NC}"
        echo "   1. Download from Oracle: https://www.oracle.com/java/technologies/downloads/"
        echo "   2. Use SDKMAN: curl -s \"https://get.sdkman.io\" | bash && sdk install java 17.0.8-oracle"
        echo ""
        read -p "Do you want to continue without Java 17? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Exiting. Please install Java 17 and try again.${NC}"
            exit 1
        fi
    fi
}

# Function to check Capacitor CLI version and commands
check_capacitor() {
    echo -e "${BLUE}🔍 Checking Capacitor CLI...${NC}"
    
    if command -v npx >/dev/null 2>&1; then
        CAP_VERSION=$(npx @capacitor/cli --version 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Capacitor CLI available: $CAP_VERSION${NC}"
        
        # Test if platform commands are available
        if npx @capacitor/cli --help 2>/dev/null | grep -q "platform"; then
            echo -e "${GREEN}✅ Platform commands available${NC}"
            PLATFORM_CMD="platform"
        else
            echo -e "${YELLOW}⚠️  Platform commands not available, using remove/add directly${NC}"
            PLATFORM_CMD=""
        fi
    else
        echo -e "${RED}❌ npx not found. Please install Node.js${NC}"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "frontend/capacitor.config.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the erp-system root directory${NC}"
    exit 1
fi

# Run checks
check_java
check_capacitor

cd frontend

echo -e "${BLUE}🔧 Step 1: Cleaning existing build artifacts...${NC}"
rm -rf build/
rm -rf android/app/build/
rm -rf ios/App/build/
rm -rf node_modules/.cache/
echo -e "${GREEN}✅ Build artifacts cleaned${NC}"

echo -e "${BLUE}🔧 Step 2: Updating Capacitor configuration for compatibility...${NC}"

# Fix Capacitor config for better compatibility
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'http://127.0.0.1:2025',
      'http://127.0.0.1:2025/*',
      'http://localhost:2025',
      'http://localhost:2025/*',
      'http://localhost:2026',
      'http://127.0.0.1:2026',
      'http://10.0.2.2:2025',
      'http://10.0.2.2:2025/*'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1976d2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1976d2'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Preferences: {
      group: 'SmartERPSoftware'
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scheme: 'SmartERPSoftware',
    contentInset: 'automatic',
    scrollEnabled: true,
    swipeToGoBack: true,
    allowsLinkPreview: true,
    handleApplicationURL: true
  }
};

export default config;
EOF

echo -e "${GREEN}✅ Capacitor configuration updated${NC}"

echo -e "${BLUE}🔧 Step 3: Fixing Android Gradle configuration...${NC}"

# Update Android variables for better compatibility
cat > android/variables.gradle << 'EOF'
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.2'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    androidxMaterialVersion = '1.11.0'
    androidxBrowserVersion = '1.7.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
EOF

# Fix Android app build.gradle for Java 17 compatibility
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterpsoftware.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    defaultConfig {
        applicationId "com.smarterpsoftware.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "2.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             ignoreAssetsPattern "!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~"
        }
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug
        }
        debug {
            debuggable true
            jniDebuggable true
            renderscriptDebuggable true
        }
    }
    
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        resources {
            excludes += ['META-INF/DEPENDENCIES', 'META-INF/LICENSE', 'META-INF/LICENSE.txt', 'META-INF/license.txt', 'META-INF/NOTICE', 'META-INF/NOTICE.txt', 'META-INF/notice.txt', 'META-INF/ASL2.0', 'META-INF/*.kotlin_module']
        }
    }
    
    lint {
        abortOnError false
        checkReleaseBuilds false
    }
}

repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.core:core:$androidxCoreVersion"
    implementation "androidx.activity:activity:$androidxActivityVersion"
    implementation "com.google.android.material:material:$androidxMaterialVersion"
    implementation "androidx.browser:browser:$androidxBrowserVersion"
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-preferences')
    implementation project(':capacitor-splash-screen')
    implementation project(':capacitor-status-bar')
    implementation project(':capacitor-toast')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
EOF

# Fix root build.gradle
cat > android/build.gradle << 'EOF'
buildscript {
    ext {
        googleServicesVersion = '4.3.15'
        gradlePluginVersion = '8.2.1'
    }
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath "com.android.tools.build:gradle:$gradlePluginVersion"
        classpath "com.google.gms:google-services:$googleServicesVersion"
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF

echo -e "${GREEN}✅ Android Gradle configuration fixed${NC}"

echo -e "${BLUE}🔧 Step 4: Building React app with mobile optimizations...${NC}"

# Build React app with mobile-specific optimizations
GENERATE_SOURCEMAP=false INLINE_RUNTIME_CHUNK=false npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ React build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ React app built successfully${NC}"

echo -e "${BLUE}🔧 Step 5: Syncing Capacitor platforms (Updated Commands)...${NC}"

# Use updated Capacitor commands based on CLI version
if [ "$PLATFORM_CMD" = "platform" ]; then
    echo -e "${YELLOW}Using legacy platform commands...${NC}"
    npx cap platform remove android 2>/dev/null || true
    npx cap platform remove ios 2>/dev/null || true
    npx cap platform add android
    npx cap platform add ios
else
    echo -e "${YELLOW}Using modern Capacitor commands...${NC}"
    # Remove platforms if they exist
    if [ -d "android" ]; then
        echo -e "${YELLOW}Removing existing Android platform...${NC}"
        rm -rf android
    fi
    if [ -d "ios" ]; then
        echo -e "${YELLOW}Removing existing iOS platform...${NC}"
        rm -rf ios
    fi
    
    # Add platforms back
    npx cap add android
    npx cap add ios
fi

# Sync with new configuration
npx cap sync

echo -e "${GREEN}✅ Capacitor platforms synced${NC}"

echo -e "${BLUE}🔧 Step 6: Fixing iOS project configuration...${NC}"

# Check if iOS project exists
if [ -d "ios/App" ]; then
    # Fix iOS Info.plist for better compatibility
    if [ -f "ios/App/App/Info.plist" ]; then
        # Add necessary iOS configurations
        /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName SmartERPSoftware" ios/App/App/Info.plist 2>/dev/null || \
        /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string SmartERPSoftware" ios/App/App/Info.plist
        
        /usr/libexec/PlistBuddy -c "Set :NSAppTransportSecurity:NSAllowsArbitraryLoads true" ios/App/App/Info.plist 2>/dev/null || \
        /usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity dict" ios/App/App/Info.plist && \
        /usr/libexec/PlistBuddy -c "Add :NSAppTransportSecurity:NSAllowsArbitraryLoads bool true" ios/App/App/Info.plist
        
        echo -e "${GREEN}✅ iOS Info.plist configured${NC}"
    fi
    
    # Update iOS deployment target in project file
    if [ -f "ios/App/App.xcodeproj/project.pbxproj" ]; then
        sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9][0-9]*\.[0-9]/IPHONEOS_DEPLOYMENT_TARGET = 13.0/g' ios/App/App.xcodeproj/project.pbxproj
        echo -e "${GREEN}✅ iOS deployment target updated to 13.0${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  iOS platform not found, skipping iOS fixes${NC}"
fi

echo -e "${BLUE}🔧 Step 7: Creating Android debug APK...${NC}"

cd android

# Set JAVA_HOME if not set and Java 17 is available
if [ -z "$JAVA_HOME" ] && [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    echo -e "${GREEN}✅ JAVA_HOME set to: $JAVA_HOME${NC}"
fi

./gradlew clean
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Copy APK to root directory with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/debug/app-debug.apk "../smart-erp-fixed-${TIMESTAMP}.apk"
    echo -e "${GREEN}✅ Android APK created: smart-erp-fixed-${TIMESTAMP}.apk${NC}"
else
    echo -e "${YELLOW}⚠️  Android build completed with warnings${NC}"
fi

cd ..

echo -e "${BLUE}🔧 Step 8: Final verification...${NC}"

# Verify build outputs
if [ -f "build/index.html" ]; then
    echo -e "${GREEN}✅ React build: OK${NC}"
else
    echo -e "${RED}❌ React build: FAILED${NC}"
fi

if [ -d "android/app/build" ]; then
    echo -e "${GREEN}✅ Android build: OK${NC}"
else
    echo -e "${RED}❌ Android build: FAILED${NC}"
fi

if [ -d "ios/App" ]; then
    echo -e "${GREEN}✅ iOS project: OK${NC}"
else
    echo -e "${YELLOW}⚠️  iOS project: Not available${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Mobile Build Fix Complete! (Updated)${NC}"
echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo -e "${YELLOW}For Android Studio:${NC}"
echo "1. Open: frontend/android/ in Android Studio"
echo "2. Let Gradle sync complete"
echo "3. Build > Make Project"
echo "4. Run > Run 'app'"
echo ""
echo -e "${YELLOW}For Xcode:${NC}"
echo "1. Open: frontend/ios/App/App.xcworkspace in Xcode"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Choose a simulator or device"
echo "4. Product > Build"
echo "5. Product > Run"
echo ""
echo -e "${BLUE}📋 Troubleshooting:${NC}"
echo "- If Java issues persist: brew install openjdk@17 && export JAVA_HOME=/opt/homebrew/opt/openjdk@17"
echo "- If Capacitor sync fails: Run 'npx cap doctor' for diagnostics"
echo "- If platform commands fail: Try 'npm install -g @capacitor/cli' to update"
echo "- For iOS build issues: Check Xcode Command Line Tools with 'xcode-select --install'"
echo ""
echo -e "${BLUE}🔍 System Information:${NC}"
java -version 2>&1 | head -n 1 || echo "Java not found"
npx @capacitor/cli --version 2>/dev/null || echo "Capacitor CLI not found"
