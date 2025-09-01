#!/usr/bin/env python3
"""
Debug script to check warehouse stock data and ID matching
"""
import os
import sys
import django

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from warehouse.models import Warehouse, WarehouseStock
from inventory.models import Product

def debug_main_warehouse():
    print("=" * 60)
    print("MAIN WAREHOUSE DEBUG")
    print("=" * 60)
    
    # Find all warehouses with "Main" in the name
    main_warehouses = Warehouse.objects.filter(name__icontains='main')
    print(f"Found {main_warehouses.count()} warehouses with 'Main' in name:")
    
    for warehouse in main_warehouses:
        print(f"\n🏢 Warehouse: {warehouse.name}")
        print(f"   ID: {warehouse.id}")
        print(f"   Code: {warehouse.code}")
        print(f"   Address: {warehouse.address}")
        
        # Check stock for this warehouse
        stock_records = WarehouseStock.objects.filter(warehouse=warehouse)
        print(f"   📊 Stock records: {stock_records.count()}")
        
        total_stock = 0
        for stock in stock_records:
            print(f"      - {stock.product.name}: {stock.quantity} units")
            total_stock += stock.quantity
        
        print(f"   📦 Total stock: {total_stock} units")
        print(f"   🏭 Capacity: {warehouse.capacity}")
        
        if total_stock > 0:
            utilization = (total_stock / warehouse.capacity) * 100 if warehouse.capacity else 0
            print(f"   📈 Utilization: {utilization:.1f}%")

def debug_warehouse_stock_api():
    print("\n" + "=" * 60)
    print("WAREHOUSE STOCK API DATA STRUCTURE")
    print("=" * 60)
    
    # Show sample warehouse stock records
    sample_stocks = WarehouseStock.objects.all()[:10]
    print(f"Sample of {sample_stocks.count()} warehouse stock records:")
    
    for stock in sample_stocks:
        print(f"\n📦 Stock Record:")
        print(f"   Warehouse ID: {stock.warehouse.id}")
        print(f"   Warehouse Name: {stock.warehouse.name}")
        print(f"   Product ID: {stock.product.id}")
        print(f"   Product Name: {stock.product.name}")
        print(f"   Quantity: {stock.quantity}")
        print(f"   Min Stock: {getattr(stock, 'min_stock', 'N/A')}")
        print(f"   Max Stock: {getattr(stock, 'max_stock', 'N/A')}")

def check_warehouse_id_consistency():
    print("\n" + "=" * 60)
    print("WAREHOUSE ID CONSISTENCY CHECK")
    print("=" * 60)
    
    # Check for duplicate warehouse names or codes
    warehouses = Warehouse.objects.all()
    names = {}
    codes = {}
    
    for warehouse in warehouses:
        if warehouse.name in names:
            print(f"⚠️  DUPLICATE NAME: '{warehouse.name}' found in warehouses {names[warehouse.name]} and {warehouse.id}")
        else:
            names[warehouse.name] = warehouse.id
            
        if warehouse.code in codes:
            print(f"⚠️  DUPLICATE CODE: '{warehouse.code}' found in warehouses {codes[warehouse.code]} and {warehouse.id}")
        else:
            codes[warehouse.code] = warehouse.id
    
    print(f"✅ Checked {warehouses.count()} warehouses for duplicates")

if __name__ == "__main__":
    debug_main_warehouse()
    debug_warehouse_stock_api()
    check_warehouse_id_consistency()
