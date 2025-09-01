#!/bin/bash

echo "☕ Java 17 Installation Script for macOS"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if Homebrew is installed
check_homebrew() {
    if command -v brew >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Homebrew is installed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Homebrew not found${NC}"
        echo -e "${BLUE}Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        fi
        
        return $?
    fi
}

# Function to install Java 17
install_java17() {
    echo -e "${BLUE}📦 Installing OpenJDK 17...${NC}"
    
    # Update Homebrew first
    brew update
    
    # Install OpenJDK 17
    brew install openjdk@17
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ OpenJDK 17 installed successfully${NC}"
        
        # Create symlink for system Java wrappers
        sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk 2>/dev/null || true
        
        return 0
    else
        echo -e "${RED}❌ Failed to install OpenJDK 17${NC}"
        return 1
    fi
}

# Function to configure Java environment
configure_java_env() {
    echo -e "${BLUE}🔧 Configuring Java environment...${NC}"
    
    # Determine the correct Java path
    if [[ $(uname -m) == 'arm64' ]]; then
        JAVA_HOME_PATH="/opt/homebrew/opt/openjdk@17"
        JAVA_BIN_PATH="/opt/homebrew/opt/openjdk@17/bin"
    else
        JAVA_HOME_PATH="/usr/local/opt/openjdk@17"
        JAVA_BIN_PATH="/usr/local/opt/openjdk@17/bin"
    fi
    
    # Detect shell and configure accordingly
    if [[ $SHELL == *"zsh"* ]]; then
        SHELL_CONFIG="$HOME/.zshrc"
        echo -e "${BLUE}Configuring for Zsh...${NC}"
    elif [[ $SHELL == *"bash"* ]]; then
        SHELL_CONFIG="$HOME/.bash_profile"
        echo -e "${BLUE}Configuring for Bash...${NC}"
    else
        SHELL_CONFIG="$HOME/.profile"
        echo -e "${BLUE}Configuring for default shell...${NC}"
    fi
    
    # Add Java configuration to shell profile
    echo "" >> "$SHELL_CONFIG"
    echo "# Java 17 Configuration (added by install_java17_macos.sh)" >> "$SHELL_CONFIG"
    echo "export JAVA_HOME=\"$JAVA_HOME_PATH\"" >> "$SHELL_CONFIG"
    echo "export PATH=\"$JAVA_BIN_PATH:\$PATH\"" >> "$SHELL_CONFIG"
    
    # Apply changes to current session
    export JAVA_HOME="$JAVA_HOME_PATH"
    export PATH="$JAVA_BIN_PATH:$PATH"
    
    echo -e "${GREEN}✅ Java environment configured${NC}"
    echo -e "${YELLOW}📝 Added configuration to: $SHELL_CONFIG${NC}"
}

# Function to verify Java installation
verify_java() {
    echo -e "${BLUE}🔍 Verifying Java installation...${NC}"
    
    # Source the shell configuration
    if [[ $SHELL == *"zsh"* ]]; then
        source ~/.zshrc 2>/dev/null || true
    elif [[ $SHELL == *"bash"* ]]; then
        source ~/.bash_profile 2>/dev/null || true
    fi
    
    # Check Java version
    if command -v java >/dev/null 2>&1; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        echo -e "${GREEN}✅ Java is available: $JAVA_VERSION${NC}"
        
        if java -version 2>&1 | grep -q "17\."; then
            echo -e "${GREEN}✅ Java 17 is properly configured${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠️  Java 17 not detected as default version${NC}"
            echo -e "${YELLOW}   You may need to restart your terminal${NC}"
        fi
    else
        echo -e "${RED}❌ Java command not found${NC}"
        return 1
    fi
    
    # Check JAVA_HOME
    if [ -n "$JAVA_HOME" ] && [ -d "$JAVA_HOME" ]; then
        echo -e "${GREEN}✅ JAVA_HOME is set: $JAVA_HOME${NC}"
    else
        echo -e "${YELLOW}⚠️  JAVA_HOME not properly set${NC}"
    fi
}

# Function to provide manual installation instructions
manual_instructions() {
    echo ""
    echo -e "${BLUE}📋 Manual Installation Instructions:${NC}"
    echo ""
    echo -e "${YELLOW}If the automatic installation fails, you can install Java 17 manually:${NC}"
    echo ""
    echo "1. Download Oracle JDK 17:"
    echo "   https://www.oracle.com/java/technologies/downloads/#java17"
    echo ""
    echo "2. Or use SDKMAN:"
    echo "   curl -s \"https://get.sdkman.io\" | bash"
    echo "   source ~/.sdkman/bin/sdkman-init.sh"
    echo "   sdk install java 17.0.8-oracle"
    echo ""
    echo "3. Or use Homebrew manually:"
    echo "   brew install openjdk@17"
    echo "   echo 'export PATH=\"/opt/homebrew/opt/openjdk@17/bin:\$PATH\"' >> ~/.zshrc"
    echo "   echo 'export JAVA_HOME=\"/opt/homebrew/opt/openjdk@17\"' >> ~/.zshrc"
    echo ""
    echo -e "${YELLOW}After installation, restart your terminal and run:${NC}"
    echo "   java -version"
    echo ""
}

# Main installation process
main() {
    echo -e "${BLUE}Starting Java 17 installation process...${NC}"
    echo ""
    
    # Check current Java status
    if command -v java >/dev/null 2>&1; then
        CURRENT_JAVA=$(java -version 2>&1 | head -n 1)
        echo -e "${BLUE}Current Java: $CURRENT_JAVA${NC}"
        
        if java -version 2>&1 | grep -q "17\."; then
            echo -e "${GREEN}✅ Java 17 is already installed and active${NC}"
            echo -e "${BLUE}No installation needed. You can proceed with mobile app building.${NC}"
            exit 0
        fi
    else
        echo -e "${YELLOW}No Java installation detected${NC}"
    fi
    
    echo ""
    
    # Step 1: Check/Install Homebrew
    echo -e "${BLUE}Step 1: Checking Homebrew...${NC}"
    if ! check_homebrew; then
        echo -e "${RED}❌ Failed to install Homebrew${NC}"
        manual_instructions
        exit 1
    fi
    
    echo ""
    
    # Step 2: Install Java 17
    echo -e "${BLUE}Step 2: Installing Java 17...${NC}"
    if ! install_java17; then
        echo -e "${RED}❌ Failed to install Java 17${NC}"
        manual_instructions
        exit 1
    fi
    
    echo ""
    
    # Step 3: Configure environment
    echo -e "${BLUE}Step 3: Configuring environment...${NC}"
    configure_java_env
    
    echo ""
    
    # Step 4: Verify installation
    echo -e "${BLUE}Step 4: Verifying installation...${NC}"
    verify_java
    
    echo ""
    echo -e "${GREEN}🎉 Java 17 Installation Complete!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Restart your terminal or run: source ~/.zshrc"
    echo "2. Verify Java 17: java -version"
    echo "3. Run the mobile build script: ./fix_mobile_build_issues_updated.sh"
    echo ""
    echo -e "${BLUE}💡 If you encounter issues:${NC}"
    echo "- Restart your terminal completely"
    echo "- Check that JAVA_HOME is set: echo \$JAVA_HOME"
    echo "- Verify Java 17: java -version"
    echo ""
}

# Run main function
main "$@"
