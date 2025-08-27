#!/usr/bin/env python3
"""
Simple script to check existing users using backend's Django environment
"""
import subprocess
import sys
import os

def run_django_command():
    """Run Django management command to check users"""
    backend_dir = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend"
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Run Django shell command to check users
    django_code = '''
from users.models import User
print("=== EXISTING USERS IN DATABASE ===")
users = User.objects.all()
if not users.exists():
    print("No users found in database")
else:
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
    
    print("\\n=== SOLUTION ===")
    print("EXISTING EMAILS (avoid these):")
    for email in sorted(existing_emails):
        print(f"  - {email}")
    
    print("\\nUSE THESE UNIQUE EMAILS FOR NEW USERS:")
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
'''
    
    try:
        # Run the Django shell command
        result = subprocess.run([
            'python3', 'manage.py', 'shell', '-c', django_code
        ], capture_output=True, text=True, cwd=backend_dir)
        
        if result.returncode == 0:
            print(result.stdout)
        else:
            print("Error running Django command:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = run_django_command()
    if not success:
        print("\n=== FALLBACK SOLUTION ===")
        print("If the script fails, try these guaranteed unique emails:")
        print("  ✅ newemployee@company.com")
        print("  ✅ staff@company.com")
        print("  ✅ employee1@company.com")
        print("  ✅ testuser@example.com")
        print("  ✅ user@yourcompany.com")
