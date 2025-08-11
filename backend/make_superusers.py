#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

def make_superusers():
    """Make Collins Arku and Edmond Sekyere superusers"""
    
    print("=" * 80)
    print("MAKING USERS SUPERUSERS")
    print("=" * 80)
    
    # Target users to make superusers
    target_users = ['Collins Arku', 'Edmond Sekyere']
    
    for target_name in target_users:
        print(f"\nSearching for user: {target_name}")
        
        # Try to find user by full name (first_name + last_name)
        name_parts = target_name.split()
        if len(name_parts) >= 2:
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:])
            
            try:
                # Try to find by first and last name
                user = User.objects.get(first_name__iexact=first_name, last_name__iexact=last_name)
                print(f"Found user by name: {user.username} ({user.first_name} {user.last_name})")
            except User.DoesNotExist:
                # Try to find by username (in case username matches the name)
                try:
                    user = User.objects.get(username__icontains=first_name.lower())
                    print(f"Found user by username: {user.username}")
                except User.DoesNotExist:
                    print(f"❌ User '{target_name}' not found in the system")
                    continue
            except User.MultipleObjectsReturned:
                print(f"⚠️  Multiple users found with name '{target_name}'. Please be more specific.")
                users = User.objects.filter(first_name__iexact=first_name, last_name__iexact=last_name)
                for u in users:
                    print(f"   - {u.username} ({u.first_name} {u.last_name}) - {u.email}")
                continue
        else:
            # Try to find by username
            try:
                user = User.objects.get(username__iexact=target_name.replace(' ', '').lower())
                print(f"Found user by username: {user.username}")
            except User.DoesNotExist:
                print(f"❌ User '{target_name}' not found in the system")
                continue
        
        # Check current status
        print(f"Current status:")
        print(f"  - Is Superuser: {user.is_superuser}")
        print(f"  - Is Staff: {user.is_staff}")
        print(f"  - Role: {user.role if hasattr(user, 'role') else 'N/A'}")
        
        # Make superuser
        if not user.is_superuser:
            user.is_superuser = True
            user.is_staff = True
            if hasattr(user, 'role'):
                user.role = 'superadmin'
            user.save()
            print(f"✅ {user.username} ({user.first_name} {user.last_name}) is now a SUPERUSER!")
        else:
            print(f"ℹ️  {user.username} is already a superuser")
        
        print("-" * 50)
    
    print("\n" + "=" * 80)
    print("SUPERUSER UPDATE COMPLETE")
    print("=" * 80)

def list_all_superusers():
    """List all current superusers"""
    print("\n" + "=" * 80)
    print("CURRENT SUPERUSERS IN THE SYSTEM")
    print("=" * 80)
    
    superusers = User.objects.filter(is_superuser=True).order_by('id')
    
    if not superusers:
        print("No superusers found in the system.")
        return
    
    print(f"Total Superusers: {superusers.count()}")
    print("-" * 80)
    
    for user in superusers:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Email: {user.email}")
        print(f"Role: {user.role if hasattr(user, 'role') else 'N/A'}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Active: {user.is_active}")
        print("-" * 40)

if __name__ == "__main__":
    make_superusers()
    list_all_superusers()
