#!/bin/bash

# Diagnose Webapp Connection Issues
echo "🔍 Diagnosing Webapp Connection Issues..."
echo "========================================"

echo ""
echo "1. 🌐 Checking Backend Server Status..."
echo "----------------------------------------"

# Check if backend is running on localhost:2025
if curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "✅ Backend server is running on localhost:2025"
    curl -s http://localhost:2025/api/ | head -5
else
    echo "❌ Backend server is NOT running on localhost:2025"
    echo "💡 Start backend with: ./start_backend.sh"
fi

echo ""
echo "2. 🔧 Checking API Configuration..."
echo "-----------------------------------"

# Check current API configuration
echo "📋 Current API Base URL Configuration:"
echo "   - Web app: http://localhost:2025 (from api.js)"
echo "   - Mobile app: http://192.168.2.185:2025 (from api.js)"

# Check if API calls are disabled
if grep -q "DISABLE_API_CALLS = true" /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/src/api.js; then
    echo "⚠️ API calls are DISABLED in api.js"
    echo "💡 Set DISABLE_API_CALLS = false to enable API calls"
else
    echo "✅ API calls are enabled in api.js"
fi

echo ""
echo "3. 🔗 Testing Network Connectivity..."
echo "------------------------------------"

# Test localhost connection
echo "🧪 Testing localhost:2025..."
if curl -s --connect-timeout 5 http://localhost:2025 > /dev/null 2>&1; then
    echo "✅ localhost:2025 is reachable"
else
    echo "❌ localhost:2025 is NOT reachable"
fi

# Test network IP connection
echo "🧪 Testing 192.168.2.185:2025..."
if curl -s --connect-timeout 5 http://192.168.2.185:2025 > /dev/null 2>&1; then
    echo "✅ 192.168.2.185:2025 is reachable"
else
    echo "❌ 192.168.2.185:2025 is NOT reachable"
fi

echo ""
echo "4. 🚀 Checking Running Processes..."
echo "----------------------------------"

# Check for Django processes
DJANGO_PROCESSES=$(ps aux | grep "manage.py runserver" | grep -v grep | wc -l)
if [ $DJANGO_PROCESSES -gt 0 ]; then
    echo "✅ Django server processes found: $DJANGO_PROCESSES"
    ps aux | grep "manage.py runserver" | grep -v grep
else
    echo "❌ No Django server processes found"
fi

# Check for React processes
REACT_PROCESSES=$(ps aux | grep "react-scripts" | grep -v grep | wc -l)
if [ $REACT_PROCESSES -gt 0 ]; then
    echo "✅ React development server processes found: $REACT_PROCESSES"
else
    echo "❌ No React development server processes found"
fi

echo ""
echo "5. 🔧 Quick Fix Recommendations..."
echo "---------------------------------"

if [ $DJANGO_PROCESSES -eq 0 ]; then
    echo "🚀 Start backend server:"
    echo "   ./start_backend.sh"
fi

if [ $REACT_PROCESSES -eq 0 ]; then
    echo "🚀 Start frontend server:"
    echo "   cd frontend && npm start"
fi

echo ""
echo "6. 🧪 Testing API Endpoints..."
echo "-----------------------------"

# Test key API endpoints
echo "🔍 Testing /api/ endpoint..."
curl -s -w "Status: %{http_code}\n" http://localhost:2025/api/ 2>/dev/null || echo "❌ Failed to connect"

echo "🔍 Testing /api/users/ endpoint..."
curl -s -w "Status: %{http_code}\n" http://localhost:2025/api/users/ 2>/dev/null || echo "❌ Failed to connect"

echo ""
echo "🎯 Summary & Next Steps:"
echo "========================"
echo "If backend is not running: ./start_backend.sh"
echo "If frontend is not running: cd frontend && npm start"
echo "Check browser console for specific error messages"
echo "Verify no firewall is blocking localhost:2025"
