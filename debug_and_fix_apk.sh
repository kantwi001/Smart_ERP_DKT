#!/bin/bash

echo "🔧 Debugging and Fixing APK Errors"
echo "=================================="

# Set error handling
set -e

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

echo "🔍 Step 1: Analyzing current APK issues..."
cd frontend

# Check current Capacitor configuration
echo "📋 Current Capacitor Config:"
if [ -f "capacitor.config.ts" ]; then
    head -20 capacitor.config.ts
else
    echo "❌ capacitor.config.ts not found"
fi

echo ""
echo "🔧 Step 2: Fixing Capacitor configuration for mobile compatibility..."

# Create optimized capacitor.config.ts
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
      'https://erp.tarinnovation.com',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000',
      'https://localhost:3000',
      'https://127.0.0.1:3000'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
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
      style: 'LIGHT'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  ios: {
    scheme: 'SmartERPSoftware',
    contentInset: 'automatic'
  }
};

export default config;
EOF

echo "✅ Capacitor config updated with debugging enabled"

echo "🔧 Step 3: Creating mobile-optimized index.html..."
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
    <meta name="theme-color" content="#1976d2" />
    <meta name="description" content="SmartERPSoftware - Enterprise Resource Planning" />
    
    <!-- Mobile App Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="SmartERPSoftware" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    
    <!-- Security and Performance -->
    <meta http-equiv="Content-Security-Policy" content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content:">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    
    <title>SmartERPSoftware</title>
    
    <style>
      /* Critical CSS for loading */
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background-color: #1976d2;
        overflow-x: hidden;
      }
      
      #root {
        height: 100vh;
        width: 100vw;
        display: flex;
        flex-direction: column;
      }
      
      /* Enhanced loading screen */
      .app-loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 9999;
        font-size: 18px;
      }
      
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px solid rgba(255,255,255,0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-text {
        margin-top: 10px;
        font-weight: 500;
      }
      
      /* Hide loading when app loads */
      .app-loaded .app-loading {
        display: none;
      }
    </style>
  </head>
  <body>
    <noscript>
      <div style="text-align: center; padding: 50px; color: #1976d2;">
        <h2>JavaScript Required</h2>
        <p>Please enable JavaScript to run SmartERPSoftware.</p>
      </div>
    </noscript>
    
    <div id="root">
      <div class="app-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">Loading SmartERPSoftware...</div>
        <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Please wait</div>
      </div>
    </div>
    
    <script>
      // Remove loading screen when React app loads
      window.addEventListener('load', function() {
        setTimeout(function() {
          document.body.classList.add('app-loaded');
        }, 1000);
      });
      
      // Debug logging for mobile
      window.addEventListener('error', function(e) {
        console.error('App Error:', e.error);
      });
      
      // Capacitor ready handler
      document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
      });
    </script>
  </body>
</html>
EOF

echo "✅ Mobile-optimized index.html created"

echo "🔧 Step 4: Updating package.json for mobile build..."
# Add mobile-specific build script
npm pkg set scripts.build:mobile="GENERATE_SOURCEMAP=false INLINE_RUNTIME_CHUNK=false npm run build"

echo "🏗️ Step 5: Building optimized React app for mobile..."
GENERATE_SOURCEMAP=false INLINE_RUNTIME_CHUNK=false npm run build

echo "📱 Step 6: Syncing Capacitor with debug mode..."
npx cap sync android --verbose

echo "🔧 Step 7: Updating Android manifest for debugging..."
cd android

# Update AndroidManifest.xml for debugging
cat > app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:debuggable="true"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:windowSoftInputMode="adjustResize">

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="@string/custom_url_scheme" />
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
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

</manifest>
EOF

echo "✅ Android manifest updated for debugging"

echo "🚀 Step 8: Building debug APK with enhanced logging..."
./gradlew clean
./gradlew assembleDebug

echo "🔍 Step 9: Checking build results..."
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp app/build/outputs/apk/debug/app-debug.apk ../../smart-erp-debug-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 DEBUG APK READY!"
    echo "=================="
    echo ""
    echo "📱 APK Location: smart-erp-debug-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../../smart-erp-debug-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Debug Features Enabled:"
    echo "   ✅ Web contents debugging enabled"
    echo "   ✅ Cleartext traffic allowed"
    echo "   ✅ Enhanced error logging"
    echo "   ✅ Improved loading screen"
    echo "   ✅ Mobile-optimized configuration"
    echo ""
    echo "🐛 Debugging Instructions:"
    echo "1. Install APK on Android device"
    echo "2. Connect device to computer via USB"
    echo "3. Enable USB debugging on device"
    echo "4. Open Chrome and go to chrome://inspect"
    echo "5. Find your app and click 'Inspect' to see console logs"
    echo ""
    echo "📋 If still blank screen:"
    echo "• Check console logs in Chrome DevTools"
    echo "• Verify network connectivity to backend"
    echo "• Check if app shows loading spinner first"
    echo ""
    echo "✅ Debug APK ready for testing!"
else
    echo "❌ Debug APK build failed"
    echo "Checking for any APK files..."
    find app/build/outputs/apk -name "*.apk" -type f
fi

cd ..
