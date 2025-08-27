#!/usr/bin/env python3
import os
import sys

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Change to backend directory
os.chdir(backend_path)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from hr.models import Department

def check_departments():
    """Check all departments in the database"""
    print("=" * 60)
    print("CHECKING DEPARTMENTS IN DATABASE")
    print("=" * 60)
    
    try:
        departments = Department.objects.all()
        print(f"📊 TOTAL DEPARTMENTS: {departments.count()}")
        print()
        
        if departments.exists():
            for dept in departments:
                print(f"🏢 DEPARTMENT #{dept.id}")
                print(f"   📛 Name: {dept.name}")
                print(f"    Employee Count: {dept.employee_set.count()}")
                print(f"   📅 Created: {dept.created_at if hasattr(dept, 'created_at') else 'Unknown'}")
                print("-" * 50)
            
            # Check if we need to create more departments
            if departments.count() <= 1:
                print("Only HR department exists. Creating additional departments...")
                
                # Create additional departments if they don't exist
                if not Department.objects.filter(name="Sales").exists():
                    sales_dept = Department.objects.create(name="Sales")
                    print(f"✅ Created Sales Department (ID: {sales_dept.id})")
                
                if not Department.objects.filter(name="Finance").exists():
                    finance_dept = Department.objects.create(name="Finance")
                    print(f"✅ Created Finance Department (ID: {finance_dept.id})")
                
                if not Department.objects.filter(name="IT").exists():
                    it_dept = Department.objects.create(name="IT")
                    print(f"✅ Created IT Department (ID: {it_dept.id})")
                
                print()
                
                # Show all departments again
                departments = Department.objects.all()
                print("📊 UPDATED DEPARTMENT LIST:")
                for dept in departments:
                    print(f"🏢 DEPARTMENT #{dept.id} - {dept.name}")
                print()
        else:
            print("❌ No departments found in database!")
            print("Creating default departments...")
            
            # Create default departments
            hr_dept = Department.objects.create(name="HR")
            sales_dept = Department.objects.create(name="Sales")
            finance_dept = Department.objects.create(name="Finance")
            it_dept = Department.objects.create(name="IT")
            
            print(f"✅ Created HR Department (ID: {hr_dept.id})")
            print(f"✅ Created Sales Department (ID: {sales_dept.id})")
            print(f"✅ Created Finance Department (ID: {finance_dept.id})")
            print(f"✅ Created IT Department (ID: {it_dept.id})")
            
    except Exception as e:
        print(f"💥 Error checking departments: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_departments()
    print("=" * 60)
