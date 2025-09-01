#!/usr/bin/env python3

import requests
import json

def get_auth_token():
    """Get authentication token"""
    BASE_URL = "http://localhost:2025/api"
    
    try:
        response = requests.post(f"{BASE_URL}/token/", {
            'username': 'arkucollins',  # Extract username from email
            'password': 'admin123'
        })
        
        if response.status_code == 200:
            token = response.json()['access']
            print(f"✅ Authentication successful")
            return token
        else:
            print(f"❌ Authentication failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        return None

def check_authenticated_endpoints():
    """Check API endpoints with authentication"""
    
    token = get_auth_token()
    if not token:
        return
    
    BASE_URL = "http://localhost:2025/api"
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test different endpoint variations
    endpoints = [
        # Sales endpoints
        "/sales/customers/",
        "/api/sales/customers/",
        
        # Inventory endpoints  
        "/inventory/products/",
        "/api/inventory/products/",
        
        # Warehouse endpoints (try different variations)
        "/warehouse/warehouses/",
        "/api/warehouse/warehouses/",
        "/warehouse/",
        "/api/warehouse/",
        
        # Stock movements
        "/warehouse/stock-movements/",
        "/api/warehouse/stock-movements/",
        "/inventory/stock-movements/",
        
        # Sales orders
        "/sales/orders/",
        "/api/sales/orders/",
        "/sales/sales-orders/",
        
        # Accounting
        "/accounting/accounts/",
        "/api/accounting/accounts/",
        
        # HR
        "/hr/employees/",
        "/api/hr/employees/"
    ]
    
    print("\n🔍 Checking Authenticated API Endpoints")
    print("=" * 60)
    
    working_endpoints = []
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers, timeout=10)
            print(f"\n📊 {endpoint}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        count = len(data)
                        print(f"   ✅ Data Count: {count} items")
                        working_endpoints.append((endpoint, count))
                        if count > 0:
                            print(f"   📝 Sample fields: {list(data[0].keys())[:5] if data[0] else 'Empty'}")
                    elif isinstance(data, dict):
                        if 'results' in data:
                            count = len(data['results'])
                            print(f"   ✅ Data Count: {count} items (paginated)")
                            working_endpoints.append((endpoint, count))
                        else:
                            print(f"   ✅ Dict response: {list(data.keys())[:5]}")
                            working_endpoints.append((endpoint, "dict"))
                except Exception as e:
                    print(f"   ❌ JSON parse error: {e}")
            elif response.status_code == 404:
                print(f"   ❌ Not Found")
            elif response.status_code == 401:
                print(f"   ❌ Unauthorized (token issue)")
            else:
                print(f"   ❌ Error {response.status_code}: {response.text[:100]}")
                
        except Exception as e:
            print(f"\n📊 {endpoint}")
            print(f"   ❌ Connection error: {e}")
    
    print("\n" + "=" * 60)
    print("✅ WORKING ENDPOINTS:")
    for endpoint, count in working_endpoints:
        print(f"   {endpoint} - {count} items")
    
    return working_endpoints

if __name__ == "__main__":
    print("🎯 ERP Authenticated Data Check")
    print("=" * 60)
    
    working = check_authenticated_endpoints()
    
    print("\n🔧 FRONTEND FIXES NEEDED:")
    if working:
        print("1. Update frontend API calls to use working endpoint URLs")
        print("2. Ensure authentication tokens are included in requests")
        print("3. Check that frontend api.js includes Authorization headers")
    else:
        print("1. Check Django URL configuration")
        print("2. Verify authentication token handling")
        print("3. Check if apps are properly registered in INSTALLED_APPS")
