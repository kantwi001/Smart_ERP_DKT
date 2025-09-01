#!/bin/bash

echo "📱 Building Mobile Apps"
echo "======================"

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Build mobile production
cd frontend
cp .env.production .env
echo "Building mobile production version..."
REACT_APP_MOBILE_MODE=true npm run build
cd ..

# Build mobile apps
echo "Syncing Capacitor..."
npx cap sync
npx cap copy

echo ""
echo "Building Android..."
npx cap build android

echo ""
echo "Preparing iOS..."
npx cap sync ios

echo ""
echo "✅ Mobile apps built!"
echo "📱 Android: ./smart-erp-mobile.apk or open android/ in Android Studio"
echo "🍎 iOS: Open ios/App/App.xcworkspace in Xcode"
