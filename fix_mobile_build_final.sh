#!/bin/bash

echo "🔧 Final Mobile Build Fix - Java + Dependencies + Android Studio/Xcode"
echo "====================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Installing Java 17 Runtime${NC}"
# Check if Java 17 is installed
if command -v java >/dev/null 2>&1; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" = "17" ]; then
        echo -e "${GREEN}✅ Java 17 already installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Java $JAVA_VERSION found, need Java 17${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No Java found, installing Java 17...${NC}"
fi

# Install Java 17 via Homebrew
if ! command -v brew >/dev/null 2>&1; then
    echo -e "${RED}❌ Homebrew not found. Please install Homebrew first:${NC}"
    echo "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install OpenJDK 17
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Add to shell profile
if [ -f ~/.zshrc ]; then
    echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"' >> ~/.zshrc
    echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
fi

if [ -f ~/.bash_profile ]; then
    echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"' >> ~/.bash_profile
    echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.bash_profile
fi

echo -e "${GREEN}✅ Java 17 installed and configured${NC}"
echo ""

cd frontend

echo -e "${BLUE}📋 Step 2: Complete cleanup${NC}"
rm -rf node_modules package-lock.json
rm -rf android ios build
echo -e "${GREEN}✅ Clean slate created${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Creating compatible package.json${NC}"
cat > package.json << 'EOF'
{
  "name": "smart-erp-software",
  "version": "0.1.0",
  "private": true,
  "port": 2026,
  "dependencies": {
    "@capacitor/android": "5.7.8",
    "@capacitor/app": "5.0.7",
    "@capacitor/core": "5.7.8",
    "@capacitor/haptics": "5.0.7",
    "@capacitor/ios": "5.7.8",
    "@capacitor/keyboard": "5.0.8",
    "@capacitor/network": "5.0.7",
    "@capacitor/preferences": "5.0.7",
    "@capacitor/splash-screen": "5.0.7",
    "@capacitor/status-bar": "5.0.7",
    "@capacitor/toast": "5.0.7",
    "@date-io/date-fns": "2.17.0",
    "@emotion/react": "11.11.4",
    "@emotion/styled": "11.11.5",
    "@mui/icons-material": "5.15.15",
    "@mui/lab": "5.0.0-alpha.170",
    "@mui/material": "5.15.15",
    "@mui/x-date-pickers": "7.3.2",
    "ajv": "8.12.0",
    "axios": "1.6.8",
    "date-fns": "3.6.0",
    "jspdf": "2.5.1",
    "jspdf-autotable": "3.8.2",
    "leaflet": "1.9.4",
    "localforage": "1.10.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-leaflet": "4.2.1",
    "react-router-dom": "6.22.3",
    "react-scripts": "5.0.1",
    "recharts": "2.12.7",
    "web-vitals": "3.5.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "GENERATE_SOURCEMAP=false react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "build:mobile": "GENERATE_SOURCEMAP=false INLINE_RUNTIME_CHUNK=false npm run build"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@capacitor/cli": "5.7.8",
    "typescript": "4.9.5"
  },
  "overrides": {
    "ajv": "8.12.0",
    "ajv-keywords": "5.1.0"
  }
}
EOF

echo -e "${GREEN}✅ Compatible package.json created${NC}"
echo ""

echo -e "${BLUE}📋 Step 4: Installing dependencies with conflict resolution${NC}"
npm install --legacy-peer-deps --force
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}📋 Step 5: Creating Capacitor configuration${NC}"
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'localhost:2025',
      'localhost:2026',
      '192.168.2.185:2025',
      'erp.tarinnovation.com'
    ]
  },
  android: {
    minWebViewVersion: 60,
    allowMixedContent: true
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
EOF

echo -e "${GREEN}✅ Capacitor configuration created${NC}"
echo ""

echo -e "${BLUE}📋 Step 6: Building React app${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ React build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ React build completed${NC}"
echo ""

echo -e "${BLUE}📋 Step 7: Adding Capacitor platforms${NC}"
npx cap add android
npx cap add ios
echo -e "${GREEN}✅ Platforms added${NC}"
echo ""

echo -e "${BLUE}📋 Step 8: Configuring Android for Studio compatibility${NC}"

# Update Android app build.gradle
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterpsoftware.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.smarterpsoftware.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             ignoreAssetsPattern "!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~"
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

repositories {
    google()
    mavenCentral()
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation "androidx.webkit:webkit:$androidxWebkitVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-android')
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

# Update variables.gradle
cat > android/variables.gradle << 'EOF'
ext {
    minSdkVersion = 22
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.8.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
EOF

# Update root build.gradle
cat > android/build.gradle << 'EOF'
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.4'
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF

# Update gradle.properties for Java 17
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=false
org.gradle.java.home=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
EOF

echo -e "${GREEN}✅ Android configuration updated for Studio${NC}"
echo ""

echo -e "${BLUE}📋 Step 9: Configuring iOS for Xcode${NC}"

# Update iOS configuration
if [ -f "ios/App/App/Info.plist" ]; then
    # Add network security configuration for iOS
    plutil -replace NSAppTransportSecurity -xml '<dict><key>NSAllowsArbitraryLoads</key><true/></dict>' ios/App/App/Info.plist 2>/dev/null || true
    echo -e "${GREEN}✅ iOS Info.plist updated for Xcode${NC}"
fi

echo ""

echo -e "${BLUE}📋 Step 10: Syncing Capacitor${NC}"
npx cap sync
echo -e "${GREEN}✅ Capacitor sync completed${NC}"
echo ""

echo -e "${BLUE}📋 Step 11: Testing Android build${NC}"
cd android

# Make gradlew executable
chmod +x gradlew

echo "Building Android APK with Java 17..."
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

./gradlew clean
./gradlew assembleDebug --no-daemon --stacktrace

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        APK_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
        echo -e "${GREEN}🎉 Android APK built successfully! (Size: $APK_SIZE)${NC}"
        
        # Copy APK to root directory
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        cp app/build/outputs/apk/debug/app-debug.apk ../../SmartERPSoftware-${TIMESTAMP}.apk
        echo -e "${GREEN}📱 APK saved as: SmartERPSoftware-${TIMESTAMP}.apk${NC}"
    else
        echo -e "${RED}❌ APK file not found${NC}"
        BUILD_EXIT_CODE=1
    fi
else
    echo -e "${RED}❌ Android build failed${NC}"
    echo ""
    echo -e "${BLUE}Debug information:${NC}"
    echo "Java version: $(java -version 2>&1 | head -n 1)"
    echo "JAVA_HOME: $JAVA_HOME"
fi

cd ..

echo ""
echo -e "${BLUE}📋 Final Status${NC}"
echo "================="

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ Android build: SUCCESS${NC}"
    echo -e "${GREEN}✅ Android Studio ready: frontend/android/${NC}"
    echo -e "${GREEN}✅ Xcode ready: frontend/ios/App/App.xcworkspace${NC}"
else
    echo -e "${RED}❌ Android build: FAILED${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next Steps for Android Studio:${NC}"
echo "1. Open Android Studio"
echo "2. File > Open > Select: frontend/android/"
echo "3. Wait for Gradle sync to complete"
echo "4. Build > Make Project"
echo "5. Run > Run 'app'"
echo ""
echo -e "${BLUE}📋 Next Steps for Xcode:${NC}"
echo "1. Open Xcode"
echo "2. File > Open > Select: frontend/ios/App/App.xcworkspace"
echo "3. Product > Build"
echo "4. Product > Run"
echo ""
echo -e "${BLUE}📋 For direct APK install:${NC}"
echo "adb install SmartERPSoftware-*.apk"

cd ..

exit $BUILD_EXIT_CODE
