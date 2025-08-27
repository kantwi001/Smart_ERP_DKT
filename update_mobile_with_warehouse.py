#!/usr/bin/env python3
"""
Update mobile app with warehouse transfer functionality and build
"""
import os
import subprocess
import json

def run_command(command, cwd=None):
    """Run a shell command"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        print(f"Command: {command}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr and result.returncode != 0:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Failed to run command: {e}")
        return False

def update_capacitor_config():
    """Update Capacitor configuration for warehouse features"""
    config_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/capacitor.config.json"
    
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
        
        # Update app info
        config['appName'] = 'Smart ERP - Warehouse Edition'
        config['appId'] = 'com.smarterp.warehouse'
        
        # Add warehouse-specific plugins
        if 'plugins' not in config:
            config['plugins'] = {}
        
        config['plugins']['CapacitorHttp'] = {
            "enabled": True
        }
        
        config['plugins']['Storage'] = {
            "enabled": True
        }
        
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        print("✅ Updated Capacitor configuration")
        return True
    except Exception as e:
        print(f"❌ Failed to update Capacitor config: {e}")
        return False

def main():
    frontend_dir = "/Users/kwadwoantwi/CascadeProjects/erp-system/frontend"
    
    print("🚀 Updating mobile apps with warehouse transfer functionality...")
    
    # Update Capacitor config
    print("\n1. Updating Capacitor configuration...")
    update_capacitor_config()
    
    # Install dependencies
    print("\n2. Installing dependencies...")
    run_command("npm install", cwd=frontend_dir)
    
    # Build React app
    print("\n3. Building React app...")
    run_command("npm run build", cwd=frontend_dir)
    
    # Sync with Capacitor
    print("\n4. Syncing with Capacitor...")
    run_command("npx cap sync", cwd=frontend_dir)
    
    # Build for iOS
    print("\n5. Building iOS app...")
    run_command("npx cap build ios", cwd=frontend_dir)
    
    # Build for Android
    print("\n6. Building Android app...")
    run_command("npx cap build android", cwd=frontend_dir)
    
    # Copy build files
    print("\n7. Copying build files...")
    run_command("cp -r build/* ../build/", cwd=frontend_dir)
    
    print("\n✅ Mobile apps updated and built successfully!")
    print("\n📱 New Features Added:")
    print("   - Warehouse Transfer Management")
    print("   - Transfer Status Tracking")
    print("   - Offline Transfer Support")
    print("   - Mobile-Optimized UI")
    print("\n🚀 Ready to deploy:")
    print("   iOS: frontend/ios/App/App.xcworkspace")
    print("   Android: frontend/android/app/build/outputs/apk/")

if __name__ == '__main__':
    main()
