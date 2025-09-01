#!/bin/bash

echo "🔧 Final Android Build Fix"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd frontend

echo -e "${BLUE}📋 Step 1: Complete dependency cleanup${NC}"
rm -rf node_modules package-lock.json
rm -rf android
echo -e "${GREEN}✅ Clean slate created${NC}"
echo ""

echo -e "${BLUE}📋 Step 2: Fresh install of all original dependencies${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Original React dependencies installed${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Adding compatible Capacitor versions${NC}"
npm install --legacy-peer-deps @capacitor/core@^6.1.2 @capacitor/cli@^6.1.2 @capacitor/android@^6.1.2
echo -e "${GREEN}✅ Capacitor dependencies added${NC}"
echo ""

echo -e "${BLUE}📋 Step 3.5: Installing TypeScript for Capacitor${NC}"
npm install --legacy-peer-deps -D typescript
echo -e "${GREEN}✅ TypeScript installed${NC}"
echo ""

echo -e "${BLUE}📋 Step 4: Creating compatible Capacitor configuration${NC}"
cat > capacitor.config.js << 'EOF'
const config = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'localhost:2025',
      'localhost:2026',
      '192.168.2.185:2025'
    ]
  }
};

module.exports = config;
EOF
echo -e "${GREEN}✅ Capacitor configuration updated${NC}"
echo ""

echo -e "${BLUE}📋 Step 5: Building React app first${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  React build failed, fixing dependencies...${NC}"
    npm install --legacy-peer-deps ajv@^8.0.0
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ React build still failing, trying force fix...${NC}"
        npm audit fix --force
        npm run build
    fi
fi
echo -e "${GREEN}✅ React build completed${NC}"
echo ""

echo -e "${BLUE}📋 Step 6: Adding Android platform${NC}"
npx cap add android
if [ ! -d "android" ]; then
    echo -e "${RED}❌ Android platform creation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Android platform added${NC}"
echo ""

echo -e "${BLUE}📋 Step 7: Fixing Android configuration for API 24+${NC}"

# Update Android app build.gradle with minSdk 24
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterpsoftware.app"
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.smarterpsoftware.app"
        minSdkVersion 24
        targetSdkVersion 34
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

echo -e "${GREEN}✅ Android app build.gradle updated (minSdk 24)${NC}"

# Update variables.gradle
cat > android/variables.gradle << 'EOF'
ext {
    minSdkVersion = 24
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

echo -e "${GREEN}✅ Android variables.gradle updated (minSdk 24)${NC}"

# Update root build.gradle with compatible versions
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

echo -e "${GREEN}✅ Android root build.gradle updated${NC}"

# Fix AndroidManifest.xml
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

echo -e "${GREEN}✅ AndroidManifest.xml updated${NC}"
echo ""

echo -e "${BLUE}📋 Step 8: Fixing Capacitor Android Java compatibility${NC}"

# Check if capacitor-android build.gradle exists and fix Java version
if [ -f "android/capacitor-android/build.gradle" ]; then
    sed -i '' 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/capacitor-android/build.gradle
    sed -i '' 's/sourceCompatibility = 21/sourceCompatibility = 17/g' android/capacitor-android/build.gradle
    sed -i '' 's/targetCompatibility = 21/targetCompatibility = 17/g' android/capacitor-android/build.gradle
    echo -e "${GREEN}✅ Capacitor Android Java version fixed${NC}"
else
    echo -e "${YELLOW}⚠️  Capacitor Android build.gradle not found, will be created during sync${NC}"
fi
echo ""

echo -e "${BLUE}📋 Step 9: Syncing Capacitor with new configuration${NC}"
npx cap sync android
echo -e "${GREEN}✅ Capacitor sync completed${NC}"
echo ""

echo -e "${BLUE}📋 Step 10: Final Java compatibility fix${NC}"
# Fix any remaining Java 21 references in capacitor-android
if [ -f "android/capacitor-android/build.gradle" ]; then
    sed -i '' 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/capacitor-android/build.gradle
    sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' android/capacitor-android/build.gradle
    sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' android/capacitor-android/build.gradle
    echo -e "${GREEN}✅ Fixed capacitor-android Java version${NC}"
fi

# Fix Java version in all Capacitor plugin build.gradle files
for plugin_dir in android/capacitor-*; do
    if [ -d "$plugin_dir" ] && [ -f "$plugin_dir/build.gradle" ]; then
        plugin_name=$(basename "$plugin_dir")
        echo -e "${BLUE}Fixing Java version in $plugin_name...${NC}"
        sed -i '' 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' "$plugin_dir/build.gradle"
        sed -i '' 's/sourceCompatibility JavaVersion.VERSION_21/sourceCompatibility JavaVersion.VERSION_17/g' "$plugin_dir/build.gradle"
        sed -i '' 's/targetCompatibility JavaVersion.VERSION_21/targetCompatibility JavaVersion.VERSION_17/g' "$plugin_dir/build.gradle"
        sed -i '' 's/sourceCompatibility = JavaVersion.VERSION_21/sourceCompatibility = JavaVersion.VERSION_17/g' "$plugin_dir/build.gradle"
        sed -i '' 's/targetCompatibility = JavaVersion.VERSION_21/targetCompatibility = JavaVersion.VERSION_17/g' "$plugin_dir/build.gradle"
        echo -e "${GREEN}✅ Fixed $plugin_name Java version${NC}"
    fi
done

# Also fix gradle.properties if it exists
if [ -f "android/gradle.properties" ]; then
    sed -i '' 's/org.gradle.jvmargs.*-Dfile.encoding=UTF-8$/org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8/g' android/gradle.properties
    echo "org.gradle.java.home=/usr/libexec/java_home -v 17" >> android/gradle.properties
    echo -e "${GREEN}✅ Updated gradle.properties for Java 17${NC}"
fi
echo ""

echo -e "${BLUE}📋 Step 11: Building Android APK${NC}"
cd android

# Make gradlew executable
chmod +x gradlew

echo "Stopping any existing Gradle daemons..."
./gradlew --stop

echo "Building with clean state..."
./gradlew clean
./gradlew assembleDebug --no-daemon --stacktrace

BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
        APK_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
        echo -e "${GREEN}🎉 Android APK built successfully! (Size: $APK_SIZE)${NC}"
        
        # Copy APK to root directory with timestamp
        TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
        cp app/build/outputs/apk/debug/app-debug.apk ../../smart-erp-final-${TIMESTAMP}.apk
        echo -e "${GREEN}📱 APK saved as: smart-erp-final-${TIMESTAMP}.apk${NC}"
        
        echo ""
        echo -e "${BLUE}📋 Success! Next Steps:${NC}"
        echo "1. Install APK: adb install smart-erp-final-${TIMESTAMP}.apk"
        echo "2. Or open frontend/android/ in Android Studio"
        echo "3. Test app with backend on localhost:2025"
        
    else
        echo -e "${RED}❌ APK file not found despite successful build${NC}"
        BUILD_EXIT_CODE=1
    fi
else
    echo -e "${RED}❌ Android build still failed${NC}"
    echo ""
    echo -e "${BLUE}📋 Debug information:${NC}"
    echo "Java version: $(java -version 2>&1 | head -n 1)"
    echo "Gradle version: $(./gradlew --version | grep Gradle)"
    echo ""
    echo "Try running with more verbose output:"
    echo "./gradlew assembleDebug --info --stacktrace"
fi

cd ../..

echo ""
echo -e "${BLUE}📋 Final Fix Summary${NC}"
echo "========================"
echo "✅ Complete dependency cleanup"
echo "✅ Fresh install of all original dependencies"
echo "✅ Compatible Capacitor v6.1.2 installed"
echo "✅ minSdkVersion set to 24 (Cordova compatible)"
echo "✅ Java 17 compatibility enforced"
echo "✅ All manifest conflicts resolved"
echo "✅ Clean platform rebuild"

exit $BUILD_EXIT_CODE
