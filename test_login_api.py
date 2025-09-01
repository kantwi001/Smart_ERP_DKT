#!/usr/bin/env python3

import requests
import json

def test_login_api():
    """Test the login API directly"""
    
    BASE_URL = "http://localhost:2025/api"
    
    # Test data
    login_data = {
        "username": "arkucollins",
        "password": "admin123"
    }
    
    print("🔐 Testing Login API...")
    print(f"📡 URL: {BASE_URL}/token/")
    print(f"📋 Data: {login_data}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/token/",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        print(f"📋 Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"🔑 Access Token: {data.get('access', 'N/A')[:50]}...")
            print(f"🔄 Refresh Token: {data.get('refresh', 'N/A')[:50]}...")
            
            # Test user profile endpoint
            if 'access' in data:
                print("\n🔍 Testing user profile endpoint...")
                profile_response = requests.get(
                    f"{BASE_URL}/users/me/",
                    headers={"Authorization": f"Bearer {data['access']}"},
                    timeout=10
                )
                print(f"📊 Profile Status: {profile_response.status_code}")
                print(f"📋 Profile Data: {profile_response.text}")
                
        else:
            print("❌ Login failed!")
            try:
                error_data = response.json()
                print(f"🚨 Error Details: {error_data}")
            except:
                print(f"🚨 Raw Error: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is Django server running on port 2025?")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("🎯 Login API Test")
    print("=" * 40)
    test_login_api()
