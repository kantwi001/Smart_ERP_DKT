# ERP System Mobile App Guide

## 📱 Mobile App Overview

The ERP System has been successfully converted to a mobile application using Capacitor, providing native Android and iOS apps while maintaining the web functionality.

## 🚀 Mobile App Features

### ✅ Completed Features:
- **Cross-Platform Support**: Android APK and iOS app
- **Native Mobile Plugins**: Splash screen, status bar, keyboard, haptics, toast notifications
- **Mobile-Optimized UI**: Touch-friendly buttons, responsive design, mobile-specific styles
- **Offline Capabilities**: Local storage and sync functionality
- **Native Performance**: Hardware acceleration and native navigation

### 📱 Mobile-Specific Enhancements:
- **Touch-Optimized Interface**: Larger touch targets (48px minimum)
- **Mobile-Friendly Navigation**: Collapsible sidebar, swipe gestures
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Native Status Bar**: Branded colors and proper styling
- **Splash Screen**: Professional loading screen with branding
- **Keyboard Handling**: Proper input focus and keyboard avoidance
- **Safe Area Support**: Handles notches and device-specific layouts

## 🛠️ Build Instructions

### Prerequisites:
1. **Node.js** (v16 or higher)
2. **Android Studio** (for Android builds)
3. **Xcode** (for iOS builds - macOS only)
4. **Java 17** (for Android compatibility)

### Android APK Build:

#### Option 1: Using Build Script
```bash
# Make script executable
chmod +x build_mobile_app.sh

# Run the build script
./build_mobile_app.sh
```

#### Option 2: Manual Build
```bash
# Navigate to frontend
cd frontend

# Build React app
npm run build

# Sync Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Build > Generate Signed Bundle/APK
# 3. Choose APK and follow the wizard
```

#### Option 3: Command Line Build (requires proper Java setup)
```bash
cd frontend/android
./gradlew assembleDebug
```

### iOS App Build:
```bash
cd frontend

# Build React app
npm run build

# Sync Capacitor
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select target device/simulator
# 2. Product > Build
# 3. Product > Archive (for App Store)
```

## 🧪 Testing Instructions

### Android Emulator Setup:
```bash
# Run the testing setup script
chmod +x setup_mobile_testing.sh
./setup_mobile_testing.sh

# Or manually:
# 1. Open Android Studio
# 2. Tools > AVD Manager
# 3. Create Virtual Device
# 4. Choose Pixel 7 or similar
# 5. Download system image (API 34)
# 6. Start emulator
```

### Installing APK:
```bash
# Install on connected device/emulator
adb install erp-system-mobile.apk

# Or drag and drop APK file to emulator
```

### iOS Simulator:
```bash
# Open iOS Simulator
open -a Simulator

# Run from Xcode or use:
npx cap run ios
```

## 📂 Mobile App Structure

```
frontend/
├── capacitor.config.ts          # Capacitor configuration
├── src/
│   ├── mobile.css              # Mobile-specific styles
│   └── App.js                  # Updated with mobile imports
├── android/                    # Android native project
│   ├── app/
│   │   └── build/outputs/apk/  # Generated APK location
│   └── gradle/                 # Gradle configuration
├── ios/                        # iOS native project (if available)
│   └── App/
│       └── App.xcworkspace     # Xcode workspace
└── build/                      # React build output
```

## 🔧 Configuration Files

### Capacitor Config (`capacitor.config.ts`):
- App ID: `com.kwadwo.erpsystem`
- App Name: `ERP System`
- Splash screen configuration
- Status bar styling
- Keyboard handling
- Security settings

### Mobile Styles (`mobile.css`):
- Touch-friendly button sizes
- Mobile-optimized layouts
- Responsive breakpoints
- Safe area handling
- Mobile-specific animations

## 🚨 Troubleshooting

### Common Issues:

#### Java Version Compatibility:
```bash
# Check Java version
java -version

# Should be Java 17 or 21 for Android
# Install Java 17:
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
```

#### Android SDK Issues:
```bash
# Check Android SDK
echo $ANDROID_HOME

# Set if not configured:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### Gradle Build Failures:
```bash
# Clean and rebuild
cd frontend/android
./gradlew clean
./gradlew assembleDebug

# Or use Android Studio:
# Build > Clean Project
# Build > Rebuild Project
```

#### Capacitor Issues:
```bash
# Check Capacitor setup
npx cap doctor

# Reinstall if needed
npm uninstall @capacitor/core @capacitor/cli
npm install @capacitor/core @capacitor/cli
```

## 📱 Mobile App Features

### Core ERP Modules (Mobile-Optimized):
- **Dashboard**: Touch-friendly summary cards and navigation
- **Inventory**: Mobile inventory management with barcode scanning
- **Sales**: Mobile sales orders and customer management
- **HR**: Employee management and time tracking
- **Warehouse**: Mobile warehouse operations
- **POS**: Touch-optimized point of sale
- **Reporting**: Mobile-friendly charts and reports

### Mobile-Specific Features:
- **Offline Mode**: Work without internet, sync when connected
- **Push Notifications**: Real-time alerts and updates
- **Camera Integration**: Barcode scanning, photo capture
- **GPS Location**: Location tracking for field operations
- **Biometric Auth**: Fingerprint/Face ID login (future)
- **Dark Mode**: Mobile-optimized dark theme (future)

## 🌐 Backend Configuration for Mobile

### API Endpoints:
The mobile app uses the same backend API as the web version:
- Base URL: `http://localhost:2025/api/` (development)
- Authentication: JWT tokens
- All existing endpoints work with mobile app

### CORS Configuration:
Ensure backend allows mobile app origins:
```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Web app
    "capacitor://localhost",  # Mobile app
    "https://localhost",      # Mobile app HTTPS
]
```

## 📦 Distribution

### Android:
- **Debug APK**: For testing (`app-debug.apk`)
- **Release APK**: For distribution (requires signing)
- **Google Play Store**: Upload AAB bundle
- **Direct Install**: Share APK file

### iOS:
- **Development**: Install via Xcode
- **TestFlight**: Beta testing distribution
- **App Store**: Production release
- **Enterprise**: Internal distribution

## 🔄 Updates and Maintenance

### Hot Updates:
- Web assets can be updated without app store approval
- Use Capacitor Live Updates for instant updates
- Backend API updates are immediately available

### Version Management:
- Update `package.json` version
- Update `capacitor.config.ts` version
- Rebuild and redistribute

## 📊 Performance Optimization

### Mobile Performance:
- Lazy loading of modules
- Image optimization
- Minimal bundle size
- Native performance for critical operations
- Efficient state management

### Battery Optimization:
- Background task management
- Efficient API calls
- Optimized animations
- Smart sync strategies

## 🔐 Security Considerations

### Mobile Security:
- Secure storage for sensitive data
- Certificate pinning for API calls
- Biometric authentication
- App transport security
- Code obfuscation for release builds

---

## 📞 Support

For mobile app issues:
1. Check this guide first
2. Run `npx cap doctor` for diagnostics
3. Check Android Studio/Xcode logs
4. Verify backend connectivity
5. Test on different devices/emulators

The ERP System mobile app provides full functionality of the web version with mobile-optimized UX and native device integration!
