#!/bin/bash
echo "🚀 Executing warehouse fix..."

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Run migrations
echo "1. Running migrations..."
python3 manage.py makemigrations warehouse
python3 manage.py migrate warehouse
python3 manage.py migrate

# Create sample warehouses using Django shell
echo "2. Creating sample warehouses..."
python3 manage.py shell << EOF
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
        print(f"✅ Created warehouse: {warehouse.name}")
    else:
        print(f"📦 Warehouse exists: {warehouse.name}")

print(f"Total warehouses: {Warehouse.objects.count()}")
EOF

echo "✅ Warehouse fix completed!"
echo "🔄 Please restart your Django server to apply changes."
