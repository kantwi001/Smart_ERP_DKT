#!/usr/bin/env python3

import requests
import json

def test_both_login_methods():
    """Test login with both username and email"""
    
    BASE_URL = "http://localhost:2025/api"
    
    # Test 1: Login with username only
    print("🔐 Test 1: Login with username 'arkucollins'")
    login_data_username = {
        "username": "arkucollins",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token/", json=login_data_username, timeout=10)
        print(f"📊 Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Username login successful!")
        else:
            print(f"❌ Username login failed: {response.text}")
    except Exception as e:
        print(f"❌ Username login error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test 2: Login with full email
    print("🔐 Test 2: Login with email 'arkucollins@gmail.com'")
    login_data_email = {
        "username": "arkucollins@gmail.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/token/", json=login_data_email, timeout=10)
        print(f"📊 Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Email login successful!")
        else:
            print(f"❌ Email login failed: {response.text}")
    except Exception as e:
        print(f"❌ Email login error: {e}")

if __name__ == "__main__":
    print("🎯 Testing Both Login Methods")
    print("=" * 50)
    test_both_login_methods()
