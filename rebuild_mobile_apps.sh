#!/bin/bash

echo "🔧 Rebuilding Mobile Apps - Comprehensive Fix..."
echo "=================================================="

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Clean everything thoroughly
echo "🧹 Deep cleaning all build artifacts..."
rm -rf frontend/build/
rm -rf frontend/ios/App/build/
rm -rf frontend/ios/App/DerivedData/
rm -rf frontend/android/app/build/
rm -rf frontend/android/build/
rm -rf frontend/android/.gradle/
rm -rf frontend/node_modules/.cache/
rm -rf frontend/.cache/

# Step 2: Navigate to frontend
cd frontend

# Step 3: Reinstall dependencies completely
echo "📦 Reinstalling all dependencies..."
rm -rf node_modules/
rm package-lock.json
npm install

# Step 4: Build React app with specific settings
echo "🏗️ Building React app with optimized settings..."
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false
export IMAGE_INLINE_SIZE_LIMIT=0
npm run build

# Step 5: Clean and rebuild Capacitor
echo "🔄 Rebuilding Capacitor projects..."
npx cap clean ios
npx cap clean android
npx cap sync ios
npx cap sync android

# Step 6: Fix iOS specific issues
echo "🍎 Fixing iOS project..."
cd ios/App

# Remove problematic files
rm -rf build/
rm -rf DerivedData/
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

# Ensure scheme directory exists
mkdir -p App.xcodeproj/xcshareddata/xcschemes/

# Create proper App.xcscheme
cat > App.xcodeproj/xcshareddata/xcschemes/App.xcscheme << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1500"
   version = "1.3">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
               BuildableName = "App.app"
               BlueprintName = "App"
               ReferencedContainer = "container:App.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      shouldUseLaunchSchemeArgsEnv = "YES">
   </TestAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "App.app"
            BlueprintName = "App"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction
      buildConfiguration = "Release"
      shouldUseLaunchSchemeArgsEnv = "YES"
      savedToolIdentifier = ""
      useCustomWorkingDirectory = "NO"
      debugDocumentVersioning = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "13B07F861A680F5B00A75B9A"
            BuildableName = "App.app"
            BlueprintName = "App"
            ReferencedContainer = "container:App.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction
      buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction
      buildConfiguration = "Release"
      revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
EOF

# Clean and reinstall pods
echo "🍫 Reinstalling CocoaPods..."
rm -rf Pods/
rm Podfile.lock
pod deintegrate 2>/dev/null || true
pod install --repo-update

# Step 7: Fix Android specific issues
echo "🤖 Fixing Android project..."
cd ../../android

# Clean Gradle thoroughly
rm -rf .gradle/
rm -rf app/build/
rm -rf build/
./gradlew clean || true

# Fix permissions
chmod +x gradlew

# Ensure proper Gradle wrapper
if [ ! -f gradlew ]; then
    echo "Regenerating Gradle wrapper..."
    gradle wrapper
fi

# Step 8: Set proper environment variables
echo "🔧 Setting environment variables..."
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Step 9: Build projects
echo "🏗️ Building projects..."
cd ../..

# Build iOS
echo "📱 Building iOS..."
cd frontend
npx cap build ios

# Build Android
echo "🤖 Building Android..."
npx cap build android

# Copy APK
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp android/app/build/outputs/apk/debug/app-debug.apk ../smart-erp-rebuilt.apk
    echo "✅ APK created: smart-erp-rebuilt.apk"
fi

cd ..

echo ""
echo "🎉 Mobile apps rebuilt successfully!"
echo "📋 Next steps:"
echo "   iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
echo "   Android: Open frontend/android/ in Android Studio"
echo "   APK: smart-erp-rebuilt.apk ready for installation"
echo ""
echo "🔧 Environment check:"
echo "   Java: $(java -version 2>&1 | head -n 1)"
echo "   Node: $(node --version)"
echo "   npm: $(npm --version)"
