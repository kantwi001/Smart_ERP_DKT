#!/bin/bash

echo "🔍 Testing Android Login Connectivity"
echo "===================================="

# Get current network IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "📱 Network IP: $LOCAL_IP"
echo "🌐 Android backend URL: http://$LOCAL_IP:2025"

# Test 1: Check if backend is accessible
echo ""
echo "1️⃣ Testing backend accessibility..."
if curl -s "http://$LOCAL_IP:2025/api/" --connect-timeout 5 > /dev/null; then
    echo "✅ Backend is accessible on network IP"
else
    echo "❌ Backend NOT accessible on network IP"
    echo "🔧 Make sure backend is running with: ./start_backend_with_postgres.sh"
    exit 1
fi

# Test 2: Test authentication endpoint
echo ""
echo "2️⃣ Testing authentication endpoint..."
AUTH_RESPONSE=$(curl -s "http://$LOCAL_IP:2025/api/token/" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"arkucollins","password":"admin123"}' \
  --connect-timeout 10)

echo "Auth response: $AUTH_RESPONSE"

if [[ $AUTH_RESPONSE == *"access"* ]]; then
    echo "✅ Authentication works - login credentials are correct"
    
    # Extract token for further testing
    ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "🔑 Access token received: ${ACCESS_TOKEN:0:50}..."
    
else
    echo "❌ Authentication failed"
    echo "🔧 Possible issues:"
    echo "   - Wrong username/password"
    echo "   - Backend database not properly migrated"
    echo "   - User doesn't exist in PostgreSQL database"
    
    # Check if user exists
    echo ""
    echo "3️⃣ Checking if user exists in database..."
    cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend
    python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
try:
    user = User.objects.get(username='arkucollins')
    print(f'✅ User exists: {user.username} - {user.email}')
    print(f'   Is active: {user.is_active}')
    print(f'   Is superuser: {user.is_superuser}')
    print(f'   Date joined: {user.date_joined}')
except User.DoesNotExist:
    print('❌ User arkucollins does not exist')
    print('🔧 Creating user...')
    user = User.objects.create_superuser('arkucollins', 'arkucollins@gmail.com', 'admin123')
    print(f'✅ User created: {user.username}')
"
    exit 1
fi

# Test 3: Test protected endpoint
echo ""
echo "3️⃣ Testing protected endpoint with token..."
if [ -n "$ACCESS_TOKEN" ]; then
    PROTECTED_RESPONSE=$(curl -s "http://$LOCAL_IP:2025/api/users/me/" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      --connect-timeout 10)
    
    if [[ $PROTECTED_RESPONSE == *"username"* ]]; then
        echo "✅ Protected endpoint works with token"
        echo "User data: $PROTECTED_RESPONSE"
    else
        echo "❌ Protected endpoint failed"
        echo "Response: $PROTECTED_RESPONSE"
    fi
fi

# Test 4: Check current API configuration
echo ""
echo "4️⃣ Checking current API configuration..."
API_CONFIG=$(grep -A 3 -B 3 "192.168.2.185\|$LOCAL_IP" /Users/kwadwoantwi/CascadeProjects/erp-system/frontend/src/api.js)
echo "Current API config:"
echo "$API_CONFIG"

if [[ $API_CONFIG == *"$LOCAL_IP"* ]]; then
    echo "✅ API configuration uses current network IP"
else
    echo "❌ API configuration may be outdated"
    echo "🔧 Run: ./rebuild_android_with_network.sh"
fi

echo ""
echo "🎯 Summary:"
echo "   - Backend URL: http://$LOCAL_IP:2025"
echo "   - Login credentials: arkucollins / admin123"
echo "   - Make sure Android device is on same WiFi network"
echo "   - If still failing, rebuild APK with: ./rebuild_android_with_network.sh"
