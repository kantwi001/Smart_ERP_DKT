#!/bin/bash

echo "🔍 Diagnosing Android App Backend Connectivity"
echo "=============================================="

# Get current network IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
echo "📱 Current network IP: $LOCAL_IP"
echo "📱 Expected Android backend URL: http://$LOCAL_IP:2025"

echo ""
echo "🔧 Checking backend server status..."

# Check if backend is running on localhost
echo "1. Testing localhost:2025..."
if curl -s "http://localhost:2025/api/" --connect-timeout 3 > /dev/null; then
    echo "✅ Backend running on localhost:2025"
else
    echo "❌ Backend NOT running on localhost:2025"
fi

# Check if backend is running on network IP
echo ""
echo "2. Testing network IP ($LOCAL_IP:2025)..."
if curl -s "http://$LOCAL_IP:2025/api/" --connect-timeout 3 > /dev/null; then
    echo "✅ Backend accessible on network IP $LOCAL_IP:2025"
else
    echo "❌ Backend NOT accessible on network IP $LOCAL_IP:2025"
fi

echo ""
echo "🔍 Testing Android-specific endpoints..."

# Test auth endpoint for Android
echo "3. Testing authentication endpoint..."
AUTH_RESPONSE=$(curl -s "http://$LOCAL_IP:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5)

if [ $? -eq 0 ] && [[ $AUTH_RESPONSE == *"access"* ]]; then
    echo "✅ Authentication endpoint works for Android"
    echo "Response: $AUTH_RESPONSE"
else
    echo "❌ Authentication endpoint failed for Android"
    echo "Response: $AUTH_RESPONSE"
fi

echo ""
echo "📋 Current API configuration in frontend/src/api.js:"
grep -A 5 -B 5 "192.168.2.185" /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/src/api.js || echo "No hardcoded IP found"

echo ""
echo "🔧 Recommended fixes:"
echo "1. Start backend on network IP: ./start_backend_network.sh"
echo "2. Update API config with current IP: $LOCAL_IP"
echo "3. Rebuild Android APK with correct network settings"
echo "4. Test on Android device/emulator"

echo ""
echo "📱 To fix Android connectivity:"
echo "   - Backend must run on 0.0.0.0:2025 (accessible from network)"
echo "   - Android app should use $LOCAL_IP:2025"
echo "   - Ensure firewall allows connections on port 2025"
