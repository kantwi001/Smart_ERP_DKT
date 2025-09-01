#!/bin/bash

echo "🔍 Testing Backend Connection"
echo "============================="

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "🌐 Testing connection to: $LOCAL_IP:2025"

# Test if backend is running
echo "📡 Testing basic connectivity..."
curl -v "http://$LOCAL_IP:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 10

echo ""
echo "🔍 Checking if port 2025 is open..."
nc -z "$LOCAL_IP" 2025 && echo "✅ Port 2025 is open" || echo "❌ Port 2025 is not accessible"

echo ""
echo "📋 Backend processes on port 2025:"
lsof -i :2025
