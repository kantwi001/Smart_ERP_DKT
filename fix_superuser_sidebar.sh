#!/bin/bash

# Fix Superuser Sidebar Access Issue
# Addresses authentication logic preventing superuser sidebar display

set -e

print_status() {
    echo "🔧 $1"
}

print_success() {
    echo "✅ $1"
}

fix_app_authentication() {
    print_status "Fixing App.js authentication logic..."
    
    cd frontend/src
    
    # Create backup
    cp App.js App.js.backup
    
    # Fix the isSuperUser function and authentication check
    sed -i '' '
    # Fix superuser check function
    /const isSuperUser = () => {/,/};/c\
  const isSuperUser = () => {\
    if (!user) return false;\
    \
    console.log("🔍 Superuser check:", {\
      username: user?.username,\
      is_superuser: user?.is_superuser,\
      role: user?.role\
    });\
    \
    return user?.is_superuser === true || \
           user?.role === "superadmin" || \
           user?.role === "admin" ||\
           user?.username === "admin";\
  };
    
    # Fix authentication check
    /const isAuthenticated = user;/c\
  const isAuthenticated = user && (user.id || user.username);
    
    # Fix mobile mode detection
    /return window.Capacitor !== undefined;/c\
      return process.env.REACT_APP_MOBILE_MODE === "true" || window.Capacitor !== undefined;
    ' App.js
    
    print_success "App.js authentication logic fixed"
}

fix_environment_variables() {
    print_status "Setting up proper environment variables..."
    
    cd ..
    
    # Ensure web environment disables mobile mode
    cat > .env.web << 'EOF'
PORT=3000
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=false
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    # Ensure mobile environment enables mobile mode
    cat > .env.mobile << 'EOF'
PORT=2026
REACT_APP_API_URL=http://localhost:2025
REACT_APP_BACKEND_URL=http://localhost:2025
REACT_APP_MOBILE_MODE=true
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
EOF

    print_success "Environment variables configured"
}

fix_capacitor_config() {
    print_status "Fixing Capacitor configuration..."
    
    cd ..
    
    # Ensure Capacitor serves built files, not live server
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

    print_success "Capacitor configuration fixed"
}

create_debug_script() {
    print_status "Creating authentication debug script..."
    
    cat > debug_auth.js << 'EOF'
// Debug Authentication Issues
// Run with: node debug_auth.js

console.log('🔍 Authentication Debug Script');
console.log('==============================');

// Check environment variables
console.log('Environment Variables:');
console.log('- REACT_APP_MOBILE_MODE:', process.env.REACT_APP_MOBILE_MODE);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

// Mock user objects for testing
const testUsers = [
  { id: 1, username: 'admin', is_superuser: true, role: 'admin' },
  { id: 2, username: 'superuser', is_superuser: true, role: 'superadmin' },
  { id: 3, username: 'manager', is_superuser: false, role: 'manager' },
  { id: 4, username: 'employee', is_superuser: false, role: 'employee' }
];

// Test superuser detection
const isSuperUser = (user) => {
  if (!user) return false;
  return user?.is_superuser === true || 
         user?.role === 'superadmin' || 
         user?.role === 'admin' ||
         user?.username === 'admin';
};

console.log('\nSuperuser Detection Tests:');
testUsers.forEach(user => {
  const result = isSuperUser(user);
  console.log(`- ${user.username}: ${result ? '✅ SUPERUSER' : '❌ Regular User'}`);
});

console.log('\n✅ Debug script completed');
EOF

    chmod +x debug_auth.js
    print_success "Debug script created"
}

main() {
    print_status "Fixing superuser sidebar access issue..."
    
    # Fix authentication logic
    fix_app_authentication
    
    # Fix environment variables
    fix_environment_variables
    
    # Fix Capacitor config
    fix_capacitor_config
    
    # Create debug script
    create_debug_script
    
    print_success "Superuser sidebar fix completed!"
    echo ""
    echo "🎯 What was fixed:"
    echo "• Enhanced superuser detection logic"
    echo "• Fixed authentication state management"
    echo "• Corrected mobile mode detection"
    echo "• Configured proper environment variables"
    echo "• Fixed Capacitor configuration"
    echo ""
    echo "📋 Next steps:"
    echo "1. Start web app: cd frontend && cp .env.web .env && npm start"
    echo "2. Login with superuser account"
    echo "3. Verify full sidebar is displayed"
    echo ""
    echo "🐛 Debug: Run 'node debug_auth.js' to test authentication logic"
}

main "$@"
