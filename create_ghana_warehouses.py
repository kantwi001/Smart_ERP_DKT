#!/usr/bin/env python3
"""
Create warehouses for all regions in Ghana and sync with existing products
"""

import os
import sys
import django
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from warehouse.models import Warehouse, WarehouseStock
from inventory.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

# All 16 regions in Ghana
GHANA_REGIONS = [
    {'name': 'Greater Accra', 'code': 'GAR', 'capital': 'Accra'},
    {'name': 'Ashanti', 'code': 'ASH', 'capital': 'Kumasi'},
    {'name': 'Western', 'code': 'WES', 'capital': 'Sekondi-Takoradi'},
    {'name': 'Eastern', 'code': 'EAS', 'capital': 'Koforidua'},
    {'name': 'Central', 'code': 'CEN', 'capital': 'Cape Coast'},
    {'name': 'Northern', 'code': 'NOR', 'capital': 'Tamale'},
    {'name': 'Upper East', 'code': 'UEA', 'capital': 'Bolgatanga'},
    {'name': 'Upper West', 'code': 'UWE', 'capital': 'Wa'},
    {'name': 'Volta', 'code': 'VOL', 'capital': 'Ho'},
    {'name': 'Brong Ahafo', 'code': 'BAH', 'capital': 'Sunyani'},
    {'name': 'Western North', 'code': 'WNO', 'capital': 'Sefwi Wiawso'},
    {'name': 'Ahafo', 'code': 'AHA', 'capital': 'Goaso'},
    {'name': 'Bono East', 'code': 'BOE', 'capital': 'Techiman'},
    {'name': 'Oti', 'code': 'OTI', 'capital': 'Dambai'},
    {'name': 'North East', 'code': 'NEA', 'capital': 'Nalerigu'},
    {'name': 'Savannah', 'code': 'SAV', 'capital': 'Damongo'}
]

def create_ghana_warehouses():
    """Create warehouses for all regions in Ghana"""
    print("🏭 Creating Ghana Regional Warehouses")
    print("=" * 50)
    
    created_warehouses = []
    
    # Get admin user for manager assignment
    try:
        admin_user = User.objects.filter(is_staff=True).first()
        if not admin_user:
            admin_user = User.objects.first()
    except:
        admin_user = None
    
    for region in GHANA_REGIONS:
        warehouse_name = f"{region['name']} Regional Warehouse"
        warehouse_code = f"GH-{region['code']}-WH"
        address = f"{region['capital']}, {region['name']} Region, Ghana"
        
        # Check if warehouse already exists
        existing_warehouse = Warehouse.objects.filter(code=warehouse_code).first()
        if existing_warehouse:
            print(f"✅ Warehouse already exists: {warehouse_name}")
            created_warehouses.append(existing_warehouse)
            continue
        
        # Create new warehouse
        warehouse = Warehouse.objects.create(
            name=warehouse_name,
            code=warehouse_code,
            address=address,
            manager=admin_user,
            capacity=10000,  # Default capacity
            is_active=True
        )
        
        created_warehouses.append(warehouse)
        print(f"✅ Created: {warehouse_name} ({warehouse_code})")
    
    print(f"\n📊 Total warehouses: {len(created_warehouses)}")
    return created_warehouses

def sync_products_with_warehouses(warehouses):
    """Sync existing products with all warehouses"""
    print("\n📦 Syncing Products with Warehouses")
    print("=" * 50)
    
    products = Product.objects.all()
    total_synced = 0
    
    for product in products:
        for warehouse in warehouses:
            # Check if warehouse stock already exists
            warehouse_stock, created = WarehouseStock.objects.get_or_create(
                warehouse=warehouse,
                product=product,
                defaults={
                    'quantity': product.quantity or 0,  # Use product's current quantity
                    'min_stock_level': product.min_stock or 10,
                    'max_stock_level': product.max_stock or 1000,
                    'reserved_quantity': 0
                }
            )
            
            if created:
                total_synced += 1
                print(f"✅ Synced: {product.name} → {warehouse.name} (Qty: {warehouse_stock.quantity})")
    
    print(f"\n📊 Total product-warehouse relationships synced: {total_synced}")
    return total_synced

if __name__ == "__main__":
    print("🇬🇭 Ghana ERP Warehouse Setup")
    print("=" * 50)
    
    # Create warehouses
    warehouses = create_ghana_warehouses()
    
    # Sync products with warehouses
    if warehouses:
        sync_products_with_warehouses(warehouses)
    
    print("\n✅ Ghana warehouse setup completed!")
    print("🔄 Please restart the backend server to see changes.")
