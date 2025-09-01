#!/bin/bash

echo "🚀 Starting Backend Server for Network Access"
echo "============================================="

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "🌐 Local IP: $LOCAL_IP"
echo "📱 Mobile apps will connect to: http://$LOCAL_IP:2025"

# Navigate to backend
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Kill existing processes on port 2025
echo "🔧 Killing existing processes on port 2025..."
lsof -ti:2025 | xargs kill -9 2>/dev/null || true

# Start Django server on all interfaces
echo "🚀 Starting Django server on 0.0.0.0:2025..."
python manage.py runserver 0.0.0.0:2025

echo ""
echo "✅ Backend server started!"
echo "🔗 Access URLs:"
echo "   Web: http://localhost:2025"
echo "   Mobile: http://$LOCAL_IP:2025"
