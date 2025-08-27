#!/usr/bin/env python3
"""
Test customer saving functionality in ERP system
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sales.models import Customer
from django.contrib.auth import get_user_model
from decimal import Decimal
import requests
import json

User = get_user_model()

def test_customer_model():
    """Test customer creation via Django model"""
    print("🧪 Testing customer creation via Django model...")
    
    try:
        test_customer = Customer(
            name="Test Customer Direct",
            email="test_direct@example.com",
            phone="+1-555-0123",
            address="123 Test Street, Test City, TC 12345",
            customer_type="retailer",
            payment_terms=30
        )
        test_customer.save()
        print("✅ Successfully created customer via Django model")
        django_success = True
    except Exception as e:
        print(f"❌ Error creating customer via model: {e}")
        django_success = False
        
    try:
        # Clean up
        test_customer.delete()
        print("🧹 Cleaned up test customer")
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning up test customer: {e}")
        return False

def test_customer_api():
    """Test customer creation via API"""
    print("🌐 Testing customer creation via API...")
    
    # First, get authentication token
    try:
        login_response = requests.post('http://localhost:2025/api/token/', {
            'username': 'arkucollins',
            'password': 'admin123'
        })
        
        if login_response.status_code != 200:
            print(f"❌ Failed to authenticate: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
            
        token = login_response.json()['access']
        print("✅ Successfully authenticated")
        
    except Exception as e:
        print(f"❌ Error during authentication: {e}")
        return False
    
    # Test creating customer via API
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        customer_data = {
            'name': 'Test Customer API',
            'email': 'test_api@example.com',
            'phone': '+1-555-API1',
            'address': '456 API Street',
            'customer_type': 'retailer',
            'payment_terms': 30
        }
        
        response = requests.post(
            'http://localhost:2025/api/sales/customers/',
            headers=headers,
            data=json.dumps(customer_data)
        )
        
        if response.status_code == 201:
            customer = response.json()
            print(f"✅ Successfully created customer via API: {customer['name']}")
            
            # Test retrieving the customer
            get_response = requests.get(
                f"http://localhost:2025/api/sales/customers/{customer['id']}/",
                headers=headers
            )
            
            if get_response.status_code == 200:
                print("✅ Successfully retrieved customer via API")
                
                # Clean up - delete the test customer
                delete_response = requests.delete(
                    f"http://localhost:2025/api/sales/customers/{customer['id']}/",
                    headers=headers
                )
                
                if delete_response.status_code == 204:
                    print("🧹 Successfully cleaned up test customer")
                else:
                    print(f"⚠️  Could not delete test customer: {delete_response.status_code}")
                
                return True
            else:
                print(f"❌ Failed to retrieve customer: {get_response.status_code}")
                return False
                
        else:
            print(f"❌ Failed to create customer via API: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during API test: {e}")
        return False

def test_customer_list_api():
    """Test customer list retrieval via API"""
    print("📋 Testing customer list retrieval via API...")
    
    try:
        # Get authentication token
        login_response = requests.post('http://localhost:2025/api/token/', {
            'username': 'arkucollins',
            'password': 'admin123'
        })
        
        if login_response.status_code != 200:
            print(f"❌ Failed to authenticate: {login_response.status_code}")
            return False
            
        token = login_response.json()['access']
        
        # Get customer list
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get('http://localhost:2025/api/sales/customers/', headers=headers)
        
        if response.status_code == 200:
            customers = response.json()
            print(f"✅ Successfully retrieved customer list: {len(customers)} customers")
            
            if len(customers) > 0:
                print(f"📊 Sample customer: {customers[0]['name']} ({customers[0]['email']})")
            
            return True
        else:
            print(f"❌ Failed to retrieve customer list: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during customer list test: {e}")
        return False

def main():
    print("🚀 Testing Customer Saving Functionality")
    print("=" * 50)
    
    # Test 1: Django model
    model_test = test_customer_model()
    print()
    
    # Test 2: API creation
    api_test = test_customer_api()
    print()
    
    # Test 3: API list retrieval
    list_test = test_customer_list_api()
    print()
    
    print("=" * 50)
    print("📊 Test Results:")
    print(f"   - Django Model: {'✅ PASS' if model_test else '❌ FAIL'}")
    print(f"   - API Creation: {'✅ PASS' if api_test else '❌ FAIL'}")
    print(f"   - API List: {'✅ PASS' if list_test else '❌ FAIL'}")
    
    if all([model_test, api_test, list_test]):
        print("\n🎉 All customer saving tests PASSED!")
    else:
        print("\n⚠️  Some customer saving tests FAILED. Check backend configuration.")

if __name__ == "__main__":
    main()
