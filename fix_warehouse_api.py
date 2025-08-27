#!/usr/bin/env python3
"""
Fix warehouse API by running migrations and creating sample data
"""
import os
import sys
import subprocess

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        print(f"Command: {command}")
        if result.stdout:
            print(f"Output: {result.stdout}")
        if result.stderr:
            print(f"Error: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"Failed to run command: {e}")
        return False

def main():
    backend_dir = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend"
    
    print("🚀 Fixing warehouse API...")
    
    # Run migrations
    print("\n1. Running warehouse migrations...")
    run_command("python manage.py makemigrations warehouse", cwd=backend_dir)
    run_command("python manage.py migrate warehouse", cwd=backend_dir)
    
    # Run all migrations to ensure everything is up to date
    print("\n2. Running all migrations...")
    run_command("python manage.py migrate", cwd=backend_dir)
    
    # Create sample warehouses using Django shell
    print("\n3. Creating sample warehouses...")
    django_script = """
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from warehouse.models import Warehouse

warehouses_data = [
    {'name': 'Main Warehouse', 'code': 'MW001', 'address': 'Central Business District, Accra', 'capacity': 10000, 'is_active': True},
    {'name': 'North Distribution Center', 'code': 'NDC002', 'address': 'Northern Region, Tamale', 'capacity': 5000, 'is_active': True},
    {'name': 'South Storage Facility', 'code': 'SSF003', 'address': 'Western Region, Takoradi', 'capacity': 7500, 'is_active': True}
]

for warehouse_data in warehouses_data:
    warehouse, created = Warehouse.objects.get_or_create(
        code=warehouse_data['code'],
        defaults=warehouse_data
    )
    if created:
        print(f"Created warehouse: {warehouse.name}")
    else:
        print(f"Warehouse exists: {warehouse.name}")

print(f"Total warehouses: {Warehouse.objects.count()}")
"""
    
    # Write the script to a temporary file
    script_file = os.path.join(backend_dir, "temp_warehouse_setup.py")
    with open(script_file, "w") as f:
        f.write(django_script)
    
    # Run the script
    run_command(f"python temp_warehouse_setup.py", cwd=backend_dir)
    
    # Clean up
    if os.path.exists(script_file):
        os.remove(script_file)
    
    print("\n✅ Warehouse API fix completed!")
    print("🔄 Please restart your Django server to apply changes.")

if __name__ == "__main__":
    main()
