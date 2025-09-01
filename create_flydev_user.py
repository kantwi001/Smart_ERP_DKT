#!/usr/bin/env python3

import requests
import json

def create_user_on_flydev():
    """Create test user on Fly.dev backend"""
    
    # Fly.dev backend URL
    BASE_URL = "https://backend-shy-sun-4450.fly.dev/api"
    
    # User data
    user_data = {
        "username": "arkucollins",
        "email": "arkucollins@gmail.com", 
        "password": "admin123",
        "first_name": "Arku",
        "last_name": "Collins",
        "is_staff": True,
        "is_superuser": True
    }
    
    print("🚀 Creating user on Fly.dev backend...")
    print(f"📡 Backend: {BASE_URL}")
    print(f"👤 User: {user_data['email']}")
    
    try:
        # Try to create user via registration endpoint
        response = requests.post(
            f"{BASE_URL}/auth/register/",
            json=user_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📋 Response Status: {response.status_code}")
        print(f"📋 Response: {response.text}")
        
        if response.status_code in [200, 201]:
            print("✅ User created successfully!")
            print("🔑 Login credentials:")
            print(f"   Email: {user_data['email']}")
            print(f"   Password: {user_data['password']}")
        else:
            print("❌ Failed to create user")
            print("💡 User might already exist or registration is disabled")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        print("💡 Check if Fly.dev backend is running")

def test_login():
    """Test login with created credentials"""
    
    BASE_URL = "https://backend-shy-sun-4450.fly.dev/api"
    
    login_data = {
        "username": "arkucollins",
        "password": "admin123"
    }
    
    print("\n🔐 Testing login...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📋 Login Status: {response.status_code}")
        print(f"📋 Login Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Login test error: {e}")

if __name__ == "__main__":
    print("🎯 Fly.dev User Creation Script")
    print("=" * 40)
    
    create_user_on_flydev()
    test_login()
    
    print("\n📱 Now try logging into the mobile app with:")
    print("   Email: arkucollins@gmail.com")
    print("   Password: admin123")
