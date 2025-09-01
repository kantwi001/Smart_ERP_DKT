#!/usr/bin/env python3

import requests
import json

def get_auth_token():
    """Get authentication token"""
    BASE_URL = "http://localhost:2025/api"
    
    try:
        response = requests.post(f"{BASE_URL}/token/", {
            'username': 'arkucollins',
            'password': 'admin123'
        })
        
        if response.status_code == 200:
            token = response.json()['access']
            print(f"✅ Authentication successful")
            return token
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def debug_data_loading():
    """Debug the exact data loading that SalesDashboard should see"""
    
    token = get_auth_token()
    if not token:
        return
    
    BASE_URL = "http://localhost:2025/api"
    headers = {'Authorization': f'Bearer {token}'}
    
    print("\n🔍 DEBUGGING SALES DASHBOARD DATA LOADING")
    print("=" * 60)
    
    # Test customers endpoint
    print("\n📊 CUSTOMERS DATA:")
    try:
        response = requests.get(f"{BASE_URL}/sales/customers/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            customers = response.json()
            print(f"   ✅ Count: {len(customers)} customers")
            if customers:
                print(f"   📝 Sample customer: {customers[0]['name']} ({customers[0]['email']})")
                print(f"   📝 Customer fields: {list(customers[0].keys())}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test products endpoint
    print("\n📦 PRODUCTS DATA:")
    try:
        response = requests.get(f"{BASE_URL}/inventory/products/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"   ✅ Count: {len(products)} products")
            if products:
                print(f"   📝 Sample product: {products[0]['name']} (SKU: {products[0]['sku']})")
                print(f"   📝 Stock quantity: {products[0].get('quantity', 'N/A')}")
                print(f"   📝 Product fields: {list(products[0].keys())}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test warehouses endpoint
    print("\n🏢 WAREHOUSES DATA:")
    try:
        response = requests.get(f"{BASE_URL}/warehouse/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            warehouses = response.json()
            print(f"   ✅ Count: {len(warehouses)} warehouses")
            if warehouses:
                print(f"   📝 Sample warehouse: {warehouses[0]['name']}")
                print(f"   📝 Warehouse fields: {list(warehouses[0].keys())}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test sales orders endpoint
    print("\n🛒 SALES ORDERS DATA:")
    try:
        response = requests.get(f"{BASE_URL}/sales/sales-orders/", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            orders = response.json()
            print(f"   ✅ Count: {len(orders)} orders")
            if orders:
                print(f"   📝 Sample order: {orders[0].get('customer_name', 'N/A')}")
                print(f"   📝 Order fields: {list(orders[0].keys())}")
        else:
            print(f"   ❌ Error: {response.text[:200]}")
    except Exception as e:
        print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    debug_data_loading()
    
    print("\n" + "=" * 60)
    print("🔧 FRONTEND DEBUGGING STEPS:")
    print("1. Open browser Developer Tools (F12)")
    print("2. Go to Network tab")
    print("3. Refresh the Sales Dashboard")
    print("4. Check for failed API requests (red entries)")
    print("5. Look for 401, 404, or 500 errors")
    print("6. Check Console tab for JavaScript errors")
    print("7. Verify that Authorization headers are being sent")
