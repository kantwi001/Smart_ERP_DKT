#!/usr/bin/env python3
"""
Script to fix the department issue by creating a default department
and updating users without departments.
"""

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from hr.models import Department

User = get_user_model()

def fix_department_issue():
    """Fix department-related issues for users"""
    print("Checking department setup...")
    
    # Check if any departments exist
    departments = Department.objects.all()
    print(f"Found {departments.count()} departments in database")
    
    if departments.count() == 0:
        print("No departments found. Creating default department...")
        # Create a default department
        default_dept = Department.objects.create(name='HR')
        print(f"Created default department: {default_dept}")
    else:
        print("Existing departments:")
        for dept in departments:
            print(f"  - {dept.name}")
        default_dept = departments.first()
    
    # Check users without departments
    users_without_dept = User.objects.filter(department__isnull=True)
    print(f"Found {users_without_dept.count()} users without departments")
    
    if users_without_dept.count() > 0:
        print("Assigning default department to users without departments...")
        for user in users_without_dept:
            user.department = default_dept
            user.save()
            print(f"  - Assigned {user.username} to {default_dept.name}")
    
    print("\nDepartment issue fixed!")
    
    # Test the UserSerializer
    print("\nTesting UserSerializer...")
    try:
        from users.serializers import UserSerializer
        test_user = User.objects.first()
        if test_user:
            serializer = UserSerializer(test_user)
            data = serializer.data
            print(f"UserSerializer test successful for user: {test_user.username}")
            print(f"Department name: {data.get('department_name', 'None')}")
        else:
            print("No users found to test with")
    except Exception as e:
        print(f"UserSerializer test failed: {e}")

if __name__ == '__main__':
    fix_department_issue()
