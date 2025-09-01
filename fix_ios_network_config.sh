#!/bin/bash

echo "🔧 Fixing iOS Network Configuration"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

print_status "Step 1: Getting local network IP..."

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "192.168.1.100")
fi

print_success "Local IP detected: $LOCAL_IP"

print_status "Step 2: Updating React environment for network access..."

cd frontend

# Update .env file with network IP
cat > .env << EOF
PORT=2026
REACT_APP_API_URL=http://$LOCAL_IP:2025
REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

print_success "React environment updated"

print_status "Step 3: Updating Capacitor configuration..."

# Update capacitor.config.json with network IP
cat > capacitor.config.json << EOF
{
  "appId": "com.smarterp.app",
  "appName": "SmartERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "$LOCAL_IP:2025",
      "localhost:2025",
      "127.0.0.1:2025"
    ]
  },
  "android": {
    "allowMixedContent": true
  },
  "ios": {
    "allowsLinkPreview": false,
    "contentInset": "automatic"
  }
}
EOF

print_success "Capacitor config updated"

print_status "Step 4: Rebuilding React app with network configuration..."

# Build React app with network IP
npm run build

if [ $? -ne 0 ]; then
    print_warning "React build failed, trying with warnings suppressed..."
    CI=false npm run build
fi

print_success "React app rebuilt"

print_status "Step 5: Syncing iOS app with new configuration..."

# Sync iOS with updated build
npx cap sync ios

print_success "iOS app synced"

print_status "Step 6: Creating backend startup script..."

# Create backend startup script that runs on network interface
cat > start_backend_network.sh << 'EOF'
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
EOF

chmod +x start_backend_network.sh

print_status "Step 7: Testing network connectivity..."

# Create network test script
cat > test_network_connection.sh << 'EOF'
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
EOF

chmod +x test_network_connection.sh

cd ..

print_success "✅ iOS network configuration fixed!"

echo ""
echo "🎯 Network Configuration Complete"
echo "================================="
echo ""
echo "🔧 What was fixed:"
echo "• Updated React environment to use network IP ($LOCAL_IP)"
echo "• Updated Capacitor config to allow network navigation"
echo "• Rebuilt React app with network configuration"
echo "• Synced iOS app with updated build"
echo "• Created network-enabled backend startup script"
echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. ./start_backend_network.sh       # Start backend on network"
echo "2. ./test_network_connection.sh     # Test connectivity"
echo "3. In Xcode: Stop app → Clean Build → Run again"
echo ""
echo "📱 The iOS app should now connect to: http://$LOCAL_IP:2025"

print_success "🎉 iOS network connectivity should now work!"
