#!/bin/bash

echo "🔧 Fixing Android Build Issues..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "☕ Java not found. Installing Java..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "🍺 Installing Homebrew first..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install Java 17 (required for Android builds)
    echo "📦 Installing Java 17..."
    brew install openjdk@17
    
    # Add Java to PATH
    echo "🔗 Adding Java to PATH..."
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
    
    # Source the updated profile
    source ~/.zshrc
    
    # Create symlink for system Java
    sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
else
    echo "☕ Java is already installed: $(java -version 2>&1 | head -n 1)"
fi

# Check if Android SDK is installed
if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo "📱 Android SDK not found. Installing Android Studio command line tools..."
    
    # Create Android SDK directory
    mkdir -p $HOME/Library/Android/sdk
    
    # Download and install command line tools
    cd $HOME/Library/Android/sdk
    curl -O https://dl.google.com/android/repository/commandlinetools-mac-9477386_latest.zip
    unzip commandlinetools-mac-9477386_latest.zip
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    
    # Add Android SDK to PATH
    echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
    echo 'export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"' >> ~/.zshrc
    echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc
    
    # Source the updated profile
    source ~/.zshrc
    
    # Accept licenses and install required packages
    yes | $HOME/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager --licenses
    $HOME/Library/Android/sdk/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
fi

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/
rm -rf android/app/build/
rm -rf node_modules/.cache/

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build React app
echo "🏗️ Building React app..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Navigate to Android project
cd android

# Clean Gradle cache
echo "🧹 Cleaning Gradle cache..."
./gradlew clean

# Set proper permissions
chmod +x gradlew

# Navigate back to project root
cd ../..

echo "✅ Android build fix completed!"
echo "🤖 You can now build the Android app using:"
echo "   cd frontend && npx cap build android"
echo "   Or open android/ folder in Android Studio"

# Display environment info
echo ""
echo "📋 Environment Information:"
echo "Java Version: $(java -version 2>&1 | head -n 1)"
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
