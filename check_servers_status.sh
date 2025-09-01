#!/bin/bash

echo "🔍 Checking ERP System Server Status..."
echo ""

# Check backend server (Django on port 2025)
echo "🔧 Checking Backend Server (Django on port 2025)..."
if curl -s http://localhost:2025/api/users/ > /dev/null 2>&1; then
    echo "✅ Backend server is running and responding"
    echo "📡 Testing API endpoint: http://localhost:2025/api/users/"
    curl -s -I http://localhost:2025/api/users/ | head -1
else
    echo "❌ Backend server is NOT responding"
    echo "🔍 Checking if Django process is running..."
    if pgrep -f "python manage.py runserver" > /dev/null; then
        echo "⚠️  Django process found but not responding on port 2025"
        echo "🔧 Process details:"
        ps aux | grep "python manage.py runserver" | grep -v grep
    else
        echo "❌ No Django process found"
    fi
fi

echo ""

# Check frontend server (React on port 2026)
echo "🔧 Checking Frontend Server (React on port 2026)..."
if curl -s http://localhost:2026 > /dev/null 2>&1; then
    echo "✅ Frontend server is running and responding"
else
    echo "❌ Frontend server is NOT responding"
    echo "🔍 Checking if React process is running..."
    if pgrep -f "react-scripts start\|npm start" > /dev/null; then
        echo "⚠️  React process found but not responding on port 2026"
        echo "🔧 Process details:"
        ps aux | grep -E "react-scripts start|npm start" | grep -v grep
    else
        echo "❌ No React process found"
    fi
fi

echo ""

# Check port usage
echo "🔍 Checking port usage..."
echo "Port 2025 (Backend):"
lsof -i :2025 || echo "❌ Port 2025 not in use"
echo ""
echo "Port 2026 (Frontend):"
lsof -i :2026 || echo "❌ Port 2026 not in use"

echo ""
echo "🔧 To restart servers, run: ./restart_servers.sh"
