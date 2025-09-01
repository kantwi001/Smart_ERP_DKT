#!/bin/bash

echo "🔗 Fixing Mobile App Backend Connectivity"
echo "========================================="

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

print_status "Detecting network configuration..."

# Get local IP address
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$LOCAL_IP" ]; then
    print_error "Could not detect local IP address"
    exit 1
fi

print_success "Detected local IP: $LOCAL_IP"

print_status "Step 1: Updating frontend environment for mobile..."

cd frontend

# Create mobile-specific environment file
cat > .env.mobile << EOF
PORT=2026
REACT_APP_API_URL=http://$LOCAL_IP:2025
REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

# Update main .env file for mobile
cp .env.mobile .env

print_success "Updated frontend environment with local IP: $LOCAL_IP"

print_status "Step 2: Updating Capacitor configuration..."

# Update capacitor.config.json with proper server configuration
cat > capacitor.config.json << EOF
{
  "appId": "com.smarterp.app",
  "appName": "Smart ERP",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "allowNavigation": [
      "$LOCAL_IP:2025",
      "localhost:2025"
    ]
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  },
  "ios": {
    "allowsLinkPreview": false,
    "handleApplicationURL": false
  }
}
EOF

print_success "Updated Capacitor configuration"

print_status "Step 3: Rebuilding React app with network configuration..."

# Build React app with network-aware configuration
REACT_APP_API_URL=http://$LOCAL_IP:2025 REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025 GENERATE_SOURCEMAP=false npm run build

if [ $? -ne 0 ]; then
    print_error "React build failed!"
    exit 1
fi

print_success "React app rebuilt with network configuration"

print_status "Step 4: Syncing mobile apps..."

# Sync both platforms
npx cap sync android
npx cap sync ios

print_success "Mobile apps synced"

cd ..

print_status "Step 5: Creating network-aware backend startup script..."

cat > start_backend_network.sh << EOF
#!/bin/bash

echo "🖥️ Starting Backend Server for Mobile Access"
echo "============================================="

cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
fi

echo "🌐 Backend will be accessible at:"
echo "   Local: http://localhost:2025"
echo "   Network: http://$LOCAL_IP:2025"
echo ""
echo "📱 Mobile apps will connect to: http://$LOCAL_IP:2025"
echo ""

# Start Django server on all interfaces
python manage.py runserver 0.0.0.0:2025
EOF

chmod +x start_backend_network.sh

print_status "Step 6: Creating mobile build script with connectivity fix..."

cat > build_mobile_with_connectivity.sh << 'EOF'
#!/bin/bash

echo "📱 Building Mobile Apps with Backend Connectivity"
echo "================================================"

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "🌐 Using backend URL: http://$LOCAL_IP:2025"

cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Set environment variables for build
export REACT_APP_API_URL=http://$LOCAL_IP:2025
export REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
export REACT_APP_MOBILE_MODE=true

# Build React app
echo "📱 Building React app..."
GENERATE_SOURCEMAP=false npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android
npx cap sync ios

# Build Android APK
echo "🤖 Building Android APK..."
cd android
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

./gradlew assembleDebug

if [ $? -eq 0 ]; then
    APK_PATH=$(find . -name "app-debug.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        cp "$APK_PATH" "../../SmartERP-Connected-${TIMESTAMP}.apk"
        echo "✅ Android APK: SmartERP-Connected-${TIMESTAMP}.apk"
    fi
fi

cd ..

echo ""
echo "🎯 Mobile Apps Ready!"
echo "===================="
echo "Backend URL: http://$LOCAL_IP:2025"
echo "Android APK: SmartERP-Connected-*.apk"
echo "iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
EOF

chmod +x build_mobile_with_connectivity.sh

print_status "Step 7: Creating connectivity test script..."

cat > test_mobile_connectivity.sh << EOF
#!/bin/bash

echo "🔍 Testing Mobile Backend Connectivity"
echo "====================================="

LOCAL_IP=$LOCAL_IP

echo "🌐 Testing backend connectivity..."
echo "Local IP: \$LOCAL_IP"
echo "Backend URL: http://\$LOCAL_IP:2025"
echo ""

# Test if backend is accessible
if curl -s http://\$LOCAL_IP:2025/admin/ > /dev/null; then
    echo "✅ Backend is accessible at http://\$LOCAL_IP:2025"
else
    echo "❌ Backend not accessible at http://\$LOCAL_IP:2025"
    echo ""
    echo "📋 Troubleshooting:"
    echo "1. Make sure backend is running: ./start_backend_network.sh"
    echo "2. Check firewall settings"
    echo "3. Verify your device is on the same network"
fi

echo ""
echo "📱 Mobile App Configuration:"
echo "API URL: http://\$LOCAL_IP:2025"
echo ""
echo "🔧 If connectivity fails:"
echo "1. Ensure backend runs on 0.0.0.0:2025 (not localhost:2025)"
echo "2. Mobile device must be on same WiFi network"
echo "3. Check firewall allows connections to port 2025"
EOF

chmod +x test_mobile_connectivity.sh

print_success "✅ Mobile backend connectivity fix completed!"

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo ""
echo "1. Start backend for mobile access:"
echo "   ./start_backend_network.sh"
echo ""
echo "2. Build mobile apps with connectivity:"
echo "   ./build_mobile_with_connectivity.sh"
echo ""
echo "3. Test connectivity:"
echo "   ./test_mobile_connectivity.sh"
echo ""
echo "📱 Key Changes Made:"
echo "==================="
echo "• Frontend now uses your local IP: $LOCAL_IP:2025"
echo "• Backend will run on 0.0.0.0:2025 (accessible from network)"
echo "• Capacitor configured for network access"
echo "• Mobile apps rebuilt with correct API endpoints"

print_success "🎉 Mobile connectivity fix ready!"
