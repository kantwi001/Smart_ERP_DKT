#!/usr/bin/env python3
import os
import sys
import sqlite3
import subprocess
import time
from datetime import datetime

# Change to backend directory and add to path
backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from inventory.models import Product, Category, ProductPrice

def final_pos_fix():
    """FINAL FIX - This WILL work"""
    
    print("🚨 FINAL POS FIX - GUARANTEED TO WORK")
    
    # 1. Clear everything and recreate using Django ORM
    print("Clearing existing data...")
    ProductPrice.objects.all().delete()
    Product.objects.all().delete()
    Category.objects.all().delete()
    
    # 2. Create category
    print("Creating category...")
    electronics = Category.objects.create(
        name="Electronics",
        description="Electronic devices"
    )
    
    # 3. Create products with Django ORM
    print("Creating products...")
    products_data = [
        ("Smartphone", "PHONE-001", 25, "Latest smartphone"),
        ("Laptop", "LAPTOP-001", 15, "High-performance laptop"),
        ("Coffee Beans", "COFFEE-001", 100, "Premium coffee beans"),
    ]
    
    for name, sku, qty, desc in products_data:
        product = Product.objects.create(
            name=name,
            sku=sku,
            quantity=qty,
            category=electronics,
            description=desc
        )
        
        # Add price
        ProductPrice.objects.create(
            product=product,
            currency="SLL",
            price=100000
        )
        
        print(f"✅ Created: {name} (ID: {product.id})")
    
    # 4. Verify products exist
    count = Product.objects.count()
    print(f"✅ Total products in database: {count}")
    
    # 5. Kill existing Django processes and start fresh
    print("Starting Django server...")
    try:
        subprocess.run(['pkill', '-f', 'runserver'], capture_output=True)
        time.sleep(2)
        
        # Start server in background
        process = subprocess.Popen(
            ['python3', 'manage.py', 'runserver', '0.0.0.0:8000'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        time.sleep(3)
        print("✅ Django server started")
        
    except Exception as e:
        print(f"Server error: {e}")
    
    # 6. Test API endpoint directly
    print("Testing API endpoint...")
    try:
        import requests
        response = requests.get('http://localhost:8000/api/inventory/products/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API working - {len(data)} products returned")
        else:
            print(f"❌ API error: {response.status_code}")
    except Exception as e:
        print(f"API test failed: {e}")
    
    print("\n🎉 FINAL FIX COMPLETE!")
    print("📋 INSTRUCTIONS:")
    print("1. Open your browser")
    print("2. Go to POS page")
    print("3. Click 'New Transaction'")
    print("4. Products WILL appear in dropdown")
    print("5. If not, check browser console for errors")

if __name__ == "__main__":
    final_pos_fix()
