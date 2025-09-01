#!/bin/bash

echo "🔧 Fixing Mobile API Configuration"
echo "=================================="

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "🌐 Using IP: $LOCAL_IP"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Build React app with network configuration
echo "🔨 Building React app..."
npm run build

# Sync to Capacitor platforms
echo "📱 Syncing to iOS..."
npx cap sync ios

echo "🤖 Syncing to Android..."
npx cap sync android

echo "✅ Mobile API configuration updated!"
echo "📱 iOS: Open Xcode and run the app"
echo "🤖 Android: Open Android Studio and run the app"
echo "🌐 Backend should be running on: http://$LOCAL_IP:2025"
