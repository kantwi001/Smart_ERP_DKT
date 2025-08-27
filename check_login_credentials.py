#!/usr/bin/env python3

import os
import sys
import django
import requests
import json

# Add backend to path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from django.db import connection

User = get_user_model()

def check_database_users():
    """Check what users exist in the database"""
    print("🔍 Checking users in PostgreSQL database...")
    try:
        users = User.objects.all()
        print(f"✅ Found {users.count()} users in database:")
        for user in users:
            print(f"   - Username: {user.username}")
            print(f"     Email: {user.email}")
            print(f"     Is Active: {user.is_active}")
            print(f"     Is Superuser: {user.is_superuser}")
            print(f"     Last Login: {user.last_login}")
            print("   ---")
        return users
    except Exception as e:
        print(f"❌ Error checking users: {e}")
        return None

def test_backend_connection():
    """Test if backend server is running"""
    print("🌐 Testing backend server connection...")
    try:
        response = requests.get('http://localhost:2025/api/', timeout=5)
        print(f"✅ Backend server is running - Status: {response.status_code}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running on localhost:2025")
        return False
    except Exception as e:
        print(f"❌ Error connecting to backend: {e}")
        return False

def test_login_endpoint():
    """Test the login endpoint with known credentials"""
    print("🔐 Testing login endpoint...")
    
    # Try with the superuser created in test
    credentials = [
        {"email": "arkucollins@gmail.com", "password": "admin123"},
        {"username": "admin", "password": "admin123"},
        {"email": "admin@example.com", "password": "admin123"}
    ]
    
    for cred in credentials:
        try:
            print(f"   Trying: {cred}")
            response = requests.post(
                'http://localhost:2025/api/token/',
                data=cred,
                headers={'Content-Type': 'application/x-www-form-urlencoded'},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Login successful with {cred}")
                token_data = response.json()
                print(f"   Access token received: {token_data.get('access', 'N/A')[:50]}...")
                return True
            else:
                print(f"❌ Login failed - Status: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error testing login: {e}")
    
    return False

def create_test_user():
    """Create a test user for login"""
    print("👤 Creating test user...")
    try:
        # Check if arkucollins@gmail.com exists
        if User.objects.filter(email='arkucollins@gmail.com').exists():
            user = User.objects.get(email='arkucollins@gmail.com')
            print(f"✅ User already exists: {user.email}")
        else:
            user = User.objects.create_user(
                username='arkucollins',
                email='arkucollins@gmail.com',
                password='admin123',
                is_superuser=True,
                is_staff=True
            )
            print(f"✅ Created user: {user.email}")
        
        # Ensure user is active
        user.is_active = True
        user.save()
        print(f"✅ User is active: {user.is_active}")
        return user
        
    except Exception as e:
        print(f"❌ Error creating user: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Backend Login Diagnostic Tool")
    print("=" * 50)
    
    # Check database users
    users = check_database_users()
    
    # Test backend connection
    backend_running = test_backend_connection()
    
    if not backend_running:
        print("\n❌ Backend server is not running!")
        print("   Run: ./start_backend.sh")
        sys.exit(1)
    
    # Create/verify test user
    test_user = create_test_user()
    
    # Test login
    login_success = test_login_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Diagnostic Summary:")
    print(f"   Database Users: {users.count() if users else 0}")
    print(f"   Backend Running: {'✅' if backend_running else '❌'}")
    print(f"   Login Working: {'✅' if login_success else '❌'}")
    
    if login_success:
        print("\n🎉 Login is working! Use these credentials:")
        print("   Email: arkucollins@gmail.com")
        print("   Password: admin123")
    else:
        print("\n❌ Login is not working. Check backend logs for errors.")
