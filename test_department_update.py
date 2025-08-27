#!/usr/bin/env python3
import requests
import json

# Test the department update endpoint directly
def test_department_update():
    # Configuration
    BASE_URL = "http://localhost:2025"
    USER_ID = 11  # Collins Arku's user ID
    DEPARTMENT_ID = 1  # HR department ID
    
    # First, get a token (you'll need to replace with actual credentials)
    login_data = {
        "email": "arkucollins@gmail.com",
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
    
    # Test the department update endpoint
    print(f"\n🔄 Testing department update for user {USER_ID}...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    update_data = {
        'department_id': DEPARTMENT_ID
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/api/users/{USER_ID}/update-department/",
            headers=headers,
            json=update_data
        )
        
        print(f"📡 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"📄 Response Body: {json.dumps(response_json, indent=2)}")
        except:
            print(f"📄 Response Text: {response.text}")
            
        if response.status_code == 200:
            print("✅ Department update successful!")
        else:
            print(f"❌ Department update failed with status {response.status_code}")
            
    except Exception as e:
        print(f"💥 Request error: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING DEPARTMENT UPDATE ENDPOINT")
    print("=" * 60)
    test_department_update()
    print("=" * 60)
