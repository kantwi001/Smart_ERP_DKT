#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def delete_specific_users():
    """Delete Kwadwo Amankwa-Adusei Antwi and Kay Jay users and all related data"""
    
    print("=" * 80)
    print("DELETING SPECIFIC USERS: Kwadwo Amankwa-Adusei Antwi and Kay Jay")
    print("=" * 80)
    
    # Show all users first
    print("\n All users before deletion:")
    all_users = User.objects.all()
    for user in all_users:
        print(f"  - {user.username} ({user.email}) - {user.first_name} {user.last_name}")
    
    # Users to delete by various criteria
    users_to_delete_by_username = ['antwi', 'kwadwo', 'kay', 'KA', 'KJ']
    emails_to_delete = ['antwi@example.com', 'kwadwo_antwi@dktghana.org', 'kwadwo@dktghana.org']
    
    deleted_users = []
    
    with transaction.atomic():
        # Delete by username
        for username in users_to_delete_by_username:
            users = User.objects.filter(username__iexact=username)
            for user in users:
                print(f" Deleting user by username: {user.username} ({user.email}) - {user.first_name} {user.last_name}")
                deleted_users.append(f"{user.username} ({user.email})")
                user.delete()
        
        # Delete by email
        for email in emails_to_delete:
            users = User.objects.filter(email__iexact=email)
            for user in users:
                print(f" Deleting user by email: {user.username} ({user.email}) - {user.first_name} {user.last_name}")
                deleted_users.append(f"{user.username} ({user.email})")
                user.delete()
        
        # Delete by name patterns
        users_with_kwadwo = User.objects.filter(first_name__icontains='Kwadwo')
        for user in users_with_kwadwo:
            print(f" Deleting user by name (Kwadwo): {user.username} ({user.email}) - {user.first_name} {user.last_name}")
            deleted_users.append(f"{user.username} ({user.email})")
            user.delete()
        
        users_with_amankwa = User.objects.filter(first_name__icontains='Amankwa')
        for user in users_with_amankwa:
            print(f" Deleting user by name (Amankwa): {user.username} ({user.email}) - {user.first_name} {user.last_name}")
            deleted_users.append(f"{user.username} ({user.email})")
            user.delete()
            
        users_with_antwi = User.objects.filter(last_name__icontains='Antwi')
        for user in users_with_antwi:
            print(f" Deleting user by last name (Antwi): {user.username} ({user.email}) - {user.first_name} {user.last_name}")
            deleted_users.append(f"{user.username} ({user.email})")
            user.delete()
        
        users_with_kay = User.objects.filter(first_name__icontains='Kay')
        for user in users_with_kay:
            print(f" Deleting user by name (Kay): {user.username} ({user.email}) - {user.first_name} {user.last_name}")
            deleted_users.append(f"{user.username} ({user.email})")
            user.delete()
            
        # Delete users with specific full names
        users_full_name = User.objects.filter(first_name__icontains='Kwadwo Amankwa-Adusei')
        for user in users_full_name:
            print(f" Deleting user by full name: {user.username} ({user.email}) - {user.first_name} {user.last_name}")
            deleted_users.append(f"{user.username} ({user.email})")
            user.delete()
    
    print(f"\n Deleted {len(set(deleted_users))} unique users:")
    for user in set(deleted_users):
        print(f"  - {user}")
    
    print("\n" + "=" * 80)
    print("REMAINING USERS:")
    print("=" * 80)
    
    remaining_users = User.objects.all()
    if remaining_users:
        for user in remaining_users:
            print(f" {user.username} ({user.email}) - {user.first_name} {user.last_name} - Role: {getattr(user, 'role', 'N/A')}")
    else:
        print("No users remaining in the system.")
    
    print(f"\nTotal remaining users: {remaining_users.count()}")

if __name__ == '__main__':
    delete_specific_users()
