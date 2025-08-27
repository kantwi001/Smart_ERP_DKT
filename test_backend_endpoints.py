#!/usr/bin/env python3
"""
Test script to check backend server status and available endpoints
"""

import requests
import json

def test_backend_server():
    """Test if backend server is running and check available endpoints"""
    
    base_url = "http://localhost:2025"
    
    print("🔍 Testing Backend Server Connectivity...")
    print(f"Base URL: {base_url}")
    
    try:
        # Test root endpoint
        print("\n1. Testing root endpoint:")
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend server is running!")
            print(f"Version: {data.get('version', 'Unknown')}")
            print(f"Available endpoints: {list(data.get('endpoints', {}).keys())}")
        else:
            print(f"❌ Unexpected response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is NOT running!")
        print("Start it with: cd backend && python manage.py runserver 0.0.0.0:2025")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test specific endpoints that are causing 404s
    endpoints_to_test = [
        "/api/",
        "/api/hr/",
        "/api/hr/departments/",
        "/api/warehouse/",
        "/api/users/",
    ]
    
    print("\n2. Testing specific endpoints:")
    for endpoint in endpoints_to_test:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=5)
            status = "✅" if response.status_code < 400 else "❌"
            print(f"{status} {endpoint} -> {response.status_code}")
            
            if response.status_code == 401:
                print(f"    (Authentication required)")
            elif response.status_code == 404:
                print(f"    (Endpoint not found)")
            elif response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"    (Returns list with {len(data)} items)")
                    elif isinstance(data, dict):
                        print(f"    (Returns object with keys: {list(data.keys())[:3]}...)")
                except:
                    print(f"    (Non-JSON response)")
                    
        except Exception as e:
            print(f"❌ {endpoint} -> Error: {e}")
    
    return True

def test_with_authentication():
    """Test endpoints with authentication if available"""
    print("\n3. Authentication Test:")
    print("To test with authentication:")
    print("1. Login at http://localhost:2026 with arkucollins@gmail.com / admin123")
    print("2. Get the JWT token from browser dev tools")
    print("3. Add token to this script and uncomment the auth test section")

if __name__ == "__main__":
    if test_backend_server():
        test_with_authentication()
    
    print("\n📋 Summary:")
    print("- If backend is not running: cd backend && python manage.py runserver 0.0.0.0:2025")
    print("- If endpoints return 404: Check backend URL routing")
    print("- If endpoints return 401: Authentication required")
