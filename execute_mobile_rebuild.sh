#!/bin/bash

echo "🚀 REBUILDING AND UPDATING MOBILE APPS"
echo "====================================="

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Make the update script executable
chmod +x update_mobile_backend_to_flydev.sh

# Execute the mobile backend update script
echo "📱 Executing mobile backend update..."
./update_mobile_backend_to_flydev.sh

echo ""
echo "✅ Mobile app rebuild completed!"
echo "📱 Check for new APK file: SmartERP-FlydevBackend-*.apk"
echo "🍎 iOS project ready for Xcode build"
