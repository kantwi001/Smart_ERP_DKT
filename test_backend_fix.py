#!/usr/bin/env python3
import os
import sys
import subprocess
import requests
import json
from pathlib import Path

# Backend API configuration
API_BASE = "http://localhost:2025/api"
LOGIN_CREDENTIALS = {
    "username": "arkucollins",
    "password": "admin123"
}

def run_migration():
    """Run Django migrations"""
    backend_dir = Path(__file__).parent / 'backend'
    try:
        print("🔄 Running Django migrations...")
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate'
        ], cwd=backend_dir, capture_output=True, text=True)
        
        print("Migration output:")
        print(result.stdout)
        if result.stderr:
            print("Migration errors:")
            print(result.stderr)
            
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running migration: {e}")
        return False

def get_auth_token():
    """Get authentication token from backend"""
    try:
        response = requests.post(f"{API_BASE}/token/", json=LOGIN_CREDENTIALS)
        if response.status_code == 200:
            token = response.json().get('access')
            print(f"✅ Authentication successful")
            return token
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def test_product_api(token):
    """Test Product API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Product API...")
    
    # Test GET products
    try:
        response = requests.get(f"{API_BASE}/inventory/products/", headers=headers)
        if response.status_code == 200:
            products = response.json()
            print(f"✅ GET products: {len(products)} products found")
            return products
        else:
            print(f"❌ GET products failed: {response.status_code}")
            print(response.text)
            return []
    except Exception as e:
        print(f"❌ Product API error: {e}")
        return []

def test_productprice_api(token, products):
    """Test ProductPrice API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing ProductPrice API...")
    
    # Test GET product prices
    try:
        response = requests.get(f"{API_BASE}/inventory/product-prices/", headers=headers)
        if response.status_code == 200:
            prices = response.json()
            print(f"✅ GET product-prices: {len(prices)} prices found")
            
            # Test creating a price if we have products
            if products and len(products) > 0:
                test_price_data = {
                    "product": products[0]["id"],
                    "currency": "USD",
                    "price": "99.99"
                }
                
                create_response = requests.post(
                    f"{API_BASE}/inventory/product-prices/", 
                    json=test_price_data, 
                    headers=headers
                )
                
                if create_response.status_code == 201:
                    print("✅ POST product-price: Successfully created test price")
                    
                    # Clean up test price
                    price_id = create_response.json()["id"]
                    delete_response = requests.delete(
                        f"{API_BASE}/inventory/product-prices/{price_id}/", 
                        headers=headers
                    )
                    if delete_response.status_code == 204:
                        print("✅ DELETE product-price: Test cleanup successful")
                else:
                    print(f"❌ POST product-price failed: {create_response.status_code}")
                    print(create_response.text)
            
            return True
        else:
            print(f"❌ GET product-prices failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ ProductPrice API error: {e}")
        return False

def test_categories_api(token):
    """Test Categories API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Categories API...")
    
    try:
        response = requests.get(f"{API_BASE}/inventory/categories/", headers=headers)
        if response.status_code == 200:
            categories = response.json()
            print(f"✅ GET categories: {len(categories)} categories found")
            return categories
        else:
            print(f"❌ GET categories failed: {response.status_code}")
            print(response.text)
            return []
    except Exception as e:
        print(f"❌ Categories API error: {e}")
        return []

def test_sales_orders_api(token):
    """Test Sales Orders API endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n🧪 Testing Sales Orders API...")
    
    # Test GET sales orders
    try:
        response = requests.get(f"{API_BASE}/sales/sales-orders/", headers=headers)
        if response.status_code == 200:
            orders = response.json()
            print(f"✅ GET sales-orders: {len(orders)} orders found")
            return True
        else:
            print(f"❌ GET sales-orders failed: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Sales Orders API error: {e}")
        return False

def main():
    print("=== Backend API Test & Fix ===")
    
    # Step 1: Run migrations
    migration_success = run_migration()
    if not migration_success:
        print("❌ Migration failed. Cannot proceed with API tests.")
        return
    
    # Step 2: Test authentication
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed. Cannot proceed with API tests.")
        return
    
    # Step 3: Test APIs
    products = test_product_api(token)
    categories = test_categories_api(token)
    productprice_success = test_productprice_api(token, products)
    sales_orders_success = test_sales_orders_api(token)
    
    # Summary
    print("\n=== Test Summary ===")
    print(f"✅ Migration: {'Success' if migration_success else 'Failed'}")
    print(f"✅ Authentication: {'Success' if token else 'Failed'}")
    print(f"✅ Products API: {'Success' if products is not None else 'Failed'}")
    print(f"✅ Categories API: {'Success' if categories is not None else 'Failed'}")
    print(f"✅ ProductPrice API: {'Success' if productprice_success else 'Failed'}")
    print(f"✅ Sales Orders API: {'Success' if sales_orders_success else 'Failed'}")
    
    if migration_success and token and products is not None and productprice_success and sales_orders_success:
        print("\n🎉 All tests passed! Backend should be working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
