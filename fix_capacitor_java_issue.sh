#!/bin/bash

echo "🔧 Fixing Capacitor Android Java Compatibility"
echo "=============================================="

# Set error handling
set -e

# Navigate to Android project
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/android

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

echo "📝 Step 1: Fixing root build.gradle for Java 17..."
# Backup root build.gradle
cp build.gradle build.gradle.backup

# Add Java toolchain configuration to root build.gradle
cat > build.gradle << 'EOF'
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'

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

// Force all modules to use Java 17
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
        }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
EOF

echo "✅ Root build.gradle updated with Java 17 enforcement"

echo "📝 Step 2: Updating app/build.gradle..."
# Backup app build.gradle if not already done
if [ ! -f "app/build.gradle.backup" ]; then
    cp app/build.gradle app/build.gradle.backup
fi

# Update app build.gradle with Java 17 compatibility
cat > app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterpsoftware.app"
    compileSdk rootProject.ext.compileSdkVersion
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    defaultConfig {
        applicationId "com.smarterpsoftware.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             // Files and dirs to omit from the packaged assets dir, modified to accommodate modern web apps.
             // Default: https://android.googlesource.com/platform/frameworks/base/+/282e181b58cf72b6ca770dc7ca5f91f135444502/tools/aapt/AaptAssets.cpp#61
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
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

echo "✅ app/build.gradle updated"

echo "📝 Step 3: Updating gradle.properties..."
# Update gradle.properties with comprehensive Java 17 settings
cat > gradle.properties << 'EOF'
# Project-wide Gradle settings.

# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.

# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
org.gradle.jvmargs=-Xmx2048m

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true

# Java 17 compatibility
org.gradle.java.home=/opt/homebrew/opt/openjdk@17
EOF

echo "✅ gradle.properties updated"

echo "🧹 Step 4: Cleaning all builds..."
./gradlew clean

echo "🏗️ Step 5: Building Android APK with fixed Java compatibility..."
./gradlew assembleRelease

# Check if APK was created
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo "✅ APK built successfully!"
    
    # Copy to project root with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/release/app-release.apk ../../smart-erp-fixed-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 ANDROID APK READY!"
    echo "===================="
    echo ""
    echo "📱 APK Location: smart-erp-fixed-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../../smart-erp-fixed-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Fixed Issues:"
    echo "   ✅ Capacitor Android Java 21 → Java 17"
    echo "   ✅ Root build.gradle Java enforcement"
    echo "   ✅ App build.gradle Java 17 compatibility"
    echo "   ✅ Gradle properties Java 17 configuration"
    echo ""
    echo "🚀 Installation Options:"
    echo "1. Transfer APK to Android device and install"
    echo "2. Use Android emulator: adb install smart-erp-fixed-${TIMESTAMP}.apk"
    echo "3. Upload to Google Play Console for distribution"
    echo ""
    echo "📋 App Details:"
    echo "   • App Name: SmartERPSoftware"
    echo "   • Package: com.smarterpsoftware.app"
    echo "   • Backend: https://erp.tarinnovation.com"
    echo "   • Java Version: 17 (Fully Compatible)"
else
    echo "❌ APK build failed - file not found"
    echo "Restoring original files..."
    cp build.gradle.backup build.gradle
    cp app/build.gradle.backup app/build.gradle
    exit 1
fi
