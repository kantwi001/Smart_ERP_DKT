#!/bin/bash

# Dual Port Setup Script
# Web app on port 3000, Mobile app on port 2026

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

setup_web_app_port_3000() {
    print_status "Setting up web app for port 3000..."
    
    cd frontend
    
    # Create web-specific environment file
    cat > .env.web << 'EOF'
PORT=3000
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=false
SKIP_PREFLIGHT_CHECK=true
EOF

    # Update package.json scripts for web
    cat > package.json.tmp << 'EOF'
{
  "name": "smart-erp-software",
  "version": "0.1.0",
  "private": true,
  "homepage": "./",
  "dependencies": {
    "@capacitor/app": "^5.0.7",
    "@capacitor/core": "^5.7.8",
    "@capacitor/haptics": "^5.0.7",
    "@capacitor/keyboard": "^5.0.8",
    "@capacitor/preferences": "^5.0.7",
    "@capacitor/status-bar": "^5.0.7",
    "@date-io/date-fns": "^2.17.0",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.15",
    "@mui/lab": "^5.0.0-alpha.170",
    "@mui/material": "^5.14.20",
    "@mui/x-date-pickers": "^5.0.20",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^1.6.8",
    "date-fns": "^2.30.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.5.31",
    "leaflet": "^1.9.4",
    "localforage": "^1.10.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-leaflet": "^4.2.1",
    "react-router-dom": "^6.22.3",
    "react-scripts": "5.0.1",
    "recharts": "^2.8.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "SKIP_PREFLIGHT_CHECK=true PORT=3000 react-scripts start",
    "start:web": "SKIP_PREFLIGHT_CHECK=true PORT=3000 react-scripts start",
    "start:mobile": "SKIP_PREFLIGHT_CHECK=true PORT=2026 react-scripts start",
    "build": "SKIP_PREFLIGHT_CHECK=true react-scripts build",
    "build:web": "SKIP_PREFLIGHT_CHECK=true REACT_APP_MOBILE_MODE=false react-scripts build",
    "build:mobile": "SKIP_PREFLIGHT_CHECK=true REACT_APP_MOBILE_MODE=true react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "fork-ts-checker-webpack-plugin": "^6.5.3"
  }
}
EOF

    mv package.json.tmp package.json
    
    print_success "Web app configured for port 3000"
    cd ..
}

setup_mobile_app_port_2026() {
    print_status "Setting up mobile app for port 2026..."
    
    cd frontend
    
    # Create mobile-specific environment file
    cat > .env.mobile << 'EOF'
PORT=2026
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
EOF

    print_success "Mobile app configured for port 2026"
    cd ..
}

update_capacitor_config() {
    print_status "Updating Capacitor configuration for mobile port..."
    
    cat > capacitor.config.json << 'EOF'
{
  "appId": "com.smarterp.mobile",
  "appName": "Smart ERP Mobile",
  "webDir": "frontend/build",
  "server": {
    "url": "http://localhost:2026",
    "cleartext": true,
    "allowNavigation": [
      "localhost:2026",
      "127.0.0.1:2026",
      "10.0.2.2:2026",
      "192.168.1.*:2026"
    ]
  },
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

    print_success "Capacitor configured for mobile port 2026"
}

create_startup_scripts() {
    print_status "Creating startup scripts for both apps..."
    
    # Web app startup script
    cat > start_web_app.sh << 'EOF'
#!/bin/bash

echo "🌐 Starting Smart ERP Web App on Port 3000"
echo "==========================================="

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

# Start web frontend
cd frontend
cp .env.web .env
npm run start:web
EOF

    # Mobile app startup script
    cat > start_mobile_app.sh << 'EOF'
#!/bin/bash

echo "📱 Starting Smart ERP Mobile App on Port 2026"
echo "=============================================="

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

# Start mobile frontend
cd frontend
cp .env.mobile .env
npm run start:mobile
EOF

    # Combined launcher
    cat > launch_erp_system.sh << 'EOF'
#!/bin/bash

echo "🚀 Smart ERP System Launcher"
echo "============================"
echo ""
echo "Choose an option:"
echo "1. Start Web App (Port 3000)"
echo "2. Start Mobile App (Port 2026)"
echo "3. Build Mobile APK"
echo "4. Open iOS Project"
echo "5. Start Both (Web + Mobile)"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "Starting Web App..."
        ./start_web_app.sh
        ;;
    2)
        echo "Starting Mobile App..."
        ./start_mobile_app.sh
        ;;
    3)
        echo "Building Mobile APK..."
        cd frontend && cp .env.mobile .env && npm run build:mobile && cd ..
        npx cap sync && npx cap build android
        ;;
    4)
        echo "Opening iOS Project..."
        open ios/App/App.xcworkspace
        ;;
    5)
        echo "Starting both apps..."
        ./start_web_app.sh &
        sleep 5
        ./start_mobile_app.sh &
        wait
        ;;
    *)
        echo "Invalid choice"
        ;;
esac
EOF

    chmod +x start_web_app.sh start_mobile_app.sh launch_erp_system.sh
    print_success "Startup scripts created"
}

main() {
    print_status "Setting up dual port configuration..."
    
    setup_web_app_port_3000
    setup_mobile_app_port_2026
    update_capacitor_config
    create_startup_scripts
    
    print_success "Dual port setup completed!"
    echo ""
    echo "📋 Usage:"
    echo "• Web App (Desktop): ./start_web_app.sh → http://localhost:3000"
    echo "• Mobile App (Dev): ./start_mobile_app.sh → http://localhost:2026"
    echo "• Interactive Launcher: ./launch_erp_system.sh"
    echo ""
    echo "🔧 Ports:"
    echo "• Backend API: 2025"
    echo "• Web Frontend: 3000"
    echo "• Mobile Frontend: 2026"
}

main "$@"
