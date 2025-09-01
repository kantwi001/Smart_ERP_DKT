#!/bin/bash

echo "🔧 Fixing Desktop Interface - Ensuring Sidebar Shows on Port 3000"

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Stop any running frontend processes
echo "📱 Stopping any running frontend processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true

# Ensure .env.web is the active environment file for desktop
echo "🌐 Setting up desktop environment..."
cp .env.web .env

# Verify the environment configuration
echo "✅ Current .env configuration:"
cat .env

# Clear any cached builds that might interfere
echo "🧹 Clearing build cache..."
rm -rf build/
rm -rf node_modules/.cache/

# Install dependencies if needed
echo "📦 Ensuring dependencies are installed..."
npm install

# Start the frontend in desktop mode on port 3000
echo "🚀 Starting desktop interface on port 3000..."
echo "   - Should show SIDEBAR navigation (not mobile cards)"
echo "   - Environment: REACT_APP_MOBILE_MODE=false"
echo "   - Port: 3000"
echo ""
echo "🔍 If you still see mobile cards instead of sidebar:"
echo "   1. Hard refresh browser (Cmd+Shift+R)"
echo "   2. Clear browser cache"
echo "   3. Check browser console for mobile mode detection logs"
echo ""

# Start with explicit environment
REACT_APP_MOBILE_MODE=false PORT=3000 npm start
