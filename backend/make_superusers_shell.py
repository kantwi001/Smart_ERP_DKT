#!/usr/bin/env python3
"""
Django shell script to make Collins Arku and Edmond Sekyere superusers
Run this with: python manage.py shell < make_superusers_shell.py
"""

from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

print("=" * 80)
print("MAKING COLLINS ARKU AND EDMOND SEKYERE SUPERUSERS")
print("=" * 80)

# Target users to make superusers
target_users = ['Collins Arku', 'Edmond Sekyere']

for target_name in target_users:
    print(f"\n🔍 Searching for user: {target_name}")
    
    name_parts = target_name.split()
    first_name = name_parts[0]
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
    
    # Try multiple search strategies
    user = None
    
    # Strategy 1: Exact first and last name match
    try:
        user = User.objects.get(
            first_name__iexact=first_name, 
            last_name__iexact=last_name
        )
        print(f"✅ Found by name: {user.username} ({user.first_name} {user.last_name})")
    except User.DoesNotExist:
        pass
    except User.MultipleObjectsReturned:
        users = User.objects.filter(
            first_name__iexact=first_name, 
            last_name__iexact=last_name
        )
        print(f"⚠️  Multiple users found with name '{target_name}':")
        for u in users:
            print(f"   - {u.username} ({u.first_name} {u.last_name}) - {u.email}")
        user = users.first()  # Take the first one
    
    # Strategy 2: Username contains first name
    if not user:
        try:
            user = User.objects.get(username__icontains=first_name.lower())
            print(f"✅ Found by username: {user.username}")
        except User.DoesNotExist:
            pass
        except User.MultipleObjectsReturned:
            users = User.objects.filter(username__icontains=first_name.lower())
            user = users.first()
    
    # Strategy 3: Broader search
    if not user:
        users = User.objects.filter(
            Q(first_name__icontains=first_name) | 
            Q(last_name__icontains=last_name) |
            Q(username__icontains=first_name.lower())
        )
        if users.exists():
            print(f"🔍 Found possible matches:")
            for u in users:
                print(f"   - {u.username} ({u.first_name} {u.last_name}) - {u.email}")
            user = users.first()
    
    if not user:
        print(f"❌ User '{target_name}' not found in the system")
        continue
    
    # Display current status
    print(f"📋 Current status for {user.username}:")
    print(f"   - Username: {user.username}")
    print(f"   - Name: {user.first_name} {user.last_name}")
    print(f"   - Email: {user.email}")
    print(f"   - Is Superuser: {'Yes' if user.is_superuser else 'No'}")
    print(f"   - Is Staff: {'Yes' if user.is_staff else 'No'}")
    print(f"   - Role: {getattr(user, 'role', 'N/A')}")
    print(f"   - Is Active: {'Yes' if user.is_active else 'No'}")
    
    # Make superuser
    if not user.is_superuser:
        user.is_superuser = True
        user.is_staff = True
        if hasattr(user, 'role'):
            user.role = 'superadmin'
        user.save()
        print(f"🚀 {user.username} ({user.first_name} {user.last_name}) is now a SUPERUSER!")
    else:
        print(f"ℹ️  {user.username} is already a superuser")
    
    print("-" * 50)

# List all current superusers
print("\n" + "=" * 80)
print("CURRENT SUPERUSERS IN THE SYSTEM")
print("=" * 80)

superusers = User.objects.filter(is_superuser=True).order_by('id')

if superusers.exists():
    print(f"Total Superusers: {superusers.count()}")
    print("-" * 80)
    
    for user in superusers:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Name: {user.first_name} {user.last_name}")
        print(f"Email: {user.email}")
        print(f"Role: {getattr(user, 'role', 'N/A')}")
        print(f"Is Active: {'Yes' if user.is_active else 'No'}")
        print("-" * 40)
else:
    print("No superusers found in the system.")

print("\n✅ SUPERUSER UPDATE COMPLETE!")
print("=" * 80)
