#!/bin/bash

echo "🔍 Testing Mobile Backend Connectivity"
echo "====================================="

LOCAL_IP=192.168.2.185

echo "🌐 Testing backend connectivity..."
echo "Local IP: $LOCAL_IP"
echo "Backend URL: http://$LOCAL_IP:2025"
echo ""

# Test if backend is accessible
if curl -s http://$LOCAL_IP:2025/admin/ > /dev/null; then
    echo "✅ Backend is accessible at http://$LOCAL_IP:2025"
else
    echo "❌ Backend not accessible at http://$LOCAL_IP:2025"
    echo ""
    echo "📋 Troubleshooting:"
    echo "1. Make sure backend is running: ./start_backend_network.sh"
    echo "2. Check firewall settings"
    echo "3. Verify your device is on the same network"
fi

echo ""
echo "📱 Mobile App Configuration:"
echo "API URL: http://$LOCAL_IP:2025"
echo ""
echo "🔧 If connectivity fails:"
echo "1. Ensure backend runs on 0.0.0.0:2025 (not localhost:2025)"
echo "2. Mobile device must be on same WiFi network"
echo "3. Check firewall allows connections to port 2025"
