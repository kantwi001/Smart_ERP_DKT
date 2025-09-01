#!/usr/bin/env python3

import requests
import json

def test_payment_endpoint():
    """Test the payment endpoint to identify the 400 error"""
    
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
    
    print("\n🔍 TESTING PAYMENT ENDPOINT")
    print("=" * 50)
    
    # Test if payment endpoint exists
    print("\n📊 CHECKING /sales/payments/ endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/sales/payments/", headers=headers)
        print(f"   GET Status: {response.status_code}")
        if response.status_code == 200:
            payments = response.json()
            print(f"   ✅ Existing payments: {len(payments)}")
        elif response.status_code == 404:
            print(f"   ❌ Endpoint not found - this is likely the issue")
        else:
            print(f"   ⚠️  Response: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test POST to payment endpoint with sample data
    print("\n📝 TESTING POST to /sales/payments/:")
    try:
        # Sample payment data (similar to what frontend sends)
        payment_data = {
            'sales_order': 1,  # Assuming order ID 1 exists
            'amount': '125.00',
            'payment_method': 'cash',
            'reference': 'TEST-REF-001',
            'notes': 'Test payment',
            'payment_date': '2025-09-01'
        }
        
        response = requests.post(f"{BASE_URL}/sales/payments/", 
                               data=payment_data, 
                               headers=headers)
        print(f"   POST Status: {response.status_code}")
        
        if response.status_code == 400:
            print(f"   ❌ 400 Bad Request - Response: {response.text}")
            try:
                error_data = response.json()
                print(f"   📝 Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   📝 Raw error: {response.text}")
        elif response.status_code == 404:
            print(f"   ❌ 404 Not Found - Payment endpoint doesn't exist")
        elif response.status_code == 201:
            print(f"   ✅ Payment created successfully")
        else:
            print(f"   ⚠️  Unexpected status: {response.text[:200]}")
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Check available endpoints
    print("\n🔍 CHECKING AVAILABLE SALES ENDPOINTS:")
    sales_endpoints = [
        "/sales/",
        "/sales/customers/",
        "/sales/sales-orders/",
        "/sales/payments/",
        "/sales/invoices/"
    ]
    
    for endpoint in sales_endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            status = "✅" if response.status_code == 200 else "❌"
            print(f"   {status} {endpoint} - Status: {response.status_code}")
        except Exception as e:
            print(f"   ❌ {endpoint} - Error: {e}")

if __name__ == "__main__":
    test_payment_endpoint()
    
    print("\n" + "=" * 50)
    print("🔧 LIKELY SOLUTIONS:")
    print("1. Payment endpoint (/sales/payments/) may not exist in Django URLs")
    print("2. Payment model/serializer may have validation errors")
    print("3. Required fields may be missing or incorrect")
    print("4. File upload (multipart/form-data) may not be handled properly")
    print("5. Check Django backend logs for detailed error messages")
