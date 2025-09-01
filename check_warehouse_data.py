#!/usr/bin/env python3
"""
Diagnostic script to check warehouse data and API connectivity
"""
import os
import sys
import django
import requests
from datetime import datetime

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from warehouse.models import Warehouse, WarehouseStock, WarehouseLocation
from inventory.models import Product

def check_database():
    """Check database for warehouse and product data"""
    print("=" * 60)
    print("DATABASE CHECK")
    print("=" * 60)
    
    # Check products
    products = Product.objects.all()
    print(f"📦 Products in database: {products.count()}")
    for product in products:
        print(f"   - {product.name} (SKU: {product.sku}) - Stock: {product.quantity}")
    
    # Check warehouses
    warehouses = Warehouse.objects.all()
    print(f"\n🏢 Warehouses in database: {warehouses.count()}")
    for warehouse in warehouses:
        print(f"   - {warehouse.name} ({warehouse.code}) - {warehouse.address}")
    
    # Check warehouse locations
    locations = WarehouseLocation.objects.all()
    print(f"\n📍 Warehouse locations: {locations.count()}")
    for location in locations:
        print(f"   - {location.name} in {location.warehouse.name}")
    
    # Check warehouse stock
    warehouse_stocks = WarehouseStock.objects.all()
    print(f"\n📊 Warehouse stock records: {warehouse_stocks.count()}")
    for stock in warehouse_stocks[:10]:  # Show first 10
        print(f"   - {stock.warehouse.name}: {stock.product.name} = {stock.quantity} units")
    
    if warehouse_stocks.count() > 10:
        print(f"   ... and {warehouse_stocks.count() - 10} more records")

def check_api_endpoints():
    """Check API endpoints"""
    print("\n" + "=" * 60)
    print("API ENDPOINTS CHECK")
    print("=" * 60)
    
    base_url = "http://localhost:2025"
    endpoints = [
        "/api/warehouse/",
        "/api/inventory/products/",
        "/api/warehouse/stock/",
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{base_url}{endpoint}"
            print(f"\n🔗 Testing: {url}")
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    print(f"   ✅ SUCCESS - {len(data)} records returned")
                    if data:
                        print(f"   📄 Sample: {str(data[0])[:100]}...")
                elif isinstance(data, dict):
                    print(f"   ✅ SUCCESS - Response: {str(data)[:100]}...")
                else:
                    print(f"   ✅ SUCCESS - Data type: {type(data)}")
            else:
                print(f"   ❌ ERROR - Status: {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ CONNECTION ERROR - Backend server not running on {base_url}")
        except requests.exceptions.Timeout:
            print(f"   ❌ TIMEOUT ERROR - Server took too long to respond")
        except Exception as e:
            print(f"   ❌ ERROR - {str(e)}")

def main():
    print(f"🔍 WAREHOUSE DATA DIAGNOSTIC - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        check_database()
        check_api_endpoints()
        
        print("\n" + "=" * 60)
        print("SUMMARY & RECOMMENDATIONS")
        print("=" * 60)
        
        # Check if data exists
        products_count = Product.objects.count()
        warehouses_count = Warehouse.objects.count()
        stock_count = WarehouseStock.objects.count()
        
        if products_count == 0:
            print("❌ No products found - Run product creation script first")
        else:
            print(f"✅ {products_count} products found")
            
        if warehouses_count == 0:
            print("❌ No warehouses found - Run warehouse sync script")
            print("   Command: python sync_existing_products_to_warehouse.py")
        else:
            print(f"✅ {warehouses_count} warehouses found")
            
        if stock_count == 0:
            print("❌ No warehouse stock records - Run warehouse sync script")
            print("   Command: python sync_existing_products_to_warehouse.py")
        else:
            print(f"✅ {stock_count} warehouse stock records found")
            
        print("\n📋 Next steps:")
        if warehouses_count == 0 or stock_count == 0:
            print("1. Ensure backend server is running: python manage.py runserver localhost:2025")
            print("2. Run sync script: python sync_existing_products_to_warehouse.py")
            print("3. Refresh warehouse dashboard in browser")
        else:
            print("1. Check browser console for frontend errors")
            print("2. Verify API endpoints are accessible")
            print("3. Check network tab in browser dev tools")
            
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        print("Make sure you're in the correct directory and Django is set up properly")

if __name__ == "__main__":
    main()
