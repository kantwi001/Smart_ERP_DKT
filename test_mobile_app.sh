#!/bin/bash

# ERP System Mobile App Testing Script
# Tests the mobile app using browser-based mobile simulation

echo "📱 Testing ERP System Mobile App..."
echo "================================="

# Navigate to frontend directory
cd frontend

echo "🔧 Step 1: Installing mobile testing dependencies..."
npm install --save-dev @capacitor/cli

echo "📱 Step 2: Starting mobile app in browser simulation..."
echo "This will open the app in a mobile-responsive browser view for testing"

# Start the development server with mobile viewport
echo "🌐 Starting development server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "📱 Step 3: Mobile App Testing Instructions:"
echo "=========================================="
echo ""
echo "✅ The ERP mobile app is now ready for testing!"
echo ""
echo "🧪 Testing Options:"
echo ""
echo "1. 📱 Browser Mobile Simulation:"
echo "   - Open: http://localhost:3000"
echo "   - Press F12 (Developer Tools)"
echo "   - Click device toolbar icon (📱)"
echo "   - Select 'iPhone 12 Pro' or 'Pixel 5'"
echo "   - Test all ERP modules in mobile view"
echo ""
echo "2. 🤖 Android Studio Emulator:"
echo "   - Open Android Studio"
echo "   - Tools > AVD Manager"
echo "   - Create/Start Android emulator"
echo "   - Open browser in emulator"
echo "   - Navigate to: http://10.0.2.2:3000"
echo ""
echo "3. 📲 Physical Device Testing:"
echo "   - Connect device to same WiFi"
echo "   - Find your computer's IP address"
echo "   - Open browser on device"
echo "   - Navigate to: http://[YOUR_IP]:3000"
echo ""
echo "🔍 What to Test:"
echo "- ✅ Touch-friendly navigation"
echo "- ✅ Responsive dashboard layouts"
echo "- ✅ Mobile-optimized forms"
echo "- ✅ Inventory management on mobile"
echo "- ✅ Sales order creation"
echo "- ✅ HR module functionality"
echo "- ✅ Warehouse operations"
echo "- ✅ POS system touch interface"
echo ""
echo "📊 Mobile Features to Verify:"
echo "- ✅ Sidebar collapses properly"
echo "- ✅ Cards stack vertically"
echo "- ✅ Buttons are touch-friendly (48px+)"
echo "- ✅ Forms work with mobile keyboards"
echo "- ✅ Tables scroll horizontally"
echo "- ✅ Dialogs fit mobile screens"
echo ""
echo "🛑 To stop testing: Press Ctrl+C"
echo ""

# Keep the server running
wait $SERVER_PID
