#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to the Python path
backend_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
sys.path.append(backend_path)

# Change to backend directory and set Django settings
os.chdir(backend_path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from users.models import User
from hr.models import Department
from warehouse.models import Warehouse

def assign_collins_dept_warehouse():
    """Assign Sales department and MainWarehouse to Collins user"""
    
    try:
        # Find Collins user
        collins = User.objects.filter(
            first_name__icontains='collins'
        ).first()
        
        if not collins:
            print("Collins user not found. Creating Collins user...")
            collins = User.objects.create_user(
                username='collins.arku',
                email='arkucollins@gmail.com',
                first_name='Collins',
                last_name='Arku',
                role='sales',
                is_staff=True,
                is_superuser=True
            )
            print(f"Created user: {collins}")
        else:
            print(f"Found user: {collins}")
        
        # Get or create Sales department
        sales_dept, created = Department.objects.get_or_create(
            name='Sales',
            defaults={
                'description': 'Sales and Customer Relations Department',
                'manager': collins
            }
        )
        if created:
            print(f"Created Sales department: {sales_dept}")
        else:
            print(f"Found Sales department: {sales_dept}")
        
        # Get or create MainWarehouse
        main_warehouse, created = Warehouse.objects.get_or_create(
            name='MainWarehouse',
            defaults={
                'code': 'MAIN-WH',
                'address': 'Main Warehouse Location, Freetown, Sierra Leone',
                'manager': collins,
                'capacity': 10000,
                'is_active': True
            }
        )
        if created:
            print(f"Created MainWarehouse: {main_warehouse}")
        else:
            print(f"Found MainWarehouse: {main_warehouse}")
        
        # Assign department and warehouse to Collins
        collins.department = sales_dept
        collins.assigned_warehouse = main_warehouse
        collins.role = 'sales'
        collins.save()
        
        print(f"\n✅ Successfully assigned:")
        print(f"   User: {collins.first_name} {collins.last_name}")
        print(f"   Department: {collins.department.name}")
        print(f"   Assigned Warehouse: {collins.assigned_warehouse.name}")
        print(f"   Role: {collins.get_role_display()}")
        
        # List all warehouses for reference
        print(f"\n📦 Available Warehouses:")
        warehouses = Warehouse.objects.all()
        for wh in warehouses:
            print(f"   - {wh.name} ({wh.code}) - Manager: {wh.manager or 'None'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ASSIGNING COLLINS DEPARTMENT & WAREHOUSE")
    print("=" * 60)
    
    success = assign_collins_dept_warehouse()
    
    if success:
        print("\n✅ Assignment completed successfully!")
    else:
        print("\n❌ Assignment failed!")
    
    print("=" * 60)
