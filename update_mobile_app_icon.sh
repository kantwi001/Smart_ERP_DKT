#!/bin/bash

echo "🎨 Updating Mobile App Icon with Smart ERP Logo"
echo "=============================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Create icons directory if it doesn't exist
mkdir -p icons

echo "1️⃣ Creating icon assets from the Smart ERP logo..."

# Note: The user needs to save the Smart ERP logo image to icons/smart_erp_logo.png
# For now, we'll create placeholder instructions

if [ ! -f "icons/smart_erp_logo.png" ]; then
    echo "📋 MANUAL STEP REQUIRED:"
    echo "   Please save the Smart ERP Software logo as: icons/smart_erp_logo.png"
    echo "   Then run this script again."
    echo ""
    echo "   The logo should be:"
    echo "   - High resolution (at least 1024x1024 pixels)"
    echo "   - PNG format with transparent background"
    echo "   - Square aspect ratio"
    exit 1
fi

echo "2️⃣ Generating Android icon assets..."

# Create Android icon directories
mkdir -p frontend/android/app/src/main/res/mipmap-mdpi
mkdir -p frontend/android/app/src/main/res/mipmap-hdpi  
mkdir -p frontend/android/app/src/main/res/mipmap-xhdpi
mkdir -p frontend/android/app/src/main/res/mipmap-xxhdpi
mkdir -p frontend/android/app/src/main/res/mipmap-xxxhdpi

# Generate different sizes for Android (using sips on macOS)
echo "   📱 Generating Android icons..."
sips -z 48 48 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher.png
sips -z 72 72 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher.png
sips -z 96 96 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
sips -z 144 144 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
sips -z 192 192 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Create round icons
sips -z 48 48 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
sips -z 72 72 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
sips -z 96 96 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png
sips -z 144 144 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
sips -z 192 192 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png

# Create foreground icons
sips -z 48 48 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png
sips -z 72 72 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png
sips -z 96 96 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png
sips -z 144 144 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png
sips -z 192 192 icons/smart_erp_logo.png --out frontend/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png

echo "3️⃣ Generating iOS icon assets..."

# Create iOS icon directories
mkdir -p frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset

# Generate iOS icons (various sizes required)
sips -z 20 20 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@1x.png
sips -z 40 40 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@2x.png
sips -z 60 60 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@3x.png
sips -z 29 29 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@1x.png
sips -z 58 58 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@2x.png
sips -z 87 87 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@3x.png
sips -z 40 40 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@1x.png
sips -z 80 80 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@2x.png
sips -z 120 120 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@3x.png
sips -z 120 120 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@2x.png
sips -z 180 180 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@3x.png
sips -z 76 76 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@1x.png
sips -z 152 152 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@2x.png
sips -z 167 167 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-83.5x83.5@2x.png
sips -z 1024 1024 icons/smart_erp_logo.png --out frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png

echo "4️⃣ Updating web favicon..."
sips -z 32 32 icons/smart_erp_logo.png --out frontend/public/favicon.ico

echo "5️⃣ Cleaning and rebuilding mobile app..."

# Navigate to frontend directory
cd frontend

# Clean previous builds
echo "   🧹 Cleaning previous builds..."
rm -rf android/app/build
rm -rf ios/App/build

# Build React app
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor
echo "   🔄 Syncing with Capacitor..."
npx cap sync

# Copy assets
echo "   📁 Copying assets..."
npx cap copy

echo "6️⃣ Building Android APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Copy APK to root with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="SmartERP-NewLogo-${TIMESTAMP}.apk"
    cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"
    echo "✅ Android APK built successfully: ${APK_NAME}"
else
    echo "❌ Android build failed"
fi

cd ..

echo ""
echo "🎉 Mobile app icon update completed!"
echo "📱 New APK available with Smart ERP logo"
echo "🍎 iOS project ready for Xcode build"
echo ""
echo "📋 Next steps:"
echo "   • Test the new APK on Android device"
echo "   • Open frontend/ios/App/App.xcworkspace in Xcode to build iOS app"
echo "   • Verify the new logo appears correctly on both platforms"
