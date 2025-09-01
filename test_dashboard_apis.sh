#!/bin/bash

echo "🔍 Testing Executive Dashboard API Endpoints"
echo "============================================="

# Check if backend is running
echo "📋 Checking backend processes on port 2025:"
lsof -i :2025

echo ""
echo "🌐 Testing API endpoints..."

# Test base API
echo "1. Testing base API connection:"
curl -s "http://localhost:2025/api/" --connect-timeout 5 && echo "✅ Base API accessible" || echo "❌ Base API not accessible"

echo ""
echo "2. Testing authentication endpoint:"
curl -s "http://localhost:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 && echo "✅ Auth endpoint works" || echo "❌ Auth endpoint failed"

echo ""
echo "3. Testing reporting endpoints:"

# Get auth token first
TOKEN=$(curl -s "http://localhost:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 5 | grep -o '"access":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "✅ Got auth token"
  
  echo "Testing /reporting/revenue/:"
  curl -s "http://localhost:2025/api/reporting/revenue/" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 && echo "✅ Revenue API works" || echo "❌ Revenue API failed"
  
  echo ""
  echo "Testing /reporting/transactions-per-staff/:"
  curl -s "http://localhost:2025/api/reporting/transactions-per-staff/" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 && echo "✅ Transactions API works" || echo "❌ Transactions API failed"
  
  echo ""
  echo "Testing /warehouse/stats/:"
  curl -s "http://localhost:2025/api/warehouse/stats/" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 && echo "✅ Warehouse stats API works" || echo "❌ Warehouse stats API failed"
  
  echo ""
  echo "Testing /hr/employees/:"
  curl -s "http://localhost:2025/api/hr/employees/" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 && echo "✅ HR employees API works" || echo "❌ HR employees API failed"
  
  echo ""
  echo "Testing /hr/departments/:"
  curl -s "http://localhost:2025/api/hr/departments/" \
    -H "Authorization: Bearer $TOKEN" \
    --connect-timeout 5 && echo "✅ HR departments API works" || echo "❌ HR departments API failed"
    
else
  echo "❌ Could not get auth token - backend may not be running or credentials incorrect"
fi

echo ""
echo "🔧 Quick fixes if backend is not running:"
echo "1. Start backend: ./start_backend_localhost.sh"
echo "2. Check Django server: cd backend && python manage.py runserver localhost:2025"
echo "3. Check virtual environment: source backend/venv/bin/activate"
