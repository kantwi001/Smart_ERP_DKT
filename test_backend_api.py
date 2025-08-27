#!/usr/bin/env python3
import requests
import json

def test_users_api():
    """Test the users API endpoint directly"""
    BASE_URL = "http://localhost:2025"
    
    # Get authentication token
    login_data = {
        "username": "arkucollins@gmail.com",
        "password": "admin123"
    }
    
    print("🔐 Getting authentication token...")
    try:
        login_response = requests.post(f"{BASE_URL}/api/token/", json=login_data)
        if login_response.status_code == 200:
            token = login_response.json()['access']
            print("✅ Token obtained successfully")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return
    except Exception as e:
        print(f"💥 Login error: {e}")
        return
    
    # Test users endpoint
    print(f"\n🔍 Testing /api/users/ endpoint...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/users/", headers=headers)
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            users_data = response.json()
            print(f"✅ API returned {len(users_data)} users")
            print(f"📄 Sample user data:")
            for i, user in enumerate(users_data[:3]):  # Show first 3 users
                print(f"  User {i+1}: ID={user.get('id')}, Name={user.get('first_name')} {user.get('last_name')}, Email={user.get('email')}")
                print(f"           Department: {user.get('department_name')}, Dept ID: {user.get('department_id')}")
                print(f"           Active: {user.get('is_active')}, Superuser: {user.get('is_superuser')}")
                print()
            
            if len(users_data) > 3:
                print(f"  ... and {len(users_data) - 3} more users")
                
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"💥 Request error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING BACKEND USERS API")
    print("=" * 60)
    test_users_api()
    print("=" * 60)
