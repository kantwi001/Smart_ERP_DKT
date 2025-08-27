#!/usr/bin/env python
"""
User Cleanup Script
Deletes all sample users and keeps/creates only specified users:
- Sales manager
- Finance manager
- Procurement Manager
- CD (Country Director)
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from hr.models import Department

User = get_user_model()

def cleanup_and_create_users():
    print("🧹 Starting user cleanup...")
    
    # Get or create departments first
    sales_dept, _ = Department.objects.get_or_create(
        name='Sales',
        defaults={'description': 'Sales Department'}
    )
    finance_dept, _ = Department.objects.get_or_create(
        name='Finance',
        defaults={'description': 'Finance Department'}
    )
    procurement_dept, _ = Department.objects.get_or_create(
        name='Procurement',
        defaults={'description': 'Procurement Department'}
    )
    management_dept, _ = Department.objects.get_or_create(
        name='Management',
        defaults={'description': 'Executive Management'}
    )
    
    print(f"📁 Departments ready: {Department.objects.count()} total")
    
    # List current users
    current_users = User.objects.all()
    print(f"👥 Current users ({current_users.count()}):")
    for user in current_users:
        print(f"  - {user.username} ({user.email}) - {user.role}")
    
    # Delete all users except superusers we want to keep
    users_to_keep = []
    users_to_delete = User.objects.exclude(username__in=users_to_keep)
    
    print(f"\n🗑️ Deleting {users_to_delete.count()} users...")
    deleted_count = users_to_delete.count()
    users_to_delete.delete()
    print(f"✅ Deleted {deleted_count} users")
    
    # Create/update the required users
    users_to_create = [
        {
            'username': 'sales_manager',
            'email': 'sales@company.com',
            'first_name': 'Sales',
            'last_name': 'Manager',
            'role': 'sales_manager',
            'is_superuser': False,
            'is_staff': True,
        },
        {
            'username': 'finance_manager',
            'email': 'finance@company.com',
            'first_name': 'Finance',
            'last_name': 'Manager',
            'role': 'finance_manager',
            'is_superuser': False,
            'is_staff': True,
        },
        {
            'username': 'procurement_manager',
            'email': 'procurement@company.com',
            'first_name': 'Procurement',
            'last_name': 'Manager',
            'role': 'procurement_manager',
            'is_superuser': False,
            'is_staff': True,
        },
        {
            'username': 'cd',
            'email': 'country.director@company.com',
            'first_name': 'Country',
            'last_name': 'Director',
            'role': 'executive',
            'is_superuser': False,
            'is_staff': True,
            'department': management_dept
        }
    ]
    
    print(f"\n👤 Creating/updating {len(users_to_create)} users...")
    
    for user_data in users_to_create:
        username = user_data.pop('username')
        user, created = User.objects.update_or_create(
            username=username,
            defaults=user_data
        )
        
        # Set a default password
        if created or not user.has_usable_password():
            user.set_password('password123')
            user.save()
        
        action = "Created" if created else "Updated"
        print(f"  ✅ {action}: {user.username} ({user.email}) - {user.role}")
    
    # Final summary
    final_users = User.objects.all()
    print(f"\n🎉 User cleanup complete!")
    print(f"📊 Final user count: {final_users.count()}")
    print(f"👥 Final users:")
    for user in final_users.order_by('username'):
        dept_name = user.department.name if user.department else 'No Department'
        print(f"  - {user.username} ({user.first_name} {user.last_name}) - {user.role} - {dept_name}")

if __name__ == '__main__':
    cleanup_and_create_users()
