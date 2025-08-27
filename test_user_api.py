#!/usr/bin/env python3
"""
Test script to verify the users API endpoint works after fixing department serializer issue
"""

import requests
import json

def test_users_api():
    """Test the users API endpoint"""
    
    # API endpoint
    url = "http://localhost:2025/api/users/"
    
    # Test credentials - you'll need to get a valid token
    print("Testing Users API Endpoint...")
    print(f"URL: {url}")
    
    try:
        # First, let's try without authentication to see what happens
        print("\n1. Testing without authentication:")
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("Authentication required - this is expected")
            
            # You would need to authenticate first to get a token
            print("\n2. To test with authentication, you need to:")
            print("   - Start the backend server: cd backend && python manage.py runserver 0.0.0.0:2025")
            print("   - Login to get a token at: http://localhost:2026")
            print("   - Use credentials: arkucollins@gmail.com / admin123")
            print("   - Then add the token to this script")
            
        elif response.status_code == 200:
            print("Success! Users API is working")
            data = response.json()
            print(f"Number of users returned: {len(data)}")
            for user in data[:3]:  # Show first 3 users
                print(f"  - User {user.get('id')}: {user.get('email')} ({user.get('role')})")
                
        else:
            print(f"Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend server")
        print("Make sure the backend server is running on port 2025:")
        print("  cd backend && python manage.py runserver 0.0.0.0:2025")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")

def test_with_token(token):
    """Test the API with authentication token"""
    
    url = "http://localhost:2025/api/users/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        print(f"\n3. Testing with authentication token:")
        response = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS! Users API is working")
            print(f"Number of users returned: {len(data)}")
            
            for user in data:
                dept_info = f"Dept: {user.get('department_name', 'None')}" if user.get('department_name') else "No Department"
                print(f"  - User {user.get('id')}: {user.get('email')} ({user.get('role')}) - {dept_info}")
                
        else:
            print(f"Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    test_users_api()
    
    # Uncomment and add your token to test with authentication
    # token = "your_jwt_token_here"
    # test_with_token(token)
