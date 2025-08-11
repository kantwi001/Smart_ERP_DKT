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
from hr.models import Department

def list_all_users():
    """List all users in the ERP system with their details"""
    print("=" * 80)
    print("ERP SYSTEM - ALL USERS")
    print("=" * 80)
    
    users = User.objects.all().order_by('id')
    
    if not users:
        print("No users found in the system.")
        return
    
    print(f"Total Users: {users.count()}")
    print("-" * 80)
    
    for user in users:
        print(f"ID: {user.id}")
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"First Name: {user.first_name}")
        print(f"Last Name: {user.last_name}")
        print(f"Role: {user.role if hasattr(user, 'role') else 'N/A'}")
        print(f"Department: {user.department.name if hasattr(user, 'department') and user.department else 'N/A'}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Active: {user.is_active}")
        print(f"Date Joined: {user.date_joined}")
        print(f"Last Login: {user.last_login}")
        
        # Check if user has employee profile
        try:
            from hr.models import Employee
            employee = Employee.objects.get(user=user)
            print(f"Employee ID: {employee.employee_id}")
            print(f"Position: {employee.position}")
            print(f"Phone: {employee.phone}")
        except Employee.DoesNotExist:
            print("Employee Profile: Not created")
        except Exception as e:
            print(f"Employee Profile: Error - {e}")
        
        print("-" * 80)

if __name__ == "__main__":
    list_all_users()
