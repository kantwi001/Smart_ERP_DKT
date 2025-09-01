#!/bin/bash

# Fix Java Path Detection for macOS
# Resolves "Unable to locate a Java Runtime" error

echo "🔧 Fixing Java Runtime detection on macOS..."

# Step 1: Find Java installation paths
echo "📍 Locating Java installations..."
HOMEBREW_JAVA="/opt/homebrew/opt/openjdk@17"
HOMEBREW_INTEL_JAVA="/usr/local/opt/openjdk@17"
SYSTEM_JAVA="/Library/Java/JavaVirtualMachines"

# Check which Java path exists
if [ -d "$HOMEBREW_JAVA" ]; then
    JAVA_HOME_PATH="$HOMEBREW_JAVA"
    echo "✅ Found Homebrew Java (Apple Silicon): $JAVA_HOME_PATH"
elif [ -d "$HOMEBREW_INTEL_JAVA" ]; then
    JAVA_HOME_PATH="$HOMEBREW_INTEL_JAVA"
    echo "✅ Found Homebrew Java (Intel): $JAVA_HOME_PATH"
else
    echo "❌ Homebrew Java not found. Installing..."
    brew install openjdk@17
    JAVA_HOME_PATH="/opt/homebrew/opt/openjdk@17"
fi

# Step 2: Set up environment variables
echo "🔧 Setting up Java environment variables..."

# Create or update shell configuration
SHELL_CONFIG=""
if [ "$SHELL" = "/bin/zsh" ] || [ "$SHELL" = "/usr/bin/zsh" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [ "$SHELL" = "/bin/bash" ] || [ "$SHELL" = "/usr/bin/bash" ]; then
    SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
    echo "📝 Updating $SHELL_CONFIG..."
    
    # Remove any existing JAVA_HOME entries
    grep -v "JAVA_HOME" "$SHELL_CONFIG" > "${SHELL_CONFIG}.tmp" 2>/dev/null || touch "${SHELL_CONFIG}.tmp"
    mv "${SHELL_CONFIG}.tmp" "$SHELL_CONFIG"
    
    # Add new JAVA_HOME configuration
    echo "" >> "$SHELL_CONFIG"
    echo "# Java Configuration" >> "$SHELL_CONFIG"
    echo "export JAVA_HOME=\"$JAVA_HOME_PATH\"" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$JAVA_HOME/bin:\$PATH\"" >> "$SHELL_CONFIG"
    
    echo "✅ Updated $SHELL_CONFIG with Java configuration"
fi

# Step 3: Set environment for current session
export JAVA_HOME="$JAVA_HOME_PATH"
export PATH="$JAVA_HOME/bin:$PATH"

# Step 4: Create symlink for system-wide Java access
echo "🔗 Creating system-wide Java symlink..."
sudo mkdir -p /Library/Java/JavaVirtualMachines
if [ ! -L "/Library/Java/JavaVirtualMachines/openjdk-17.jdk" ]; then
    sudo ln -sfn "$JAVA_HOME_PATH/libexec/openjdk.jdk" "/Library/Java/JavaVirtualMachines/openjdk-17.jdk"
    echo "✅ Created system-wide Java symlink"
fi

# Step 5: Verify Java installation
echo "🧪 Verifying Java installation..."
echo "JAVA_HOME: $JAVA_HOME"
echo "Java version:"
"$JAVA_HOME/bin/java" -version

# Step 6: Test Gradle compatibility
echo "🔧 Testing Gradle compatibility..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

if [ -d "android" ]; then
    cd android
    echo "Testing Gradle wrapper..."
    ./gradlew --version
    cd ..
fi

echo ""
echo "🎉 Java Runtime setup completed!"
echo ""
echo "📋 Configuration Summary:"
echo "   JAVA_HOME: $JAVA_HOME"
echo "   Java Binary: $JAVA_HOME/bin/java"
echo "   System Symlink: /Library/Java/JavaVirtualMachines/openjdk-17.jdk"
echo ""
echo "🔄 Please restart your terminal or run: source ~/.zshrc"
echo "💡 Then proceed with mobile app building"
