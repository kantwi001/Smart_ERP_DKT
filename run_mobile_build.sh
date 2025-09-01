#!/bin/bash

echo "📱 Running Mobile App Build Process"
echo "==================================="

# Make the build script executable
chmod +x build_mobile_apps_complete.sh

# Run the comprehensive build script
./build_mobile_apps_complete.sh

echo ""
echo "🔍 Checking build results..."

# List any APK files created
echo "APK files in project root:"
ls -la *.apk 2>/dev/null || echo "No APK files found yet"

echo ""
echo "📁 Project structure after build:"
echo "Android: frontend/android/"
echo "iOS: frontend/ios/"

# Check if platforms exist
if [ -d "frontend/android" ]; then
    echo "✅ Android platform ready"
else
    echo "❌ Android platform missing"
fi

if [ -d "frontend/ios" ]; then
    echo "✅ iOS platform ready"
else
    echo "❌ iOS platform missing"
fi

echo ""
echo "🚀 Build process completed. Check output above for any errors."
