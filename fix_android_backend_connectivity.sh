#!/bin/bash

echo "🔧 Fixing Android App Backend Connectivity"
echo "=========================================="

# Get current network IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "📱 Current network IP: $LOCAL_IP"
echo "📱 Android will connect to: http://$LOCAL_IP:2025"

# Step 1: Update API configuration with current IP
echo ""
echo "1️⃣ Updating API configuration..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/src

# Backup original api.js
cp api.js api.js.backup

# Update the hardcoded IP with current network IP
sed -i '' "s/192\.168\.2\.185/$LOCAL_IP/g" api.js

echo "✅ Updated api.js with current IP: $LOCAL_IP"

# Step 2: Kill any existing backend processes
echo ""
echo "2️⃣ Stopping existing backend processes..."
lsof -ti:2025 | xargs kill -9 2>/dev/null || true
echo "✅ Cleared port 2025"

# Step 3: Start backend on network interface
echo ""
echo "3️⃣ Starting backend server for Android connectivity..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -f "requirements_installed.flag" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    touch requirements_installed.flag
fi

echo "🚀 Starting Django server on 0.0.0.0:2025 for network access..."
echo "📱 Android devices can now connect to: http://$LOCAL_IP:2025"
echo ""
echo "🔧 To test Android connectivity:"
echo "   1. Ensure Android device is on same WiFi network"
echo "   2. Open Android app and try to login"
echo "   3. Backend should be accessible at http://$LOCAL_IP:2025"
echo ""

# Start the server
python manage.py runserver 0.0.0.0:2025
