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

from users.models import User  # Use custom User model
from django.db import connection

def check_database():
    """Check existing PostgreSQL database and users"""
    
    print("🔍 Checking PostgreSQL Database: erp_system")
    print("=" * 50)
    
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Database connected: {version[0]}")
        
        # Check existing users
        users = User.objects.all()
        print(f"\n👥 Found {users.count()} users in database:")
        
        for user in users:
            print(f"   • {user.username} ({user.email}) - Staff: {user.is_staff}, Super: {user.is_superuser}")
        
        # Check if arkucollins exists
        if User.objects.filter(username='arkucollins').exists():
            user = User.objects.get(username='arkucollins')
            print(f"\n✅ arkucollins user found:")
            print(f"   Email: {user.email}")
            print(f"   Staff: {user.is_staff}")
            print(f"   Superuser: {user.is_superuser}")
            print(f"   Active: {user.is_active}")
            return True
        else:
            print(f"\n❌ arkucollins user NOT found")
            return False
            
    except Exception as e:
        print(f"❌ Database error: {e}")
        print("💡 Make sure PostgreSQL is running and database exists")
        return False

def create_arkucollins_if_missing():
    """Create arkucollins user if missing"""
    
    try:
        user, created = User.objects.get_or_create(
            username='arkucollins',
            defaults={
                'email': 'arkucollins@gmail.com',
                'first_name': 'Arku',
                'last_name': 'Collins',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        
        if created:
            user.set_password('admin123')
            user.save()
            print("✅ Created arkucollins user with admin123 password")
        else:
            # Update password just in case
            user.set_password('admin123')
            user.save()
            print("✅ Updated arkucollins password to admin123")
            
        return True
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Database Check Script")
    print("=" * 40)
    
    user_exists = check_database()
    
    if not user_exists:
        print("\n🔧 Creating arkucollins user...")
        success = create_arkucollins_if_missing()
        
        if success:
            print("\n📱 Login credentials:")
            print("   Email: arkucollins@gmail.com")
            print("   Password: admin123")
    else:
        print("\n📱 Use existing login credentials:")
        print("   Email: arkucollins@gmail.com")
        print("   Password: admin123")
