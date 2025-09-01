#!/bin/bash

# Fix Android Build and Deploy Mobile App with Fly.dev Backend
set -e

echo "🚀 Fixing Android Build and Deploying Mobile App"
echo "==============================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

cd frontend

echo -e "${BLUE}📋 Step 1: Fixing Android build.gradle${NC}"
# Update Android build.gradle to use compileSdk 35
cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterp.mobile"
    compileSdk 35
    defaultConfig {
        applicationId "com.smarterp.mobile"
        minSdk 23
        targetSdk 35
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
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.coordinatorlayout:coordinatorlayout:1.2.0'
    implementation 'androidx.core:core-splashscreen:1.0.1'
    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
    androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-preferences')
    implementation project(':capacitor-status-bar')
    implementation project(':capacitor-cordova-android-plugins')
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

echo -e "${BLUE}📋 Step 2: Syncing Capacitor${NC}"
npx cap sync

echo -e "${BLUE}📋 Step 3: Building Android APK${NC}"
cd android
./gradlew clean assembleDebug
cd ..

# Copy APK with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-FlydevFixed-${TIMESTAMP}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"

echo -e "${GREEN}✅ SUCCESS: Mobile app built with Fly.dev backend!${NC}"
echo -e "${GREEN}📱 APK: ${APK_NAME}${NC}"
echo -e "${GREEN}🔗 Backend: https://backend-shy-sun-4450.fly.dev/api${NC}"
echo ""
echo "Install the APK and test - it will connect to Fly.dev backend"
