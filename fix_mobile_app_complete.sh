#!/bin/bash

# Complete Mobile App Fix Script
# Fixes server issues and rebuilds mobile app properly

set -e

print_status() {
    echo "🔧 $1"
}

print_error() {
    echo "❌ $1"
}

print_success() {
    echo "✅ $1"
}

start_frontend_server() {
    print_status "Starting frontend development server..."
    
    cd frontend
    
    # Kill any existing processes on port 3000
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Start the frontend server in background
    npm start &
    FRONTEND_PID=$!
    
    print_status "Frontend server starting with PID: $FRONTEND_PID"
    
    # Wait for server to be ready
    print_status "Waiting for frontend server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend server is ready on port 3000"
            break
        fi
        sleep 2
        if [ $i -eq 30 ]; then
            print_error "Frontend server failed to start"
            exit 1
        fi
    done
    
    cd ..
}

build_production_frontend() {
    print_status "Building production frontend..."
    
    cd frontend
    
    # Set mobile environment
    export REACT_APP_MOBILE_MODE=true
    export REACT_APP_API_URL=http://localhost:2025
    export REACT_APP_BACKEND_URL=http://localhost:2025
    
    # Build for production
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Production build completed"
    else
        print_error "Production build failed"
        exit 1
    fi
    
    cd ..
}

rebuild_mobile_app() {
    print_status "Rebuilding mobile app with correct configuration..."
    
    # Sync Capacitor
    npx cap sync
    
    # Build Android
    print_status "Building Android APK..."
    npx cap build android
    
    if [ $? -eq 0 ]; then
        print_success "Android build completed"
        
        # Find and copy APK
        APK_PATH=$(find android -name "*.apk" -type f | head -1)
        if [ -n "$APK_PATH" ]; then
            cp "$APK_PATH" ./smart-erp-mobile.apk
            print_success "APK copied to: ./smart-erp-mobile.apk"
        fi
    else
        print_error "Android build failed"
    fi
    
    # Build iOS
    print_status "Preparing iOS project..."
    npx cap build ios
    
    if [ $? -eq 0 ]; then
        print_success "iOS project prepared at: ios/App/App.xcworkspace"
    else
        print_error "iOS build failed"
    fi
}

create_mobile_launcher() {
    print_status "Creating mobile app launcher script..."
    
    cat > launch_mobile_app.sh << 'EOF'
#!/bin/bash

echo "🚀 Smart ERP Mobile App Launcher"
echo "================================="

# Start backend if not running
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
    
    # Wait for backend
    sleep 5
fi

echo ""
echo "📱 Mobile App Options:"
echo "1. Install Android APK: ./smart-erp-mobile.apk"
echo "2. Open iOS in Xcode: open ios/App/App.xcworkspace"
echo ""
echo "🌐 Web App Options:"
echo "1. Development: http://localhost:3000"
echo "2. Production: Serve frontend/build directory"
echo ""
echo "Backend API: http://localhost:2025/api/"
EOF

    chmod +x launch_mobile_app.sh
    print_success "Mobile launcher created: ./launch_mobile_app.sh"
}

main() {
    print_status "Starting complete mobile app fix..."
    
    # Start frontend server for development
    start_frontend_server
    
    # Build production version
    build_production_frontend
    
    # Rebuild mobile app
    rebuild_mobile_app
    
    # Create launcher
    create_mobile_launcher
    
    print_success "Mobile app fix completed!"
    print_status "Next steps:"
    echo "1. For Android: Install ./smart-erp-mobile.apk"
    echo "2. For iOS: Open ios/App/App.xcworkspace in Xcode"
    echo "3. For Web: Visit http://localhost:3000"
    echo "4. Use ./launch_mobile_app.sh for easy launching"
}

main "$@"
