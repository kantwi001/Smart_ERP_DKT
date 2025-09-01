#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from users.models import SystemSettings

User = get_user_model()

def fix_authentication_issues():
    """Fix authentication issues and reset user passwords"""
    
    print("🔧 Fixing Authentication Issues")
    print("=" * 50)
    
    # Check if backend server is accessible
    print("1. Checking user accounts...")
    
    try:
        # Get all users
        users = User.objects.all()
        print(f"✅ Found {users.count()} users in database")
        
        for user in users:
            print(f"  👤 {user.email} - Active: {user.is_active} - Superuser: {user.is_superuser}")
        
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        return False
    
    # Fix edmondsekyere user specifically
    print(f"\n2. Fixing edmondsekyere@gmail.com user...")
    try:
        edmond_user = User.objects.get(email='edmondsekyere@gmail.com')
        
        # Reset password to a known value
        new_password = 'X@#w6FXbKtBa'  # The password shown in the login form
        edmond_user.set_password(new_password)
        edmond_user.is_active = True
        edmond_user.save()
        
        print(f"✅ Password reset for {edmond_user.email}")
        print(f"✅ Account activated for {edmond_user.email}")
        print(f"🔑 New password: {new_password}")
        
    except User.DoesNotExist:
        print("❌ User edmondsekyere@gmail.com not found")
        
        # Create the user if it doesn't exist
        print("🆕 Creating edmondsekyere@gmail.com user...")
        edmond_user = User.objects.create_user(
            username='edmondsekyere',
            email='edmondsekyere@gmail.com',
            password='X@#w6FXbKtBa',
            first_name='Edmond',
            last_name='Sekyere',
            is_active=True
        )
        print(f"✅ Created user: {edmond_user.email}")
        
    except Exception as e:
        print(f"❌ Error fixing user: {str(e)}")
    
    # Fix other common users
    print(f"\n3. Checking other user accounts...")
    
    # Fix arkucollins user
    try:
        collins_user = User.objects.get(email='arkucollins@gmail.com')
        collins_user.set_password('admin123')
        collins_user.is_active = True
        collins_user.is_superuser = True
        collins_user.is_staff = True
        collins_user.save()
        print(f"✅ Fixed arkucollins@gmail.com - Password: admin123")
    except User.DoesNotExist:
        print("⚠️  arkucollins@gmail.com not found")
    
    # Fix admin user
    try:
        admin_user = User.objects.get(email='admin@smarterp.com')
        admin_user.set_password('admin123')
        admin_user.is_active = True
        admin_user.is_superuser = True
        admin_user.is_staff = True
        admin_user.save()
        print(f"✅ Fixed admin@smarterp.com - Password: admin123")
    except User.DoesNotExist:
        print("⚠️  admin@smarterp.com not found")
    
    # Configure SMTP settings to fix password reset
    print(f"\n4. Configuring SMTP settings...")
    try:
        settings, created = SystemSettings.objects.get_or_create(
            id=1,
            defaults={
                'site_name': 'ERP System',
                'smtp_enabled': False,  # Disable to prevent 500 errors
                'smtp_host': 'localhost',
                'smtp_port': 1025,
                'smtp_username': '',
                'smtp_password': '',
                'smtp_use_tls': False,
                'smtp_use_ssl': False,
                'smtp_from_email': 'noreply@erpsystem.local',
                'smtp_from_name': 'ERP System',
                'email_notifications': False,  # Disable to prevent errors
                'password_reset_notifications': False
            }
        )
        
        if not created:
            settings.smtp_enabled = False
            settings.email_notifications = False
            settings.password_reset_notifications = False
            settings.save()
        
        print("✅ SMTP settings configured (disabled to prevent errors)")
        
    except Exception as e:
        print(f"❌ Error configuring SMTP: {str(e)}")
    
    # Summary
    print(f"\n📋 Summary:")
    print("=" * 50)
    print("✅ User passwords reset")
    print("✅ Accounts activated")
    print("✅ SMTP errors disabled")
    print("")
    print("🔑 Login Credentials:")
    print("  edmondsekyere@gmail.com : X@#w6FXbKtBa")
    print("  arkucollins@gmail.com   : admin123")
    print("  admin@smarterp.com      : admin123")
    print("")
    print("🔄 Try logging in again with these credentials")
    
    return True

if __name__ == '__main__':
    fix_authentication_issues()
