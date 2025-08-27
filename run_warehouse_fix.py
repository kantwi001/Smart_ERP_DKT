#!/usr/bin/env python3
"""
Quick fix for warehouse API issues
"""
import os
import sys
import django
import subprocess

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def run_django_command(command):
    """Run Django management command"""
    try:
        os.chdir('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
        result = subprocess.run(['python', 'manage.py'] + command.split(), 
                              capture_output=True, text=True)
        print(f"Command: python manage.py {command}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Failed to run command: {e}")
        return False

def setup_warehouse_data():
    """Setup warehouse data using Django ORM"""
    django.setup()
    
    from warehouse.models import Warehouse
    from inventory.models import Product
    
    # Create sample warehouses
    warehouses_data = [
        {'name': 'Main Warehouse', 'code': 'MW001', 'address': 'Central Business District, Accra', 'capacity': 10000, 'is_active': True},
        {'name': 'North Distribution Center', 'code': 'NDC002', 'address': 'Northern Region, Tamale', 'capacity': 5000, 'is_active': True},
        {'name': 'South Storage Facility', 'code': 'SSF003', 'address': 'Western Region, Takoradi', 'capacity': 7500, 'is_active': True}
    ]
    
    print("Creating warehouses...")
    for warehouse_data in warehouses_data:
        warehouse, created = Warehouse.objects.get_or_create(
            code=warehouse_data['code'],
            defaults=warehouse_data
        )
        if created:
            print(f"✅ Created warehouse: {warehouse.name}")
        else:
            print(f"📦 Warehouse exists: {warehouse.name}")
    
    print(f"Total warehouses: {Warehouse.objects.count()}")
    print(f"Total products: {Product.objects.count()}")

def main():
    print("🚀 Running warehouse fix...")
    
    # Run migrations
    print("\n1. Running migrations...")
    run_django_command("makemigrations")
    run_django_command("migrate")
    
    # Setup data
    print("\n2. Setting up warehouse data...")
    setup_warehouse_data()
    
    print("\n✅ Warehouse fix completed!")
    print("🔄 Please restart your Django server.")

if __name__ == '__main__':
    main()
