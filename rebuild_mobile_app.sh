#!/bin/bash

# ERP System Mobile App Rebuild Script
# This script rebuilds and redeploys the mobile app with latest UI changes

echo "🚀 Starting ERP Mobile App Rebuild Process..."
echo "=================================================="

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

echo "📁 Current directory: $(pwd)"

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf node_modules/.cache/
npm run build:clean 2>/dev/null || echo "No build:clean script found, continuing..."

# Step 2: Install/update dependencies
echo "📦 Installing/updating dependencies..."
npm install

# Step 3: Build the React app with latest changes
echo "🔨 Building React app with latest login UI changes..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed! Please check for errors above."
    exit 1
fi

echo "✅ React build completed successfully!"

# Step 4: Sync with Capacitor (copy web assets to native projects)
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Step 5: Copy updated assets to Android project
echo "📱 Copying updated assets to Android project..."
npx cap copy android

# Step 6: Update Android project with latest changes
echo "🔧 Updating Android project..."
npx cap update android

# Step 7: Open Android Studio (optional - user can do this manually)
echo "📲 Opening Android Studio..."
echo "Note: Android Studio will open. Please rebuild and run the app in the emulator."
npx cap open android &

echo ""
echo "🎉 Mobile app rebuild process completed!"
echo "=================================================="
echo ""
echo "📋 Next Steps:"
echo "1. Android Studio should now be opening"
echo "2. In Android Studio:"
echo "   - Wait for Gradle sync to complete"
echo "   - Click 'Build' → 'Clean Project'"
echo "   - Click 'Build' → 'Rebuild Project'"
echo "   - Click the 'Run' button to deploy to emulator"
echo "3. The emulator should now display the new clean login interface"
echo ""
echo "🔍 If you still see the old interface:"
echo "   - Clear app data in emulator settings"
echo "   - Uninstall and reinstall the app"
echo "   - Restart the emulator"
echo ""
echo "✨ Your new clean login interface should now be visible!"
