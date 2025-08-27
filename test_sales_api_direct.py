#!/usr/bin/env python3
import os
import sys
import django
import requests
import json

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_sales_order_api():
    """Test sales order creation via API endpoint directly"""
    print("🚨 Sales Order API Test")
    
    # First, get authentication token
    login_url = "http://localhost:2025/api/token/"
    login_data = {
        "username": "arkucollins",
        "password": "admin123"
    }
    
    print(f"\n🔐 Getting authentication token...")
    try:
        login_response = requests.post(login_url, data=login_data)
        print(f"Login status: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.text}")
            return
            
        token_data = login_response.json()
        access_token = token_data.get('access')
        print(f"✅ Got access token")
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return
    
    # Test sales order creation
    sales_order_url = "http://localhost:2025/api/sales/sales-orders/"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Test payload matching frontend exactly
    test_payload = {
        "customer": 1,
        "payment_method": "cash",
        "payment_terms": 0,
        "subtotal": 40.0,
        "total": 40.0,
        "items": [
            {
                "product": 2,
                "quantity": 1,
                "unit_price": 15.0
            },
            {
                "product": 3,
                "quantity": 1,
                "unit_price": 25.0
            }
        ]
    }
    
    print(f"\n📤 Testing sales order creation...")
    print(f"URL: {sales_order_url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        response = requests.post(sales_order_url, 
                               headers=headers, 
                               json=test_payload)
        
        print(f"\n📥 Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ Sales order created successfully!")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ API Error {response.status_code}")
            print(f"Response text: {response.text}")
            
            # Try to parse error details
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse error response as JSON")
                
    except Exception as e:
        print(f"❌ Request error: {e}")

if __name__ == "__main__":
    test_sales_order_api()
