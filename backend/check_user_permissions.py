#!/usr/bin/env python3
"""
Check user permissions for system settings access
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, SystemSettings
from django.contrib.auth import get_user_model

def check_user_permissions():
    """Check user permissions and system settings access"""
    print("🔍 Checking User Permissions for System Settings")
    print("=" * 60)
    
    # List all users
    users = User.objects.all()
    print(f"📊 Total users in system: {users.count()}")
    
    superusers = users.filter(is_superuser=True)
    print(f"👑 Superusers: {superusers.count()}")
    
    for user in superusers:
        print(f"   - {user.username} ({user.email}) - Role: {user.role}")
    
    # Check for users with superadmin role
    superadmins = users.filter(role='superadmin')
    print(f"🔐 Users with superadmin role: {superadmins.count()}")
    
    for user in superadmins:
        print(f"   - {user.username} ({user.email}) - Superuser: {user.is_superuser}")
    
    # Check system settings
    try:
        settings = SystemSettings.get_settings()
        print(f"\n⚙️  System Settings:")
        print(f"   - SMTP Enabled: {settings.smtp_enabled}")
        print(f"   - SMTP Host: {settings.smtp_host}")
        print(f"   - Site Name: {settings.site_name}")
        print(f"   - Updated by: {settings.updated_by}")
    except Exception as e:
        print(f"❌ Error accessing system settings: {e}")
    
    # Recommend actions
    print(f"\n💡 Recommendations:")
    if not superusers.exists():
        print("   - No superusers found. Create a superuser account.")
    
    if not superadmins.exists():
        print("   - No users with 'superadmin' role. Assign superadmin role to a user.")
    
    # Show login credentials for testing
    print(f"\n🔑 For testing, use one of these accounts:")
    for user in superusers:
        print(f"   - Username: {user.username}")
        print(f"     Email: {user.email}")
        print(f"     Role: {user.role}")
        print(f"     Superuser: {user.is_superuser}")
        print()

def create_superuser_if_needed():
    """Create a superuser if none exists"""
    if not User.objects.filter(is_superuser=True).exists():
        print("🔧 Creating superuser account...")
        user = User.objects.create_superuser(
            username='admin',
            email='admin@erp.com',
            password='admin123',
            role='superadmin'
        )
        print(f"✅ Created superuser: {user.username} / admin123")
        return user
    else:
        print("✅ Superuser already exists")
        return User.objects.filter(is_superuser=True).first()

def main():
    print("🚀 ERP System User Permissions Check")
    print("=" * 50)
    
    # Check current permissions
    check_user_permissions()
    
    # Create superuser if needed
    superuser = create_superuser_if_needed()
    
    print("\n" + "=" * 50)
    print("📋 Summary:")
    print("✅ User permissions checked")
    print("✅ Superuser account verified")
    print("\n💡 To fix SMTP settings save:")
    print("1. Log in with a superuser account")
    print("2. Navigate to System Settings")
    print("3. Try saving SMTP settings again")
    print(f"\n🔑 Test Login Credentials:")
    print(f"   Username: {superuser.username}")
    print(f"   Email: {superuser.email}")
    print(f"   Password: admin123 (if newly created)")

if __name__ == "__main__":
    main()
