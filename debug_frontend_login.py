#!/usr/bin/env python3

import requests
import json

def test_frontend_login_flow():
    """Test the exact same login flow the frontend uses"""
    
    BASE_URL = "http://localhost:2025/api"
    
    print("🔐 Testing Frontend Login Flow")
    print("=" * 50)
    
    # Step 1: Test /token/ endpoint
    print("📤 Step 1: Testing /token/ endpoint")
    login_data = {
        "username": "arkucollins",
        "password": "admin123"
    }
    
    try:
        token_response = requests.post(f"{BASE_URL}/token/", json=login_data, timeout=10)
        print(f"📊 Token Status: {token_response.status_code}")
        
        if token_response.status_code == 200:
            token_data = token_response.json()
            print(f"✅ Token received: {token_data.get('access', 'N/A')[:20]}...")
            access_token = token_data.get('access')
            
            # Step 2: Test /users/me/ endpoint
            print("\n📤 Step 2: Testing /users/me/ endpoint")
            headers = {"Authorization": f"Bearer {access_token}"}
            
            try:
                user_response = requests.get(f"{BASE_URL}/users/me/", headers=headers, timeout=10)
                print(f"📊 User Profile Status: {user_response.status_code}")
                
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    print(f"✅ User Profile: {user_data.get('username')} - {user_data.get('email')}")
                    print(f"🏢 Department: {user_data.get('department_name', 'N/A')}")
                    print(f"👑 Superuser: {user_data.get('is_superuser', False)}")
                    print("\n🎉 FRONTEND LOGIN FLOW SUCCESSFUL!")
                else:
                    print(f"❌ User profile failed: {user_response.text}")
                    
            except Exception as e:
                print(f"❌ User profile error: {e}")
                
        else:
            print(f"❌ Token request failed: {token_response.text}")
            
    except Exception as e:
        print(f"❌ Token request error: {e}")

if __name__ == "__main__":
    test_frontend_login_flow()
