#!/bin/bash

echo "📱 Rebuilding Android APK with Network Connectivity"
echo "=================================================="

# Get current network IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "📱 Network IP: $LOCAL_IP"
echo "📱 Backend URL: http://$LOCAL_IP:2025"

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Step 1: Update API configuration
echo ""
echo "1️⃣ Updating API configuration for Android..."
cd frontend/src

# Backup and update api.js
cp api.js api.js.backup.$(date +%Y%m%d_%H%M%S)
sed -i '' "s/192\.168\.2\.185/$LOCAL_IP/g" api.js

echo "✅ Updated api.js with current network IP"

# Step 2: Build React app
echo ""
echo "2️⃣ Building React app with updated configuration..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Build React app
echo "🔨 Building React app..."
npm run build

echo "✅ React app built successfully"

# Step 3: Sync to Capacitor platforms
echo ""
echo "3️⃣ Syncing to Capacitor platforms..."

# Sync to Android
npx cap sync android

echo "✅ Synced to Android platform"

# Step 4: Build Android APK
echo ""
echo "4️⃣ Building Android APK..."
cd android

# Build APK using Gradle
echo "🔨 Building Android APK with Gradle..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Android APK built successfully!"
    
    # Find and copy the APK
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "/Users/kwadwoantwi/CascadeProjects/erp-system/SmartERP-NetworkFixed-$TIMESTAMP.apk"
        echo "📱 APK copied to: SmartERP-NetworkFixed-$TIMESTAMP.apk"
    fi
else
    echo "❌ Android APK build failed"
    exit 1
fi

echo ""
echo "🎉 Android app rebuilt with network connectivity!"
echo "📱 Backend URL configured: http://$LOCAL_IP:2025"
echo "🔧 Next steps:"
echo "   1. Start backend: ./start_backend_network.sh"
echo "   2. Install APK on Android device"
echo "   3. Ensure device is on same WiFi network"
echo "   4. Test login functionality"
