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

from django.contrib.auth.models import User

def create_local_user():
    """Create user on local Django database"""
    
    username = "arkucollins"
    email = "arkucollins@gmail.com"
    password = "admin123"
    
    print("🔧 Creating user on LOCAL Django database...")
    print(f"👤 Username: {username}")
    print(f"📧 Email: {email}")
    
    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print("✅ User already exists!")
            user = User.objects.get(username=username)
        else:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name="Arku",
                last_name="Collins",
                is_staff=True,
                is_superuser=True
            )
            print("✅ User created successfully!")
        
        print(f"🔑 Login credentials:")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Is Staff: {user.is_staff}")
        print(f"   Is Superuser: {user.is_superuser}")
        print(f"   Password: admin123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Local User Creation Script")
    print("=" * 40)
    
    success = create_local_user()
    
    if success:
        print("\n📱 Now try logging into the web app with:")
        print("   Email: arkucollins@gmail.com")
        print("   Password: admin123")
    else:
        print("\n❌ Failed to create user. Check Django setup.")
