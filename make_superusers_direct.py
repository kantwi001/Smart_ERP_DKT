#!/usr/bin/env python3
import os
import sys
import django
from pathlib import Path

# Set up Django environment
backend_path = Path('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
sys.path.insert(0, str(backend_path))
os.chdir(backend_path)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

# Now import Django models
try:
    from django.contrib.auth import get_user_model
    from django.db.models import Q
    
    User = get_user_model()
    print("✅ User model imported successfully")
except Exception as e:
    print(f"❌ Failed to import User model: {e}")
    sys.exit(1)

def make_superusers():
    """Make Collins Arku and Edmond Sekyere superusers"""
    
    print("\n" + "=" * 80)
    print("MAKING COLLINS ARKU AND EDMOND SEKYERE SUPERUSERS")
    print("=" * 80)
    
    # First, let's see all users in the system
    print("\n🔍 All users in the system:")
    all_users = User.objects.all().order_by('id')
    for u in all_users:
        print(f"   - ID: {u.id}, Username: {u.username}, Name: {u.first_name} {u.last_name}, Email: {u.email}")
    
    # Target users to make superusers
    target_users = ['Collins Arku', 'Edmond Sekyere']
    
    for target_name in target_users:
        print(f"\n🔍 Searching for user: {target_name}")
        
        name_parts = target_name.split()
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
        
        user = None
        
        # Strategy 1: Exact first and last name match (case insensitive)
        try:
            user = User.objects.get(
                first_name__iexact=first_name, 
                last_name__iexact=last_name
            )
            print(f"✅ Found by exact name: {user.username} ({user.first_name} {user.last_name})")
        except User.DoesNotExist:
            print(f"   - No exact name match found")
        except User.MultipleObjectsReturned:
            users = User.objects.filter(
                first_name__iexact=first_name, 
                last_name__iexact=last_name
            )
            print(f"⚠️  Multiple users found with exact name '{target_name}':")
            for u in users:
                print(f"     - {u.username} ({u.first_name} {u.last_name}) - {u.email}")
            user = users.first()
        
        # Strategy 2: Username contains first name
        if not user:
            try:
                user = User.objects.get(username__icontains=first_name.lower())
                print(f"✅ Found by username containing '{first_name}': {user.username}")
            except User.DoesNotExist:
                print(f"   - No username match found for '{first_name}'")
            except User.MultipleObjectsReturned:
                users = User.objects.filter(username__icontains=first_name.lower())
                print(f"⚠️  Multiple users found with username containing '{first_name}':")
                for u in users:
                    print(f"     - {u.username} ({u.first_name} {u.last_name})")
                user = users.first()
        
        # Strategy 3: Partial name match
        if not user:
            users = User.objects.filter(
                Q(first_name__icontains=first_name) | 
                Q(last_name__icontains=last_name) |
                Q(username__icontains=first_name.lower())
            )
            if users.exists():
                print(f"🔍 Found possible matches for '{target_name}':")
                for u in users:
                    print(f"     - {u.username} ({u.first_name} {u.last_name}) - {u.email}")
                
                # Ask user to confirm or take the first match
                user = users.first()
                print(f"   Taking first match: {user.username}")
        
        if not user:
            print(f"❌ User '{target_name}' not found in the system")
            print(f"   Available users:")
            for u in User.objects.all()[:10]:  # Show first 10 users
                print(f"     - {u.username} ({u.first_name} {u.last_name})")
            continue
        
        # Display current status
        print(f"\n📋 Current status for {user.username}:")
        print(f"   - Username: {user.username}")
        print(f"   - Name: {user.first_name} {user.last_name}")
        print(f"   - Email: {user.email or 'N/A'}")
        print(f"   - Is Superuser: {'Yes' if user.is_superuser else 'No'}")
        print(f"   - Is Staff: {'Yes' if user.is_staff else 'No'}")
        print(f"   - Role: {getattr(user, 'role', 'N/A')}")
        print(f"   - Is Active: {'Yes' if user.is_active else 'No'}")
        
        # Make superuser
        if not user.is_superuser:
            try:
                user.is_superuser = True
                user.is_staff = True
                if hasattr(user, 'role'):
                    user.role = 'superadmin'
                user.save()
                print(f"🚀 SUCCESS: {user.username} ({user.first_name} {user.last_name}) is now a SUPERUSER!")
            except Exception as e:
                print(f"❌ Failed to update {user.username}: {e}")
        else:
            print(f"ℹ️  {user.username} is already a superuser")
        
        print("-" * 50)
    
    # List all current superusers
    print("\n" + "=" * 80)
    print("CURRENT SUPERUSERS IN THE SYSTEM")
    print("=" * 80)
    
    try:
        superusers = User.objects.filter(is_superuser=True).order_by('id')
        
        if superusers.exists():
            print(f"Total Superusers: {superusers.count()}")
            print("-" * 80)
            
            for user in superusers:
                print(f"ID: {user.id}")
                print(f"Username: {user.username}")
                print(f"Name: {user.first_name} {user.last_name}")
                print(f"Email: {user.email or 'N/A'}")
                print(f"Role: {getattr(user, 'role', 'N/A')}")
                print(f"Is Active: {'Yes' if user.is_active else 'No'}")
                print("-" * 40)
        else:
            print("No superusers found in the system.")
    except Exception as e:
        print(f"❌ Error listing superusers: {e}")
    
    print("\n✅ SUPERUSER UPDATE PROCESS COMPLETE!")
    print("=" * 80)

if __name__ == "__main__":
    make_superusers()
