#!/bin/bash
echo "🚀 Building mobile apps with warehouse transfer updates..."

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Install dependencies if needed
echo "1. Installing dependencies..."
npm install

# Build the React app
echo "2. Building React app..."
npm run build

# Sync with Capacitor
echo "3. Syncing with Capacitor..."
npx cap sync

# Build iOS app
echo "4. Building iOS app..."
npx cap build ios

# Build Android app
echo "5. Building Android app..."
npx cap build android

# Copy built files
echo "6. Copying built files..."
cp -r build/* ../build/

echo "✅ Mobile apps built successfully!"
echo "📱 iOS app: ios/App/App.xcworkspace"
echo "🤖 Android app: android/app/build/outputs/apk/"
echo ""
echo "To run on devices:"
echo "iOS: npx cap run ios"
echo "Android: npx cap run android"
