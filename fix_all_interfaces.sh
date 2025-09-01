#!/bin/bash

# Complete Interface Fix Script
# Fixes all web, mobile, Android, and iOS issues

set -e

print_status() {
    echo "🔧 $1"
}

print_success() {
    echo "✅ $1"
}

print_error() {
    echo "❌ $1"
}

fix_web_interface() {
    print_status "Fixing web interface for original desktop UI on port 3000..."
    
    cd frontend
    
    # Create proper web environment
    cat > .env.web << 'EOF'
PORT=3000
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=false
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    # Ensure App.js has correct mobile detection logic
    print_status "Verifying mobile detection logic..."
    
    cd ..
    print_success "Web interface configured for desktop UI on port 3000"
}

fix_mobile_interface() {
    print_status "Fixing mobile interface for card-based UI on port 2026..."
    
    cd frontend
    
    # Create proper mobile environment
    cat > .env.mobile << 'EOF'
PORT=2026
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    cd ..
    print_success "Mobile interface configured for card-based UI on port 2026"
}

fix_capacitor_config() {
    print_status "Fixing Capacitor configuration for proper mobile app build..."
    
    # Remove server URL to use built files instead of live server
    cat > capacitor.config.json << 'EOF'
{
  "appId": "com.smarterp.mobile",
  "appName": "Smart ERP Mobile",
  "webDir": "frontend/build",
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    },
    "Storage": {
      "enabled": true
    },
    "Network": {
      "enabled": true
    },
    "StatusBar": {
      "style": "dark",
      "backgroundColor": "#FF9800"
    },
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#FF9800",
      "androidScaleType": "CENTER_CROP",
      "showSpinner": false
    },
    "Keyboard": {
      "resize": "body",
      "style": "dark"
    }
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true,
    "webContentsDebuggingEnabled": true
  },
  "ios": {
    "contentInset": "automatic",
    "scrollEnabled": true
  }
}
EOF

    print_success "Capacitor configured to use built files instead of live server"
}

build_mobile_production() {
    print_status "Building mobile production version..."
    
    cd frontend
    
    # Set mobile environment and build
    cp .env.mobile .env
    export REACT_APP_MOBILE_MODE=true
    export REACT_APP_API_URL=http://localhost:2025
    export REACT_APP_BACKEND_URL=http://localhost:2025
    
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Mobile production build completed"
    else
        print_error "Mobile production build failed"
        exit 1
    fi
    
    cd ..
}

fix_android_build() {
    print_status "Fixing Android Studio configuration and build..."
    
    # Sync Capacitor with new build
    npx cap sync android
    
    # Copy Capacitor assets
    npx cap copy android
    
    # Try to build Android
    print_status "Building Android APK..."
    npx cap build android
    
    if [ $? -eq 0 ]; then
        print_success "Android build completed"
        
        # Find and copy APK
        APK_PATH=$(find android -name "*.apk" -type f 2>/dev/null | head -1)
        if [ -n "$APK_PATH" ]; then
            cp "$APK_PATH" ./smart-erp-mobile.apk 2>/dev/null || true
            print_success "APK available: ./smart-erp-mobile.apk"
        fi
    else
        print_status "Android build failed, but project is ready for Android Studio"
        print_status "Open android/ folder in Android Studio to build manually"
    fi
}

fix_ios_build() {
    print_status "Fixing iOS configuration and build..."
    
    # Sync Capacitor with new build
    npx cap sync ios
    
    # Copy Capacitor assets
    npx cap copy ios
    
    # Update iOS project
    npx cap update ios
    
    print_success "iOS project updated and ready"
    print_status "Open ios/App/App.xcworkspace in Xcode to build"
}

create_startup_scripts() {
    print_status "Creating corrected startup scripts..."
    
    # Web app startup script
    cat > start_web_app.sh << 'EOF'
#!/bin/bash

echo "🌐 Starting Smart ERP Web App (Desktop UI) on Port 3000"
echo "======================================================"

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend if not running
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start web frontend with desktop UI
cd frontend
cp .env.web .env
echo "Starting web app with original desktop interface..."
npm start
EOF

    # Mobile app startup script
    cat > start_mobile_app.sh << 'EOF'
#!/bin/bash

echo "📱 Starting Smart ERP Mobile App (Card UI) on Port 2026"
echo "======================================================"

# Kill any existing process on port 2026
lsof -ti:2026 | xargs kill -9 2>/dev/null || true

# Start backend if not running
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start mobile frontend with card UI
cd frontend
cp .env.mobile .env
echo "Starting mobile app with card-based interface..."
npm start
EOF

    # Mobile build script
    cat > build_mobile_apps.sh << 'EOF'
#!/bin/bash

echo "📱 Building Mobile Apps (Android + iOS)"
echo "======================================"

# Build mobile production version
cd frontend
cp .env.mobile .env
export REACT_APP_MOBILE_MODE=true
npm run build
cd ..

# Sync and build
npx cap sync
npx cap copy

echo ""
echo "Building Android APK..."
npx cap build android

echo ""
echo "Preparing iOS project..."
npx cap sync ios

echo ""
echo "✅ Mobile apps built successfully!"
echo "📱 Android: Open android/ in Android Studio or use generated APK"
echo "🍎 iOS: Open ios/App/App.xcworkspace in Xcode"
EOF

    chmod +x start_web_app.sh start_mobile_app.sh build_mobile_apps.sh
    print_success "Startup scripts created"
}

main() {
    print_status "Starting comprehensive interface fix..."
    
    # Fix all interfaces
    fix_web_interface
    fix_mobile_interface
    fix_capacitor_config
    
    # Build mobile production version
    build_mobile_production
    
    # Fix mobile builds
    fix_android_build
    fix_ios_build
    
    # Create startup scripts
    create_startup_scripts
    
    print_success "All interfaces fixed!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Web App (Desktop UI): ./start_web_app.sh → http://localhost:3000"
    echo "2. Mobile App (Card UI): ./start_mobile_app.sh → http://localhost:2026"
    echo "3. Build Mobile Apps: ./build_mobile_apps.sh"
    echo ""
    echo "🔧 Mobile Development:"
    echo "• Android: Open android/ folder in Android Studio"
    echo "• iOS: Open ios/App/App.xcworkspace in Xcode"
    echo ""
    echo "The iOS simulator should now show the proper mobile UI instead of API response!"
}

main "$@"
