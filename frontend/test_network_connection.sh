#!/bin/bash

echo "🔍 Testing Network Connection"
echo "============================="

LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📡 Local IP: $LOCAL_IP"
echo "🔗 Testing backend connection..."

# Test if backend is running
if curl -s "http://$LOCAL_IP:2025/api/" >/dev/null 2>&1; then
    echo "✅ Backend is accessible on network IP"
else
    echo "❌ Backend not accessible on network IP"
    echo "   Make sure to run: ./start_backend_network.sh"
fi

# Test localhost
if curl -s "http://localhost:2025/api/" >/dev/null 2>&1; then
    echo "✅ Backend is accessible on localhost"
else
    echo "❌ Backend not accessible on localhost"
fi

echo ""
echo "📱 For iOS app to work:"
echo "   1. Start backend: ./start_backend_network.sh"
echo "   2. Ensure iOS simulator/device is on same network"
echo "   3. Backend must be accessible at: http://$LOCAL_IP:2025"
