#!/usr/bin/env python3
"""
Check existing users in the database to debug duplicate email issues
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def check_existing_users():
    """Check all existing users in the database"""
    print("=== EXISTING USERS IN DATABASE ===")
    users = User.objects.all()
    
    if not users.exists():
        print("No users found in database")
        return
    
    print(f"Total users: {users.count()}")
    print("-" * 50)
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Role: {user.role}")
        print(f"Department: {user.department}")
        print(f"Active: {user.is_active}")
        print(f"Superuser: {user.is_superuser}")
        print("-" * 30)

if __name__ == "__main__":
    check_existing_users()
