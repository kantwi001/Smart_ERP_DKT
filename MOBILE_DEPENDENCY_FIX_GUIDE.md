# Mobile App Dependency Fix Guide

## Quick Fix Instructions

Run these commands to fix all mobile app build dependencies:

```bash
# 1. Make the fix script executable
chmod +x fix_mobile_dependencies.sh

# 2. Run the dependency fix script
./fix_mobile_dependencies.sh

# 3. After dependencies are fixed, build the mobile app
./build_mobile_app_complete.sh
```

## What Gets Fixed

### ✅ Java Runtime Issue
- **Problem**: Android build failed due to missing Java JDK
- **Solution**: Installs OpenJDK 17 via Homebrew (required for Android builds)
- **Environment**: Sets up JAVA_HOME and PATH variables

### ✅ Missing @capacitor/preferences Module
- **Problem**: Build errors due to missing Capacitor preferences dependency
- **Solution**: Adds `@capacitor/preferences@^5.0.7` to package.json and installs it
- **Usage**: Required for secure storage in mobile app

### ✅ Android SDK Setup
- **Problem**: Missing Android SDK environment variables
- **Solution**: Detects and configures ANDROID_HOME automatically
- **Fallback**: Provides instructions if Android Studio needs to be installed

## Manual Installation (if needed)

### Install Java JDK Manually
```bash
# Using Homebrew
brew install openjdk@17

# Add to your shell profile (~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
```

### Install Capacitor Preferences Manually
```bash
cd frontend
npm install @capacitor/preferences@^5.0.7
```

### Install Android Studio (if needed)
1. Download from: https://developer.android.com/studio
2. Install and run Android Studio
3. Install Android SDK through the SDK Manager
4. Set ANDROID_HOME environment variable

## Verification

After running the fix script, verify everything is working:

```bash
# Check Java version
java -version

# Check if Capacitor preferences is installed
cd frontend && npm list @capacitor/preferences

# Check Android SDK
echo $ANDROID_HOME
```

## Next Steps

Once all dependencies are fixed:
1. Run `./build_mobile_app_complete.sh` to build the mobile app
2. The script will generate both Android APK and iOS project
3. APK will be available in `android/app/build/outputs/apk/`
4. iOS project can be opened in Xcode from `ios/App/App.xcworkspace`

## Troubleshooting

### If Homebrew is not installed:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### If Android Studio SDK is not detected:
1. Install Android Studio
2. Open Android Studio and install SDK
3. Manually set environment variables:
   ```bash
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
   ```

### If build still fails:
1. Restart your terminal after running the fix script
2. Ensure all environment variables are loaded
3. Check that Node.js and npm are up to date
