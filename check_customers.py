#!/usr/bin/env python3
"""
Debug script to check customer data and API endpoints
"""
import os
import sys
import django
import requests

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def check_customer_models():
    print("=" * 60)
    print("CUSTOMER DATABASE CHECK")
    print("=" * 60)
    
    try:
        # Try different possible customer model locations
        try:
            from sales.models import Customer
            customers = Customer.objects.all()
            print(f"📦 Found Customer model in sales app")
            print(f"📊 Total customers: {customers.count()}")
            
            for customer in customers[:10]:  # Show first 10
                print(f"   - {customer.name} ({getattr(customer, 'email', 'No email')})")
                
        except ImportError:
            print("❌ No Customer model found in sales app")
            
        try:
            from customers.models import Customer
            customers = Customer.objects.all()
            print(f"📦 Found Customer model in customers app")
            print(f"📊 Total customers: {customers.count()}")
            
            for customer in customers[:10]:  # Show first 10
                print(f"   - {customer.name} ({getattr(customer, 'email', 'No email')})")
                
        except ImportError:
            print("❌ No Customer model found in customers app")
            
        try:
            from django.contrib.auth.models import User
            users = User.objects.all()
            print(f"📦 Found User model")
            print(f"📊 Total users: {users.count()}")
            
            for user in users[:10]:  # Show first 10
                print(f"   - {user.username} ({user.email})")
                
        except ImportError:
            print("❌ No User model found")
            
    except Exception as e:
        print(f"❌ Error checking customer models: {e}")

def check_customer_api_endpoints():
    print("\n" + "=" * 60)
    print("CUSTOMER API ENDPOINTS CHECK")
    print("=" * 60)
    
    base_url = "http://localhost:2025"
    endpoints = [
        "/api/customers/",
        "/api/sales/customers/",
        "/customers/",
        "/sales/customers/",
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"\n🔗 Testing: {url}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        print(f"   ✅ SUCCESS - {len(data)} customers returned")
                        if data:
                            print(f"   📄 Sample: {str(data[0])[:100]}...")
                    elif isinstance(data, dict):
                        results = data.get('results', [])
                        print(f"   ✅ SUCCESS - {len(results)} customers returned")
                        if results:
                            print(f"   📄 Sample: {str(results[0])[:100]}...")
                    else:
                        print(f"   ✅ SUCCESS - Data type: {type(data)}")
                except:
                    print(f"   ✅ SUCCESS - Non-JSON response: {response.text[:100]}...")
            elif response.status_code == 401:
                print(f"   ⚠️  AUTHENTICATION REQUIRED - Status: {response.status_code}")
            elif response.status_code == 404:
                print(f"   ❌ NOT FOUND - Status: {response.status_code}")
            else:
                print(f"   ❌ ERROR - Status: {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Backend server not running")
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT ERROR - Server took too long to respond")
        except Exception as e:
            print(f"   ❌ ERROR - {str(e)}")

def check_django_apps():
    print("\n" + "=" * 60)
    print("DJANGO APPS CHECK")
    print("=" * 60)
    
    from django.conf import settings
    installed_apps = settings.INSTALLED_APPS
    
    customer_related_apps = [app for app in installed_apps if 'customer' in app.lower() or 'sales' in app.lower()]
    
    print("Customer/Sales related apps:")
    for app in customer_related_apps:
        print(f"   - {app}")
        
    if not customer_related_apps:
        print("❌ No customer or sales related apps found")
        
    print(f"\nAll installed apps ({len(installed_apps)}):")
    for app in installed_apps:
        print(f"   - {app}")

if __name__ == "__main__":
    check_customer_models()
    check_customer_api_endpoints()
    check_django_apps()
