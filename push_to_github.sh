#!/bin/bash

echo "🚀 Pushing ERP System Updates to GitHub..."
echo "=========================================="

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Check git status
echo "📋 Checking current git status..."
git status

# Step 2: Add all changes
echo "📦 Adding all changes..."
git add .

# Step 3: Create comprehensive commit message
echo "💬 Creating commit..."
git commit -m "🚀 Mobile App Integration with Warehouse Management

✨ Features Added:
- Connected mobile apps to erp.tarinnovation.com backend
- Full warehouse transfer functionality (create, approve, track)
- iOS and Android build fixes with proper schemes
- Offline sync capabilities with automatic data synchronization
- Comprehensive build scripts for mobile deployment

🔧 Technical Updates:
- Updated mobile_app_config.js with production backend URL
- Fixed iOS Xcode scheme configuration (App.xcscheme)
- Resolved Android Java Runtime and Gradle issues
- Added warehouse transfer endpoints and storage keys
- Updated Capacitor configuration for cross-platform builds

📱 Mobile Apps:
- iOS: frontend/ios/App/App.xcworkspace ready for Xcode
- Android: APK generation with smart-erp-backend-connected.apk
- Both platforms include full ERP functionality with warehouse management

🛠️ Build Scripts:
- build_mobile_with_backend.sh - Comprehensive mobile build
- fix_ios_build.sh - iOS specific fixes
- fix_android_build.sh - Android specific fixes
- rebuild_mobile_apps.sh - Complete rebuild from scratch

🗄️ Database:
- PostgreSQL database: erp_system
- Warehouse transfer models and migrations included
- Backend API endpoints for mobile synchronization

Ready for production deployment with full warehouse management capabilities."

# Step 4: Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Summary of pushed updates:"
    echo "   🏗️ Mobile app builds with backend connection"
    echo "   📱 iOS and Android projects ready for deployment"
    echo "   🏪 Complete warehouse transfer functionality"
    echo "   🔧 Build fix scripts for development team"
    echo "   📊 Database schema with PostgreSQL (erp_system)"
    echo ""
    echo "🌐 Repository updated with production-ready mobile apps!"
else
    echo "❌ Failed to push to GitHub. Please check your git configuration."
    echo "🔧 Try running: git remote -v to check your remote repository"
fi
