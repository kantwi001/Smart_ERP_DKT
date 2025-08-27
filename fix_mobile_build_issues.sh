#!/bin/bash

echo "🔧 Fixing Mobile Build Issues..."
echo "================================"

# Navigate to project root
cd "$(dirname "$0")"

# Step 1: Fix Xcode issues
echo "🍎 Fixing Xcode issues..."
cd frontend/ios/App

# Remove Xcode derived data completely
rm -rf ~/Library/Developer/Xcode/DerivedData/
rm -rf build/
rm -rf DerivedData/

# Fix scheme issues
mkdir -p App.xcodeproj/xcshareddata/xcschemes/

# Create minimal working scheme
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
echo "🍫 Fixing CocoaPods..."
rm -rf Pods/
rm -f Podfile.lock
pod deintegrate 2>/dev/null || true
pod install --repo-update

# Step 2: Fix Android issues
echo "🤖 Fixing Android issues..."
cd ../../android

# Clean Gradle completely
rm -rf .gradle/
rm -rf app/build/
rm -rf build/
rm -rf ~/.gradle/caches/

# Fix gradlew permissions
chmod +x gradlew

# Clean and rebuild
./gradlew clean --no-daemon

# Step 3: Rebuild from scratch
echo "🔄 Rebuilding projects..."
cd ../..

# Clean React build
rm -rf build/
rm -rf node_modules/.cache/

# Rebuild React
echo "⚛️ Rebuilding React app..."
npm run build

# Sync Capacitor
echo "📱 Syncing Capacitor..."
npx cap sync ios
npx cap sync android

# Build final apps
echo "🏗️ Building final apps..."
npx cap build ios
npx cap build android

# Copy APK
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    cp android/app/build/outputs/apk/debug/app-debug.apk ../../smart-erp-fixed.apk
    echo "✅ APK created: smart-erp-fixed.apk"
fi

cd ../..

echo ""
echo "✅ Build fixes completed!"
echo "📱 iOS: Open frontend/ios/App/App.xcworkspace in Xcode"
echo "🤖 Android: Open frontend/android/ in Android Studio"
echo "📦 APK: smart-erp-fixed.apk ready"
