#!/bin/bash

echo "📱 Mobile App Network Configuration Check"
echo "========================================"

echo "🔍 Current API Configuration:"
echo "iOS Simulator: localhost:2025"
echo "Android: 192.168.2.185:2025"
echo "Web: localhost:2025"

echo ""
echo "🌐 Testing Backend Endpoints:"

# Test localhost for iOS
echo "📱 iOS Simulator endpoint (localhost:2025):"
curl -s "http://localhost:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 > /dev/null && echo "✅ localhost:2025 accessible" || echo "❌ localhost:2025 not accessible"

# Test network IP for Android
echo "🤖 Android endpoint (192.168.2.185:2025):"
curl -s "http://192.168.2.185:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 > /dev/null && echo "✅ 192.168.2.185:2025 accessible" || echo "❌ 192.168.2.185:2025 not accessible"

echo ""
echo "📋 Current Backend Processes:"
lsof -i :2025

echo ""
echo "🔧 Capacitor Configuration:"
echo "Allowed navigation hosts:"
cat /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/capacitor.config.json | grep -A 5 "allowNavigation"

echo ""
echo "💡 Summary:"
echo "- iOS uses localhost (for simulator compatibility)"
echo "- Android uses network IP (for device/emulator access)"
echo "- Both endpoints are configured in Capacitor allowNavigation"
