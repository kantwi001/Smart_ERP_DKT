#!/usr/bin/env python3
"""
Clear duplicate users and show existing emails to fix user creation conflicts
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

def main():
    """Check existing users and provide solution"""
    print("=== EXISTING USERS IN DATABASE ===")
    users = User.objects.all()
    
    if not users.exists():
        print("No users found in database")
        return
    
    print(f"Total users: {users.count()}")
    print("-" * 50)
    
    existing_emails = []
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Role: {user.role}")
        print(f"Active: {user.is_active}")
        print("-" * 30)
        existing_emails.append(user.email.lower())
    
    print("\n=== SOLUTION ===")
    print("EXISTING EMAILS (avoid these):")
    for email in sorted(existing_emails):
        print(f"  - {email}")
    
    print("\nUSE THESE UNIQUE EMAILS FOR NEW USERS:")
    suggested_emails = [
        "newemployee@company.com",
        "staff@company.com", 
        "employee1@company.com",
        "testuser@example.com",
        "user@yourcompany.com",
        f"user{users.count() + 1}@company.com"
    ]
    
    for email in suggested_emails:
        if email.lower() not in existing_emails:
            print(f"  ✅ {email}")
    
    # Option to clear test users (keep only superuser)
    print(f"\n=== OPTIONAL: CLEAR TEST USERS ===")
    test_users = users.filter(is_superuser=False)
    if test_users.exists():
        print(f"Found {test_users.count()} non-superuser accounts")
        response = input("Delete all non-superuser accounts? (y/N): ").strip().lower()
        if response == 'y':
            deleted_count = test_users.count()
            test_users.delete()
            print(f"✅ Deleted {deleted_count} test users")
            print("You can now create users with any email!")
        else:
            print("Keeping existing users. Use unique emails from list above.")
    else:
        print("Only superuser accounts found - you can create users with any email!")

if __name__ == "__main__":
    main()
