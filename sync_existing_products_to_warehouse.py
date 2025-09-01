#!/usr/bin/env python3
"""
Sync existing products with warehouse stock data for ERP system
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

from warehouse.models import Warehouse, WarehouseStock, WarehouseLocation
from inventory.models import Product, Category
from django.contrib.auth import get_user_model
import random

User = get_user_model()

def sync_existing_products_to_warehouses():
    print("Syncing existing products with warehouse stock data...")
    
    # Get or create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@smarterp.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'is_staff': True,
            'is_superuser': True
        }
    )
    
    # Create/update warehouses based on your existing setup
    warehouses_data = [
        {
            'name': 'Main Warehouse',
            'code': 'MAIN-WH',
            'address': 'Plot 123, Industrial Area, Tema, Ghana',
            'capacity': 50000,
            'manager': admin_user
        },
        {
            'name': 'Accra Branch',
            'code': 'ACCRA-BR',
            'address': '45 Liberation Road, Accra, Ghana',
            'capacity': 25000,
            'manager': admin_user
        },
        {
            'name': 'Kumasi Branch',
            'code': 'KUMASI-BR',
            'address': '78 Prempeh II Street, Kumasi, Ghana',
            'capacity': 20000,
            'manager': admin_user
        },
        {
            'name': 'Takoradi Branch',
            'code': 'TAKORADI-BR',
            'address': '12 Harbour Road, Takoradi, Ghana',
            'capacity': 15000,
            'manager': admin_user
        },
        {
            'name': 'Tamale Branch',
            'code': 'TAMALE-BR',
            'address': '34 Central Market Road, Tamale, Ghana',
            'capacity': 12000,
            'manager': admin_user
        }
    ]
    
    warehouses = []
    for wh_data in warehouses_data:
        warehouse, created = Warehouse.objects.get_or_create(
            code=wh_data['code'],
            defaults=wh_data
        )
        warehouses.append(warehouse)
        if created:
            print(f"✅ Created warehouse: {warehouse.name}")
        else:
            print(f"📦 Warehouse exists: {warehouse.name}")
    
    # Get all existing products from the database
    existing_products = Product.objects.all()
    print(f"\n📱 Found {existing_products.count()} existing products in database:")
    
    for product in existing_products:
        print(f"  - {product.name} (SKU: {product.sku})")
    
    if not existing_products.exists():
        print("❌ No products found in database. Please create products first.")
        return
    
    # Create stock data for existing products
    print(f"\n🏭 Creating warehouse stock for {existing_products.count()} products...")
    
    # Define stock distribution patterns for different warehouses
    stock_patterns = {
        'MAIN-WH': {  # Main warehouse gets highest stock
            'base_multiplier': 1.0,
            'min_stock': 50,
            'max_stock': 1000
        },
        'ACCRA-BR': {  # Accra branch gets medium stock
            'base_multiplier': 0.6,
            'min_stock': 20,
            'max_stock': 400
        },
        'KUMASI-BR': {  # Kumasi branch gets lower stock
            'base_multiplier': 0.4,
            'min_stock': 10,
            'max_stock': 200
        },
        'TAKORADI-BR': {  # Takoradi branch gets minimal stock
            'base_multiplier': 0.3,
            'min_stock': 5,
            'max_stock': 150
        },
        'TAMALE-BR': {  # Tamale branch gets minimal stock
            'base_multiplier': 0.2,
            'min_stock': 5,
            'max_stock': 100
        }
    }
    
    # Create stock records for each product in each warehouse
    total_stock_records = 0
    
    for product in existing_products:
        print(f"\n📦 Processing product: {product.name}")
        
        for warehouse in warehouses:
            pattern = stock_patterns.get(warehouse.code, stock_patterns['TAMALE-BR'])
            
            # Calculate stock quantity based on the product name and warehouse pattern
            if 'Fiesta' in product.name:
                base_quantity = 100  # Condoms - high volume
            elif 'Emergency' in product.name:
                base_quantity = 225  # Emergency contraceptive - medium volume
            elif 'STRAWBERRY' in product.name:
                base_quantity = 670  # Flavored products - high volume
            elif 'ALL NIGHT' in product.name:
                base_quantity = 113  # Specialty products - medium volume
            else:
                base_quantity = 50   # Default for other products
            
            # Apply warehouse multiplier
            final_quantity = int(base_quantity * pattern['base_multiplier'])
            final_quantity = max(pattern['min_stock'], min(final_quantity, pattern['max_stock']))
            
            # Set minimum stock level (10-20% of current stock)
            min_stock_level = max(1, int(final_quantity * 0.15))
            
            # Create or update warehouse stock
            stock, created = WarehouseStock.objects.get_or_create(
                warehouse=warehouse,
                product=product,
                defaults={
                    'quantity': final_quantity,
                    'min_stock_level': min_stock_level,
                    'max_stock_level': final_quantity * 2,
                    'reserved_quantity': 0
                }
            )
            
            if created:
                print(f"  ✅ {warehouse.name}: {final_quantity} units (Min: {min_stock_level})")
                total_stock_records += 1
            else:
                # Update existing stock
                stock.quantity = final_quantity
                stock.min_stock_level = min_stock_level
                stock.max_stock_level = final_quantity * 2
                stock.save()
                print(f"  🔄 {warehouse.name}: Updated to {final_quantity} units (Min: {min_stock_level})")
    
    # Create warehouse locations for better organization
    locations_data = [
        {'warehouse': warehouses[0], 'name': 'A-Zone', 'code': 'A-01', 'aisle': 'A', 'shelf': '01'},
        {'warehouse': warehouses[0], 'name': 'B-Zone', 'code': 'B-01', 'aisle': 'B', 'shelf': '01'},
        {'warehouse': warehouses[0], 'name': 'C-Zone', 'code': 'C-01', 'aisle': 'C', 'shelf': '01'},
        {'warehouse': warehouses[1], 'name': 'Main Floor', 'code': 'MF-01', 'aisle': 'M', 'shelf': '01'},
        {'warehouse': warehouses[2], 'name': 'Storage Area', 'code': 'SA-01', 'aisle': 'S', 'shelf': '01'},
        {'warehouse': warehouses[3], 'name': 'Dock Area', 'code': 'DA-01', 'aisle': 'D', 'shelf': '01'},
        {'warehouse': warehouses[4], 'name': 'Receiving', 'code': 'RC-01', 'aisle': 'R', 'shelf': '01'},
    ]
    
    for loc_data in locations_data:
        location, created = WarehouseLocation.objects.get_or_create(
            warehouse=loc_data['warehouse'],
            code=loc_data['code'],
            defaults=loc_data
        )
        if created:
            print(f"📍 Created location: {location.warehouse.name} - {location.name}")
    
    # Print final summary
    print(f"\n✅ Successfully synced warehouse stock data!")
    print(f"📦 Products processed: {existing_products.count()}")
    print(f"🏭 Warehouses: {len(warehouses)}")
    print(f"📊 Total stock records: {WarehouseStock.objects.count()}")
    
    print(f"\n📋 WAREHOUSE STOCK SUMMARY:")
    for warehouse in warehouses:
        stock_records = WarehouseStock.objects.filter(warehouse=warehouse)
        total_items = sum(stock.quantity for stock in stock_records)
        low_stock_items = sum(1 for stock in stock_records if stock.is_low_stock)
        
        print(f"  {warehouse.name} ({warehouse.code}):")
        print(f"    - Products: {stock_records.count()}")
        print(f"    - Total Items: {total_items:,}")
        print(f"    - Low Stock Items: {low_stock_items}")
        
        # Show top 3 products by quantity
        top_products = stock_records.order_by('-quantity')[:3]
        if top_products:
            print(f"    - Top Products:")
            for stock in top_products:
                print(f"      • {stock.product.name}: {stock.quantity} units")
        print()

if __name__ == "__main__":
    sync_existing_products_to_warehouses()
