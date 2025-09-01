#!/bin/bash

echo "🔍 Checking Backend Status"
echo "=========================="

echo "📋 Processes on port 2025:"
lsof -i :2025

echo ""
echo "🌐 Testing localhost:2025..."
curl -s "http://localhost:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 && echo "✅ localhost:2025 works" || echo "❌ localhost:2025 not accessible"

echo ""
echo "🌐 Testing 192.168.2.185:2025..."
curl -s "http://192.168.2.185:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 && echo "✅ 192.168.2.185:2025 works" || echo "❌ 192.168.2.185:2025 not accessible"
