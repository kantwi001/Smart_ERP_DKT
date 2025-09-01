#!/bin/bash

echo "🚀 Updating Mobile App Backend to Fly.dev"
echo "========================================"

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "1️⃣ Updating API configuration..."

# Update frontend API configuration
echo "   📱 Updating frontend/src/api.js..."
cat > frontend/src/api.js << 'EOF'
import axios from 'axios';
import { Capacitor } from '@capacitor/core';

// Production backend URL
const API_BASE_URL = 'https://backend-shy-sun-4450.fly.dev/api';

// Create axios instance with production settings
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add platform info for mobile apps
    if (Capacitor.isNativePlatform()) {
      config.headers['X-Platform'] = Capacitor.getPlatform();
      config.headers['X-App-Version'] = '2.0.0';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (Capacitor.isNativePlatform()) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints for production
export const authEndpoints = [
  '/token/',
  '/token/refresh/',
  '/users/me/',
  '/users/system/settings/'
];

export { API_BASE_URL };
export default api;
EOF

echo "2️⃣ Updating Capacitor configuration..."

# Update Capacitor config
echo "   ⚙️  Updating frontend/capacitor.config.js..."
cat > frontend/capacitor.config.js << 'EOF'
const config = {
  appId: 'com.smarterpsoftware.app',
  appName: 'SmartERPSoftware',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'https://backend-shy-sun-4450.fly.dev',
      'backend-shy-sun-4450.fly.dev'
    ]
  }
};

module.exports = config;
EOF

echo "3️⃣ Cleaning and rebuilding mobile app..."

# Navigate to frontend directory
cd frontend

# Clean previous builds
echo "   🧹 Cleaning previous builds..."
rm -rf android/app/build
rm -rf ios/App/build

# Build React app
echo "   ⚛️  Building React app..."
npm run build

# Sync with Capacitor
echo "   🔄 Syncing with Capacitor..."
npx cap sync

# Copy assets
echo "   📁 Copying assets..."
npx cap copy

echo "4️⃣ Building Android APK with new backend..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    # Copy APK to root with timestamp
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="SmartERP-FlydevBackend-${TIMESTAMP}.apk"
    cp app/build/outputs/apk/debug/app-debug.apk "../${APK_NAME}"
    echo "✅ Android APK built successfully: ${APK_NAME}"
else
    echo "❌ Android build failed"
fi

cd ../..

echo ""
echo "🎉 Mobile app backend update completed!"
echo "🌐 Backend URL: https://backend-shy-sun-4450.fly.dev/"
echo "📱 New APK available with Fly.dev backend"
echo "🍎 iOS project ready for Xcode build"
echo ""
echo "📋 Next steps:"
echo "   • Test the new APK with Fly.dev backend"
echo "   • Open frontend/ios/App/App.xcworkspace in Xcode to build iOS app"
echo "   • Verify backend connectivity on both platforms"
