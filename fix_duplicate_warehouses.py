#!/usr/bin/env python3
"""
Fix duplicate warehouse names that cause frontend display issues
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

def fix_duplicate_main_warehouses():
    print("=" * 60)
    print("FIXING DUPLICATE MAIN WAREHOUSE NAMES")
    print("=" * 60)
    
    # Find all warehouses with "Main Warehouse" name
    main_warehouses = Warehouse.objects.filter(name='Main Warehouse').order_by('id')
    
    print(f"Found {main_warehouses.count()} warehouses with exact name 'Main Warehouse':")
    
    for i, warehouse in enumerate(main_warehouses):
        stock_count = WarehouseStock.objects.filter(warehouse=warehouse).count()
        total_stock = sum(stock.quantity for stock in WarehouseStock.objects.filter(warehouse=warehouse))
        
        print(f"\n🏢 Warehouse ID {warehouse.id}:")
        print(f"   Name: {warehouse.name}")
        print(f"   Code: {warehouse.code}")
        print(f"   Address: {warehouse.address}")
        print(f"   Stock Records: {stock_count}")
        print(f"   Total Stock: {total_stock}")
        
        # Rename warehouses based on their characteristics
        if warehouse.id == 1 and warehouse.code == 'MAIN001':
            # Empty test warehouse
            warehouse.name = 'Test Warehouse (Legacy)'
            warehouse.save()
            print(f"   ✅ Renamed to: {warehouse.name}")
            
        elif warehouse.id == 4 and warehouse.code == 'MW001':
            # Empty Accra warehouse
            warehouse.name = 'Accra Main Warehouse (Empty)'
            warehouse.save()
            print(f"   ✅ Renamed to: {warehouse.name}")
            
        elif warehouse.id == 23 and warehouse.code == 'MAIN-WH':
            # The real main warehouse with stock
            warehouse.name = 'Main Warehouse (Primary)'
            warehouse.save()
            print(f"   ✅ Renamed to: {warehouse.name}")
        
        else:
            print(f"   ⚠️  Unknown warehouse - not renamed")

def verify_changes():
    print("\n" + "=" * 60)
    print("VERIFICATION - UPDATED WAREHOUSE NAMES")
    print("=" * 60)
    
    # Check all warehouses that used to be "Main Warehouse"
    warehouses = Warehouse.objects.filter(
        id__in=[1, 4, 23]
    ).order_by('id')
    
    for warehouse in warehouses:
        stock_count = WarehouseStock.objects.filter(warehouse=warehouse).count()
        total_stock = sum(stock.quantity for stock in WarehouseStock.objects.filter(warehouse=warehouse))
        
        print(f"\n🏢 ID {warehouse.id}: {warehouse.name}")
        print(f"   Code: {warehouse.code}")
        print(f"   Stock: {total_stock} units in {stock_count} records")

if __name__ == "__main__":
    fix_duplicate_main_warehouses()
    verify_changes()
    print("\n✅ Duplicate warehouse names fixed!")
    print("🔄 Refresh your warehouse dashboard to see the changes.")
