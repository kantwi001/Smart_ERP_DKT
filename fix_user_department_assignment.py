#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from hr.models import Department

User = get_user_model()

def fix_user_department_assignments():
    """Fix user department assignments in the database"""
    
    print("🔧 Fixing User Department Assignments")
    print("=" * 50)
    
    # Get or create Sales department
    try:
        sales_dept = Department.objects.get(name='SALES')
        print(f"✅ Found Sales department: {sales_dept.name} (ID: {sales_dept.id})")
    except Department.DoesNotExist:
        print("❌ Sales department not found. Creating it...")
        sales_dept = Department.objects.create(name='SALES')
        print(f"✅ Created Sales department: {sales_dept.name} (ID: {sales_dept.id})")
    
    # Get all users
    users = User.objects.all()
    print(f"\n🔍 Found {users.count()} users in database")
    
    # Check current department assignments
    print("\n📋 Current User Department Status:")
    for user in users:
        dept_name = user.department.name if user.department else "None"
        warehouse_name = user.assigned_warehouse.name if user.assigned_warehouse else "None"
        print(f"  👤 {user.email}: Department={dept_name}, Warehouse={warehouse_name}")
    
    # Fix Edmond Sekyere's department (the user showing FINANCE)
    try:
        edmond_user = User.objects.get(email='edmondsekyere@gmail.com')
        print(f"\n🎯 Fixing department for: {edmond_user.email}")
        
        old_dept = edmond_user.department.name if edmond_user.department else "None"
        edmond_user.department = sales_dept
        edmond_user.save()
        
        print(f"✅ Updated {edmond_user.email}: {old_dept} → {sales_dept.name}")
        
        # Verify the change
        edmond_user.refresh_from_db()
        new_dept = edmond_user.department.name if edmond_user.department else "None"
        print(f"✅ Verified: {edmond_user.email} department is now: {new_dept}")
        
    except User.DoesNotExist:
        print("❌ User edmondsekyere@gmail.com not found")
    
    # Show final status
    print("\n📋 Final User Department Status:")
    for user in User.objects.all():
        dept_name = user.department.name if user.department else "None"
        warehouse_name = user.assigned_warehouse.name if user.assigned_warehouse else "None"
        print(f"  👤 {user.email}: Department={dept_name}, Warehouse={warehouse_name}")
    
    print("\n✅ Department assignment fix completed!")
    print("🔄 Refresh the Users Dashboard to see the changes")

if __name__ == '__main__':
    fix_user_department_assignments()
