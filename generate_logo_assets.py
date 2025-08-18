#!/usr/bin/env python3
"""
Smart ERP Software Logo Asset Generator
Generates PNG icons and favicons from the actual Smart ERP logo for web and mobile apps.
"""

import os
from PIL import Image
import shutil

def resize_logo_for_mobile(source_logo_path, output_path, size):
    """Resize the actual Smart ERP logo to specified size for mobile apps."""
    
    # Open the actual logo file
    with Image.open(source_logo_path) as img:
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Resize with high quality
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save the resized icon
        resized.save(output_path, 'PNG', optimize=True)
        print(f"✅ Generated {size}x{size} icon: {output_path}")

def generate_android_icons():
    """Generate Android app icons from the actual Smart ERP logo."""
    
    source_logo = "frontend/public/smart-erp-logo.png"
    
    if not os.path.exists(source_logo):
        print(f"❌ Source logo not found: {source_logo}")
        return False
    
    # Android icon sizes and directories
    android_icons = [
        ("android/app/src/main/res/mipmap-mdpi", 48),
        ("android/app/src/main/res/mipmap-hdpi", 72),
        ("android/app/src/main/res/mipmap-xhdpi", 96),
        ("android/app/src/main/res/mipmap-xxhdpi", 144),
        ("android/app/src/main/res/mipmap-xxxhdpi", 192),
    ]
    
    for icon_dir, size in android_icons:
        full_dir = f"frontend/{icon_dir}"
        os.makedirs(full_dir, exist_ok=True)
        
        # Generate main launcher icon
        resize_logo_for_mobile(source_logo, f"{full_dir}/ic_launcher.png", size)
        
        # Generate round launcher icon
        resize_logo_for_mobile(source_logo, f"{full_dir}/ic_launcher_round.png", size)
        
        # Generate foreground icon (same as main for now)
        resize_logo_for_mobile(source_logo, f"{full_dir}/ic_launcher_foreground.png", size)
    
    print("✅ Android icons generated successfully!")
    return True

def generate_ios_icons():
    """Generate iOS app icons from the actual Smart ERP logo."""
    
    source_logo = "frontend/public/smart-erp-logo.png"
    
    if not os.path.exists(source_logo):
        print(f"❌ Source logo not found: {source_logo}")
        return False
    
    # iOS icon sizes
    ios_icons = [
        ("AppIcon-20.png", 20),
        ("AppIcon-20@2x.png", 40),
        ("AppIcon-20@3x.png", 60),
        ("AppIcon-29.png", 29),
        ("AppIcon-29@2x.png", 58),
        ("AppIcon-29@3x.png", 87),
        ("AppIcon-40.png", 40),
        ("AppIcon-40@2x.png", 80),
        ("AppIcon-40@3x.png", 120),
        ("AppIcon-60@2x.png", 120),
        ("AppIcon-60@3x.png", 180),
        ("AppIcon-76.png", 76),
        ("AppIcon-76@2x.png", 152),
        ("AppIcon-83.5@2x.png", 167),
        ("AppIcon-512@2x.png", 1024),
    ]
    
    ios_dir = "frontend/ios/App/App/Assets.xcassets/AppIcon.appiconset"
    os.makedirs(ios_dir, exist_ok=True)
    
    for icon_name, size in ios_icons:
        output_path = f"{ios_dir}/{icon_name}"
        resize_logo_for_mobile(source_logo, output_path, size)
    
    print("✅ iOS icons generated successfully!")
    return True

def generate_web_icons():
    """Generate web app icons from the actual Smart ERP logo."""
    
    source_logo = "frontend/public/smart-erp-logo.png"
    
    if not os.path.exists(source_logo):
        print(f"❌ Source logo not found: {source_logo}")
        return False
    
    # Web icon sizes
    web_icons = [
        ("favicon.ico", 32),
        ("logo192.png", 192),
        ("logo512.png", 512),
    ]
    
    for icon_name, size in web_icons:
        output_path = f"frontend/public/{icon_name}"
        if icon_name.endswith('.ico'):
            # For favicon, save as PNG first then convert
            temp_png = f"frontend/public/favicon.png"
            resize_logo_for_mobile(source_logo, temp_png, size)
            
            # Convert PNG to ICO
            with Image.open(temp_png) as img:
                img.save(output_path, format='ICO', sizes=[(size, size)])
            os.remove(temp_png)  # Clean up temp file
        else:
            resize_logo_for_mobile(source_logo, output_path, size)
    
    print("✅ Web icons generated successfully!")
    return True

def main():
    """Generate all app icons from the actual Smart ERP Software logo."""
    
    print("🚀 Smart ERP Software Logo Asset Generator")
    print("=" * 50)
    
    # Change to project directory
    if os.path.exists("/Users/kwadwoantwi/CascadeProjects/erp-system"):
        os.chdir("/Users/kwadwoantwi/CascadeProjects/erp-system")
    
    # Check if source logo exists
    if not os.path.exists("frontend/public/smart-erp-logo.png"):
        print("❌ Smart ERP logo not found at frontend/public/smart-erp-logo.png")
        print("Please ensure your logo file is placed in the correct location.")
        return
    
    print("📱 Generating mobile app icons from your actual Smart ERP logo...")
    
    # Generate all icon sets
    android_success = generate_android_icons()
    ios_success = generate_ios_icons()
    web_success = generate_web_icons()
    
    if android_success and ios_success and web_success:
        print("\n🎉 All icons generated successfully!")
        print("📱 Ready to rebuild mobile apps with your official Smart ERP logo!")
        print("\nNext steps:")
        print("1. Rebuild Android app: cd frontend && npx cap sync android && npx cap run android")
        print("2. Rebuild iOS app: cd frontend && npx cap sync ios && npx cap run ios")
    else:
        print("\n❌ Some icons failed to generate. Please check the errors above.")

if __name__ == "__main__":
    main()
