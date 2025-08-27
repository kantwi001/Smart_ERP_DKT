#!/usr/bin/env python3
"""
Run warehouse migrations and create sample data
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.management import execute_from_command_line
from warehouse.models import Warehouse, WarehouseTransfer
from inventory.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

def run_migrations():
    """Run warehouse migrations"""
    print("🔄 Running warehouse migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations', 'warehouse'])
        execute_from_command_line(['manage.py', 'migrate', 'warehouse'])
        print("✅ Warehouse migrations completed successfully")
    except Exception as e:
        print(f"❌ Migration error: {e}")

def create_sample_warehouses():
    """Create sample warehouses if they don't exist"""
    print("🏭 Creating sample warehouses...")
    
    warehouses_data = [
        {
            'name': 'Main Warehouse',
            'code': 'MW001',
            'address': 'Central Business District, Accra',
            'capacity': 10000,
            'is_active': True
        },
        {
            'name': 'North Distribution Center',
            'code': 'NDC002',
            'address': 'Northern Region, Tamale',
            'capacity': 5000,
            'is_active': True
        },
        {
            'name': 'South Storage Facility',
            'code': 'SSF003',
            'address': 'Western Region, Takoradi',
            'capacity': 7500,
            'is_active': True
        }
    ]
    
    for warehouse_data in warehouses_data:
        warehouse, created = Warehouse.objects.get_or_create(
            code=warehouse_data['code'],
            defaults=warehouse_data
        )
        if created:
            print(f"✅ Created warehouse: {warehouse.name}")
        else:
            print(f"📦 Warehouse exists: {warehouse.name}")

def check_database_status():
    """Check database status"""
    print("🔍 Checking database status...")
    
    try:
        warehouse_count = Warehouse.objects.count()
        transfer_count = WarehouseTransfer.objects.count()
        product_count = Product.objects.count()
        
        print(f"📊 Database Status:")
        print(f"   - Warehouses: {warehouse_count}")
        print(f"   - Transfers: {transfer_count}")
        print(f"   - Products: {product_count}")
        
        if warehouse_count == 0:
            create_sample_warehouses()
            
    except Exception as e:
        print(f"❌ Database check error: {e}")
        print("🔄 Running migrations first...")
        run_migrations()
        create_sample_warehouses()

if __name__ == '__main__':
    print("🚀 Starting warehouse setup...")
    check_database_status()
    print("✅ Warehouse setup completed!")
