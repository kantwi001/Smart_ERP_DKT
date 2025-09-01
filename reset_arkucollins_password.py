#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from users.models import User

def reset_password():
    """Reset arkucollins password to ensure it works"""
    
    try:
        user = User.objects.get(username='arkucollins')
        
        # Set password explicitly
        user.set_password('admin123')
        user.save()
        
        print("✅ Password reset successfully!")
        print(f"👤 Username: {user.username}")
        print(f"📧 Email: {user.email}")
        print(f"🔑 Password: admin123")
        print(f"🔐 Staff: {user.is_staff}")
        print(f"🔐 Superuser: {user.is_superuser}")
        print(f"🔐 Active: {user.is_active}")
        
        # Test password
        if user.check_password('admin123'):
            print("✅ Password verification successful!")
        else:
            print("❌ Password verification failed!")
            
        return True
        
    except User.DoesNotExist:
        print("❌ arkucollins user not found!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Resetting arkucollins password...")
    print("=" * 40)
    
    success = reset_password()
    
    if success:
        print("\n📱 Try logging in with:")
        print("   Email: arkucollins@gmail.com")
        print("   Password: admin123")
    else:
        print("\n❌ Password reset failed")
