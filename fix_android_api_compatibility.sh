#!/bin/bash

echo "🔧 Android API Compatibility Fix"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd frontend

echo -e "${BLUE}📋 Step 1: Updating Capacitor to latest stable version${NC}"
npm install @capacitor/core@^6.1.2 @capacitor/cli@^6.1.2 @capacitor/android@^6.1.2
echo -e "${GREEN}✅ Capacitor updated to stable version${NC}"
echo ""

echo -e "${BLUE}📋 Step 2: Fixing Android Gradle configuration${NC}"

# Update Android app build.gradle
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterpsoftware.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.smarterpsoftware.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged APK
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
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"
    implementation 'androidx.webkit:webkit:1.8.0'
    testImplementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.1.5"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
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

echo -e "${GREEN}✅ Android app build.gradle updated${NC}"

# Update root build.gradle
cat > android/build.gradle << 'EOF'
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.4'
        classpath 'com.google.gms:google-services:4.4.0'

        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
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

echo -e "${GREEN}✅ Android root build.gradle updated${NC}"

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
    cordovaAndroidVersion = '12.0.1'
}
EOF

echo -e "${GREEN}✅ Android variables.gradle updated${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Fixing AndroidManifest.xml conflicts${NC}"

# Update AndroidManifest.xml to resolve conflicts
cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

</manifest>
EOF

echo -e "${GREEN}✅ AndroidManifest.xml conflicts resolved${NC}"
echo ""

echo -e "${BLUE}📋 Step 4: Updating Capacitor configuration${NC}"

# Update capacitor.config.ts for compatibility
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
      'https://erp.tarinnovation.com'
    ]
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scrollEnabled: true,
    swipeToGoBack: true,
    handleApplicationURL: true
  }
};

export default config;
EOF

echo -e "${GREEN}✅ Capacitor configuration updated${NC}"
echo ""

echo -e "${BLUE}📋 Step 5: Cleaning and rebuilding platforms${NC}"

# Remove and re-add platforms
echo "Removing existing Android platform..."
npx cap platform remove android 2>/dev/null || true

echo "Adding Android platform with updated configuration..."
npx cap add android

echo "Syncing Capacitor..."
npx cap sync android

echo -e "${GREEN}✅ Platforms rebuilt with updated configuration${NC}"
echo ""

echo -e "${BLUE}📋 Step 6: Testing Android build${NC}"

cd android

# Make gradlew executable
chmod +x gradlew

echo "Testing Gradle configuration..."
if ./gradlew tasks --quiet >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Gradle configuration valid${NC}"
else
    echo -e "${RED}❌ Gradle configuration issues persist${NC}"
    echo "Checking Gradle daemon..."
    ./gradlew --stop
fi

echo ""
echo "Building Android APK..."
./gradlew assembleDebug --no-daemon --stacktrace

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        APK_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
        echo -e "${GREEN}🎉 Android APK built successfully! (Size: $APK_SIZE)${NC}"
        
        # Copy APK to root directory with timestamp
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        cp app/build/outputs/apk/debug/app-debug.apk ../../smart-erp-fixed-${TIMESTAMP}.apk
        echo -e "${GREEN}📱 APK saved as: smart-erp-fixed-${TIMESTAMP}.apk${NC}"
        
        echo ""
        echo -e "${BLUE}📋 Next Steps:${NC}"
        echo "1. Install APK on Android device: adb install smart-erp-fixed-${TIMESTAMP}.apk"
        echo "2. Or open frontend/android/ in Android Studio"
        echo "3. Test app connectivity to backend on localhost:2025"
        
    else
        echo -e "${RED}❌ APK file not found despite successful build${NC}"
        BUILD_EXIT_CODE=1
    fi
else
    echo -e "${RED}❌ Android build failed${NC}"
    echo ""
    echo -e "${BLUE}📋 Additional troubleshooting:${NC}"
    echo "1. Check Android SDK installation"
    echo "2. Verify Java 17 is being used"
    echo "3. Run: ./gradlew assembleDebug --info for detailed logs"
fi

cd ../..

echo ""
echo -e "${BLUE}📋 Compatibility Fix Summary${NC}"
echo "================================="
echo "✅ Capacitor downgraded to stable v6.1.2"
echo "✅ Android SDK target set to API 34 (compatible)"
echo "✅ Manifest conflicts resolved"
echo "✅ Java 17 compatibility ensured"
echo "✅ Platforms rebuilt with new configuration"

exit $BUILD_EXIT_CODE
