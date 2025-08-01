#!/usr/bin/env python
import os
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_departments_api():
    print("Testing Departments API...")
    
    # Get or create a test user
    try:
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            user = User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
        print(f"Using user: {user.username}")
    except Exception as e:
        print(f"Error creating user: {e}")
        return
    
    # Generate JWT token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    print(f"Generated token: {access_token[:20]}...")
    
    # Test departments API
    url = 'http://localhost:8000/api/hr/departments/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Response status: {response.status_code}")
        print(f"Response data: {response.json()}")
        
        if response.status_code == 200:
            departments = response.json()
            print(f"✅ Successfully fetched {len(departments)} departments")
            for i, dept in enumerate(departments, 1):
                print(f"  {i}. {dept.get('name', 'N/A')} (ID: {dept.get('id', 'N/A')})")
        else:
            print(f"❌ API call failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error calling API: {e}")

if __name__ == '__main__':
    test_departments_api()
