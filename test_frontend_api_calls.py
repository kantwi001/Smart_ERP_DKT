#!/usr/bin/env python3

import requests
import json

def test_frontend_api_calls():
    """Test the exact API calls that frontend is making"""
    
    # Get token first
    BASE_URL = "http://localhost:2025/api"
    
    try:
        response = requests.post(f"{BASE_URL}/token/", {
            'username': 'arkucollins',
            'password': 'admin123'
        })
        
        if response.status_code != 200:
            print(f"❌ Authentication failed: {response.status_code}")
            return
            
        token = response.json()['access']
        headers = {'Authorization': f'Bearer {token}'}
        print(f"✅ Authentication successful")
        
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return
    
    print("\n🔍 TESTING FRONTEND API CALLS")
    print("=" * 50)
    
    # Test customers endpoint (the one frontend is calling)
    print("\n📊 CUSTOMERS (/sales/customers/):")
    try:
        response = requests.get(f"{BASE_URL}/sales/customers/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response type: {type(data)}")
            print(f"   ✅ Data length: {len(data) if isinstance(data, list) else 'Not a list'}")
            print(f"   📝 Raw response preview: {str(data)[:200]}...")
        else:
            print(f"   ❌ Error response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test products endpoint (the one frontend is calling)
    print("\n📦 PRODUCTS (/inventory/products/):")
    try:
        response = requests.get(f"{BASE_URL}/inventory/products/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response type: {type(data)}")
            print(f"   ✅ Data length: {len(data) if isinstance(data, list) else 'Not a list'}")
            print(f"   📝 Raw response preview: {str(data)[:200]}...")
        else:
            print(f"   ❌ Error response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test warehouses endpoint (this one works)
    print("\n🏢 WAREHOUSES (/warehouse/):")
    try:
        response = requests.get(f"{BASE_URL}/warehouse/", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Response type: {type(data)}")
            print(f"   ✅ Data length: {len(data) if isinstance(data, list) else 'Not a list'}")
            print(f"   📝 Raw response preview: {str(data)[:200]}...")
        else:
            print(f"   ❌ Error response: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    test_frontend_api_calls()
