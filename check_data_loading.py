#!/usr/bin/env python3

import requests
import json

def check_api_endpoints():
    """Check if all API endpoints are working and returning data"""
    
    BASE_URL = "http://localhost:2025/api"
    
    endpoints = [
        "/sales/customers/",
        "/inventory/products/", 
        "/warehouse/warehouses/",
        "/warehouse/stock-movements/",
        "/sales/orders/",
        "/accounting/accounts/",
        "/hr/employees/"
    ]
    
    print("🔍 Checking API Endpoints and Data")
    print("=" * 50)
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"\n📊 {endpoint}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✅ Data Count: {len(data)} items")
                        if len(data) > 0:
                            print(f"   📝 Sample: {list(data[0].keys())[:5] if data[0] else 'Empty'}")
                        else:
                            print(f"   ⚠️  No data found")
                    elif isinstance(data, dict):
                        if 'results' in data:
                            print(f"   ✅ Data Count: {len(data['results'])} items")
                            if len(data['results']) > 0:
                                print(f"   📝 Sample: {list(data['results'][0].keys())[:5] if data['results'][0] else 'Empty'}")
                        else:
                            print(f"   ✅ Dict response: {list(data.keys())[:5]}")
                    else:
                        print(f"   ✅ Response type: {type(data)}")
                except Exception as e:
                    print(f"   ❌ JSON parse error: {e}")
            else:
                print(f"   ❌ Error: {response.text[:100]}")
                
        except Exception as e:
            print(f"\n📊 {endpoint}")
            print(f"   ❌ Connection error: {e}")

def check_backend_server():
    """Check if Django backend is running"""
    try:
        response = requests.get("http://localhost:2025/", timeout=5)
        print(f"🌐 Backend Server Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend Server Error: {e}")
        return False

if __name__ == "__main__":
    print("🎯 ERP Data Loading Diagnostic")
    print("=" * 50)
    
    if check_backend_server():
        check_api_endpoints()
    else:
        print("\n💡 Backend server is not running!")
        print("   Start it with: cd backend && python manage.py runserver 0.0.0.0:2025")
    
    print("\n" + "=" * 50)
    print("🔧 Next Steps:")
    print("1. Ensure Django backend is running on port 2025")
    print("2. Check if database has sample data")
    print("3. Verify API endpoint URLs in frontend")
    print("4. Check browser Network tab for failed requests")
