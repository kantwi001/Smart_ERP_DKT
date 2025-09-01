#!/bin/bash

# Fix Mobile App Dependencies Script
# Addresses Java Runtime and Capacitor preferences issues

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

check_java() {
    print_status "Checking Java installation..."
    
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java found: $JAVA_VERSION"
        
        # Check if it's Java 11 or higher (required for Android builds)
        JAVA_MAJOR=$(echo $JAVA_VERSION | cut -d'.' -f1)
        if [ "$JAVA_MAJOR" -ge 11 ]; then
            print_success "Java version is compatible for Android builds"
            return 0
        else
            print_error "Java version $JAVA_VERSION is too old. Need Java 11 or higher."
            return 1
        fi
    else
        print_error "Java not found"
        return 1
    fi
}

install_java_macos() {
    print_status "Installing Java JDK on macOS..."
    
    if command -v brew &> /dev/null; then
        print_status "Using Homebrew to install OpenJDK 17..."
        brew install openjdk@17
        
        # Add to PATH
        echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
        echo 'export JAVA_HOME="/opt/homebrew/opt/openjdk@17"' >> ~/.zshrc
        
        # For current session
        export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
        export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
        
        print_success "Java JDK 17 installed successfully"
    else
        print_error "Homebrew not found. Please install Homebrew first:"
        echo "Run: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
}

fix_capacitor_preferences() {
    print_status "Installing missing @capacitor/preferences dependency..."
    
    cd frontend
    
    # Install the missing dependency
    npm install @capacitor/preferences@^5.0.7
    
    if [ $? -eq 0 ]; then
        print_success "@capacitor/preferences installed successfully"
    else
        print_error "Failed to install @capacitor/preferences"
        exit 1
    fi
    
    cd ..
}

update_android_sdk() {
    print_status "Checking Android SDK setup..."
    
    if [ -z "$ANDROID_HOME" ]; then
        print_status "Setting up Android SDK environment..."
        
        # Common Android SDK locations on macOS
        POSSIBLE_ANDROID_HOMES=(
            "$HOME/Library/Android/sdk"
            "$HOME/Android/Sdk"
            "/usr/local/android-sdk"
        )
        
        for path in "${POSSIBLE_ANDROID_HOMES[@]}"; do
            if [ -d "$path" ]; then
                export ANDROID_HOME="$path"
                export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"
                echo "export ANDROID_HOME=\"$path\"" >> ~/.zshrc
                echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools\"" >> ~/.zshrc
                print_success "Android SDK found at: $path"
                break
            fi
        done
        
        if [ -z "$ANDROID_HOME" ]; then
            print_error "Android SDK not found. Please install Android Studio or Android SDK."
            print_status "You can download it from: https://developer.android.com/studio"
            return 1
        fi
    else
        print_success "Android SDK already configured: $ANDROID_HOME"
    fi
}

main() {
    print_status "Starting mobile app dependency fixes..."
    
    # Check and install Java if needed
    if ! check_java; then
        print_status "Java installation required for Android builds"
        install_java_macos
        
        # Verify installation
        if ! check_java; then
            print_error "Java installation failed"
            exit 1
        fi
    fi
    
    # Fix Capacitor preferences dependency
    fix_capacitor_preferences
    
    # Update Android SDK setup
    update_android_sdk
    
    print_success "All dependencies fixed successfully!"
    print_status "You can now run the mobile app build script:"
    echo "  ./build_mobile_app_complete.sh"
    
    print_status "Note: You may need to restart your terminal for environment changes to take effect."
}

main "$@"
