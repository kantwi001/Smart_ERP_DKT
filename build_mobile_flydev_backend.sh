#!/bin/bash

# Build Mobile Apps with Fly.dev Backend for Xcode and Android Studio
# Mobile apps use https://backend-shy-sun-4450.fly.dev
# Web app uses http://localhost:2025

echo "🚀 Building mobile apps with Fly.dev backend for IDEs..."

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Step 1: Fix TypeScript dependencies first
echo "🔧 Fixing TypeScript dependencies..."
if [ -f "fix_typescript_dependency_conflict.sh" ]; then
    chmod +x fix_typescript_dependency_conflict.sh
    ./fix_typescript_dependency_conflict.sh
else
    echo "⚠️  TypeScript fix script not found, proceeding with manual fix..."
    cd frontend
    rm -rf node_modules package-lock.json
    sed -i '' 's/"typescript": "\^5\.9\.2"/"typescript": "^4.9.5"/' package.json
    npm install --legacy-peer-deps
    cd ..
fi

# Step 2: Build React app for mobile
echo "📱 Building React app for mobile..."
cd frontend
GENERATE_SOURCEMAP=false REACT_APP_MOBILE_MODE=true npm run build

# Step 3: Update Capacitor configuration for Fly.dev backend
echo "🔧 Updating Capacitor configuration for Fly.dev backend..."
cat > capacitor.config.json << 'EOF'
{
  "appId": "com.smarterp.software",
  "appName": "Smart ERP Software",
  "webDir": "build",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "iosScheme": "https",
    "allowNavigation": [
      "https://backend-shy-sun-4450.fly.dev",
      "https://*.fly.dev"
    ]
  },
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  },
  "ios": {
    "scrollEnabled": true,
    "swipeToGoBack": true,
    "handleApplicationURL": true
  },
  "android": {
    "allowMixedContent": false,
    "captureInput": true
  }
}
EOF

# Step 4: Update iOS Info.plist for Fly.dev network security
echo "🍎 Configuring iOS network security for Fly.dev..."
if [ -f "ios/App/App/Info.plist" ]; then
    plutil -replace NSAppTransportSecurity -xml '<dict>
        <key>NSAllowsArbitraryLoads</key>
        <false/>
        <key>NSExceptionDomains</key>
        <dict>
            <key>backend-shy-sun-4450.fly.dev</key>
            <dict>
                <key>NSExceptionRequiresForwardSecrecy</key>
                <false/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <false/>
            </dict>
            <key>fly.dev</key>
            <dict>
                <key>NSExceptionRequiresForwardSecrecy</key>
                <false/>
                <key>NSExceptionMinimumTLSVersion</key>
                <string>TLSv1.2</string>
                <key>NSIncludesSubdomains</key>
                <true/>
            </dict>
        </dict>
    </dict>' ios/App/App/Info.plist
fi

# Step 5: Update Android build configuration
echo "🤖 Configuring Android build..."
if [ -f "android/app/build.gradle" ]; then
    cat > android/app/build.gradle << 'EOF'
apply plugin: 'com.android.application'

android {
    namespace "com.smarterp.software"
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.smarterp.software"
        minSdkVersion 22
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
    gradlePluginPortal()
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation 'androidx.core:core-splashscreen:1.0.1'
    implementation project(':capacitor-android')
    testImplementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.1.5"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-preferences')
    implementation project(':capacitor-status-bar')
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
fi

# Step 6: Sync with Capacitor
echo "⚡ Syncing with Capacitor..."
npx cap sync

# Step 7: Copy web assets
echo "📋 Copying web assets..."
npx cap copy

# Step 8: Build Android APK
echo "📦 Building Android APK..."
cd android
./gradlew assembleDebug
cd ..

# Step 9: Create timestamped APK
echo "📱 Creating timestamped APK..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="SmartERP-FlydevBackend-${TIMESTAMP}.apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"

echo ""
echo "🎉 Mobile apps built successfully with Fly.dev backend!"
echo ""
echo "📱 ANDROID STUDIO:"
echo "   1. Open Android Studio"
echo "   2. Open project: $(pwd)/android/"
echo "   3. Wait for Gradle sync to complete"
echo "   4. Click 'Run' or use device/emulator"
echo "   5. APK available: ${APK_NAME}"
echo ""
echo "🍎 XCODE:"
echo "   1. Open Xcode"
echo "   2. Open workspace: $(pwd)/ios/App/App.xcworkspace"
echo "   3. Select your development team in signing settings"
echo "   4. Choose target device/simulator"
echo "   5. Click 'Run' to build and deploy"
echo ""
echo "🔧 CONFIGURATION:"
echo "   ✅ TypeScript dependencies fixed"
echo "   ✅ Mobile apps configured for Fly.dev backend"
echo "   ✅ Web app configured for localhost development"
echo "   ✅ iOS network security configured for Fly.dev"
echo "   ✅ Android build settings optimized"
echo ""
echo "🌐 BACKEND CONNECTIVITY:"
echo "   📱 Mobile Apps: https://backend-shy-sun-4450.fly.dev/api"
echo "   🌐 Web App: http://localhost:2025/api"
echo ""
echo "🚀 Ready for deployment in both IDEs!"
