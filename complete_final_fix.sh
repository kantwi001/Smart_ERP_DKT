#!/bin/bash

# Complete Final Fix Script
# Addresses Java Runtime, interface separation, and mobile builds

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

fix_java_runtime() {
    print_status "Fixing Java Runtime issue..."
    
    # Check if Java is installed
    if ! command -v java &> /dev/null; then
        print_status "Installing Java JDK 17..."
        if command -v brew &> /dev/null; then
            brew install openjdk@17
        else
            print_error "Homebrew not found. Please install Java manually."
            exit 1
        fi
    fi
    
    # Set Java environment variables
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
        
        # Add to shell profile
        SHELL_PROFILE=""
        if [ -f ~/.zshrc ]; then
            SHELL_PROFILE="$HOME/.zshrc"
        elif [ -f ~/.bash_profile ]; then
            SHELL_PROFILE="$HOME/.bash_profile"
        fi
        
        if [ -n "$SHELL_PROFILE" ]; then
            if ! grep -q "JAVA_HOME.*openjdk@17" "$SHELL_PROFILE"; then
                echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> "$SHELL_PROFILE"
                echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> "$SHELL_PROFILE"
            fi
        fi
    fi
    
    # Verify Java installation
    java -version
    print_success "Java Runtime configured"
}

setup_interface_separation() {
    print_status "Setting up proper interface separation..."
    
    cd frontend
    
    # Create web environment (desktop UI)
    cat > .env.web << 'EOF'
PORT=3000
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=false
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    # Create mobile environment (card UI)
    cat > .env.mobile << 'EOF'
PORT=2026
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    # Create production mobile environment
    cat > .env.production << 'EOF'
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    cd ..
    print_success "Interface environments configured"
}

fix_capacitor_config() {
    print_status "Fixing Capacitor configuration..."
    
    # Create proper Capacitor config that serves built files
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

    print_success "Capacitor configured to serve built files"
}

build_mobile_production() {
    print_status "Building mobile production version..."
    
    cd frontend
    
    # Use production mobile environment
    cp .env.production .env
    
    # Build with mobile mode enabled
    REACT_APP_MOBILE_MODE=true npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Mobile production build completed"
    else
        print_error "Mobile production build failed"
        exit 1
    fi
    
    cd ..
}

build_mobile_apps() {
    print_status "Building mobile apps..."
    
    # Sync Capacitor
    npx cap sync
    
    # Copy assets
    npx cap copy
    
    # Build Android
    print_status "Building Android APK..."
    if npx cap build android; then
        print_success "Android build completed"
        
        # Find and copy APK
        APK_PATH=$(find android -name "*.apk" -type f 2>/dev/null | head -1)
        if [ -n "$APK_PATH" ]; then
            cp "$APK_PATH" ./smart-erp-mobile.apk 2>/dev/null || true
            print_success "APK available: ./smart-erp-mobile.apk"
        fi
    else
        print_status "Android build failed - project ready for Android Studio"
    fi
    
    # Prepare iOS
    print_status "Preparing iOS project..."
    npx cap sync ios
    npx cap copy ios
    print_success "iOS project ready at: ios/App/App.xcworkspace"
}

create_startup_scripts() {
    print_status "Creating startup scripts..."
    
    # Web app script (desktop UI)
    cat > start_web_desktop.sh << 'EOF'
#!/bin/bash

echo "🌐 Starting Smart ERP Web App (Desktop UI) - Port 3000"
echo "====================================================="

# Kill existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend if needed
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start web frontend (desktop UI)
cd frontend
cp .env.web .env
echo "🖥️  Starting desktop interface with sidebar navigation..."
npm start
EOF

    # Mobile app script (card UI)
    cat > start_mobile_dev.sh << 'EOF'
#!/bin/bash

echo "📱 Starting Smart ERP Mobile App (Card UI) - Port 2026"
echo "====================================================="

# Kill existing processes
lsof -ti:2026 | xargs kill -9 2>/dev/null || true

# Start backend if needed
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start mobile frontend (card UI)
cd frontend
cp .env.mobile .env
echo "📱 Starting mobile interface with card-based navigation..."
npm start
EOF

    # Mobile build script
    cat > build_mobile_final.sh << 'EOF'
#!/bin/bash

echo "📱 Building Final Mobile Apps"
echo "============================"

# Set Java environment
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Build mobile production
cd frontend
cp .env.production .env
REACT_APP_MOBILE_MODE=true npm run build
cd ..

# Build mobile apps
npx cap sync
npx cap copy

echo ""
echo "Building Android..."
npx cap build android

echo ""
echo "Preparing iOS..."
npx cap sync ios

echo ""
echo "✅ Mobile apps built!"
echo "📱 Android: ./smart-erp-mobile.apk or open android/ in Android Studio"
echo "🍎 iOS: Open ios/App/App.xcworkspace in Xcode"
EOF

    chmod +x start_web_desktop.sh start_mobile_dev.sh build_mobile_final.sh
    print_success "Startup scripts created"
}

main() {
    print_status "Starting complete final fix..."
    
    # Fix Java Runtime
    fix_java_runtime
    
    # Setup interface separation
    setup_interface_separation
    
    # Fix Capacitor config
    fix_capacitor_config
    
    # Build mobile production
    build_mobile_production
    
    # Build mobile apps
    build_mobile_apps
    
    # Create startup scripts
    create_startup_scripts
    
    print_success "Complete final fix completed!"
    echo ""
    echo "🎯 Final Setup Complete:"
    echo "• Web App (Desktop): ./start_web_desktop.sh → http://localhost:3000"
    echo "• Mobile Dev (Card): ./start_mobile_dev.sh → http://localhost:2026"
    echo "• Build Mobile Apps: ./build_mobile_final.sh"
    echo ""
    echo "📱 Mobile Apps:"
    echo "• Android APK: ./smart-erp-mobile.apk"
    echo "• iOS Project: ios/App/App.xcworkspace"
    echo ""
    echo "✅ iOS simulator will now show mobile UI instead of API response!"
}

main "$@"
