#!/bin/bash

echo "🍎 Rebuilding iOS Project Only"
echo "=============================="

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

print_status "Step 1: Checking React build..."

cd frontend

# Check if React build exists
if [ ! -d "build" ]; then
    print_warning "React build not found. Building React app..."
    
    # Get local IP
    LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP="localhost"
    fi
    
    # Create mobile environment
    cat > .env << EOF
PORT=2026
REACT_APP_API_URL=http://$LOCAL_IP:2025
REACT_APP_BACKEND_URL=http://$LOCAL_IP:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF
    
    # Build React app
    SKIP_PREFLIGHT_CHECK=true GENERATE_SOURCEMAP=false npm run build
    
    if [ ! -d "build" ]; then
        print_error "React build failed!"
        exit 1
    fi
    
    print_success "React app built"
else
    print_success "React build found"
fi

print_status "Step 2: Configuring Capacitor for iOS..."

# Get local IP for Capacitor config
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

# Create Capacitor configuration
cat > capacitor.config.json << EOF
{
  "appId": "com.smarterp.app",
  "appName": "Smart ERP",
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
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  },
  "ios": {
    "allowsLinkPreview": false,
    "handleApplicationURL": false,
    "scrollEnabled": true
  }
}
EOF

print_success "Capacitor configured"

print_status "Step 3: Removing existing iOS platform..."

# Remove existing iOS platform
rm -rf ios

print_status "Step 4: Adding iOS platform..."

# Add iOS platform
if ! npx cap add ios; then
    print_error "Failed to add iOS platform"
    
    # Try to install Capacitor iOS if missing
    print_status "Installing Capacitor iOS..."
    npm install @capacitor/ios
    
    # Try again
    if ! npx cap add ios; then
        print_error "Still failed to add iOS platform"
        exit 1
    fi
fi

print_success "iOS platform added"

print_status "Step 5: Syncing iOS platform..."

# Sync iOS platform
npx cap sync ios

print_success "iOS platform synced"

print_status "Step 6: Verifying iOS project structure..."

# Check if iOS workspace was created
if [ -f "ios/App/App.xcworkspace" ]; then
    print_success "✅ iOS workspace created successfully!"
    echo "📱 Location: $(pwd)/ios/App/App.xcworkspace"
    
    # Get workspace info
    WORKSPACE_SIZE=$(du -sh ios/App/App.xcworkspace | cut -f1)
    echo "📊 Workspace size: $WORKSPACE_SIZE"
    
    # List iOS project contents
    echo ""
    echo "📁 iOS Project Contents:"
    ls -la ios/App/
    
else
    print_error "iOS workspace not created!"
    
    # Debug information
    echo ""
    echo "🔍 Debug Information:"
    echo "===================="
    
    if [ -d "ios" ]; then
        echo "iOS directory exists:"
        ls -la ios/
        
        if [ -d "ios/App" ]; then
            echo ""
            echo "iOS/App directory contents:"
            ls -la ios/App/
        fi
    else
        echo "iOS directory does not exist!"
    fi
    
    exit 1
fi

print_status "Step 7: Creating iOS launch script..."

# Create iOS launch script with correct path
cat > ../open_ios_xcode.sh << EOF
#!/bin/bash

echo "🍎 Opening iOS Project in Xcode"
echo "==============================="

IOS_WORKSPACE="/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/ios/App/App.xcworkspace"

if [ -f "\$IOS_WORKSPACE" ]; then
    echo "📱 Opening Xcode workspace..."
    open "\$IOS_WORKSPACE"
    
    echo ""
    echo "✅ Xcode opened successfully!"
    echo ""
    echo "📋 Next Steps in Xcode:"
    echo "======================"
    echo "1. Wait for project to load and dependencies to resolve"
    echo "2. Select your target device or simulator from the dropdown"
    echo "3. Click the Run button (▶️) to build and test the app"
    echo "4. For App Store deployment: Product → Archive"
    echo ""
    echo "🔗 Backend Connection:"
    echo "   Make sure backend is running: ./start_backend_for_mobile.sh"
    echo "   App will connect to: http://$LOCAL_IP:2025"
    echo ""
    echo "📱 Testing Tips:"
    echo "==============="
    echo "• Use iOS Simulator for quick testing"
    echo "• Use physical device for full functionality testing"
    echo "• Ensure device/simulator is on same WiFi network as backend"
else
    echo "❌ iOS workspace not found at: \$IOS_WORKSPACE"
    echo ""
    echo "🔧 Try rebuilding iOS:"
    echo "   ./rebuild_ios_only.sh"
fi
EOF

chmod +x ../open_ios_xcode.sh

cd ..

print_success "✅ iOS project rebuilt successfully!"

echo ""
echo "🎯 iOS Project Ready!"
echo "===================="
echo ""
echo "📱 iOS Workspace:"
echo "   Location: frontend/ios/App/App.xcworkspace"
echo "   Open: ./open_ios_xcode.sh"
echo ""
echo "🖥️ Backend Server:"
echo "   Start: ./start_backend_for_mobile.sh"
echo "   URL: http://$LOCAL_IP:2025"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. ./start_backend_for_mobile.sh    # Start backend server"
echo "2. ./open_ios_xcode.sh              # Open iOS in Xcode"
echo "3. Select device/simulator in Xcode"
echo "4. Click Run (▶️) to build and test"

print_success "🎉 iOS project is ready for development!"
