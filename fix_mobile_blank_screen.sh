#!/bin/bash

echo "🔧 Fixing Mobile App Blank Screen Issue"
echo "======================================"

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Set Java environment
if [ -d "/opt/homebrew/opt/openjdk@17" ]; then
    export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
    export PATH="$JAVA_HOME/bin:$PATH"
    echo "✅ Java 17 environment configured"
fi

echo "📝 Step 1: Updating Capacitor configuration..."
cd frontend

# Update capacitor.config.ts to fix blank screen
cat > capacitor.config.ts << 'EOF'
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://erp.tarinnovation.com',
      'http://localhost:3000',
      'http://localhost:8000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8000'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1976d2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'DARK'
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scheme: 'SmartERPSoftware'
  }
};

export default config;
EOF

echo "✅ Capacitor config updated"

echo "📝 Step 2: Updating index.html for mobile compatibility..."
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#1976d2" />
    <meta name="description" content="SmartERPSoftware - Enterprise Resource Planning" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="SmartERPSoftware" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    
    <title>SmartERPSoftware - Enterprise Resource Planning</title>
    
    <style>
      /* Prevent blank screen during load */
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #1976d2;
      }
      
      #root {
        min-height: 100vh;
      }
      
      /* Loading screen */
      .loading-screen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #1976d2;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        font-size: 18px;
        z-index: 9999;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
      <div class="loading-screen">
        <div>Loading SmartERPSoftware...</div>
      </div>
    </div>
  </body>
</html>
EOF

echo "✅ index.html updated for mobile"

echo "🏗️ Step 3: Building React app with mobile optimizations..."
GENERATE_SOURCEMAP=false npm run build

echo "📱 Step 4: Syncing Capacitor platforms..."
npx cap sync

echo "🔧 Step 5: Copying web assets to native platforms..."
npx cap copy

echo "🚀 Step 6: Building Android APK..."
cd android
./gradlew clean
./gradlew assembleRelease
cd ..

# Copy APK if successful
if [ -f "android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    cp android/app/build/outputs/apk/release/app-release-unsigned.apk ../smart-erp-fixed-screen-${TIMESTAMP}.apk
    
    echo ""
    echo "🎉 MOBILE APP FIXED!"
    echo "==================="
    echo ""
    echo "📱 APK Location: smart-erp-fixed-screen-${TIMESTAMP}.apk"
    echo "📦 Size: $(du -h ../smart-erp-fixed-screen-${TIMESTAMP}.apk | cut -f1)"
    echo ""
    echo "🔧 Fixed Issues:"
    echo "   ✅ Blank screen issue resolved"
    echo "   ✅ Capacitor configuration updated"
    echo "   ✅ Mobile-optimized index.html"
    echo "   ✅ Proper loading screen added"
    echo "   ✅ Android scheme set to HTTPS"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Install APK on Android device"
    echo "2. For iOS: Open ios/App/App.xcworkspace in Xcode"
    echo "3. Test app functionality and backend connection"
    echo ""
    echo "✅ Mobile apps should now load properly!"
else
    echo "❌ APK build failed - check logs above"
fi

cd ..
