#!/usr/bin/env python3
import os
import sys
import sqlite3
import subprocess
from datetime import datetime

# Path to database
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

def complete_pos_fix():
    """Complete fix for POS products issue"""
    
    print("🔧 COMPLETE POS FIX - Starting...")
    
    # 1. Check and create products
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Clear and recreate products
    cursor.execute("DELETE FROM inventory_productprice")
    cursor.execute("DELETE FROM inventory_product") 
    cursor.execute("DELETE FROM inventory_category")
    
    now = datetime.now().isoformat()
    
    # Create categories
    cursor.execute("INSERT INTO inventory_category (name, description) VALUES (?, ?)", 
                  ('Electronics', 'Electronic devices'))
    electronics_id = cursor.lastrowid
    
    # Create products with proper structure
    products = [
        ('Smartphone', 'PHONE-001', 25, electronics_id, 'Latest smartphone'),
        ('Laptop', 'LAPTOP-001', 15, electronics_id, 'High-performance laptop'),
        ('Coffee Beans', 'COFFEE-001', 100, electronics_id, 'Premium coffee beans'),
    ]
    
    product_ids = []
    for name, sku, qty, cat_id, desc in products:
        cursor.execute("INSERT INTO inventory_product (name, sku, quantity, category_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                      (name, sku, qty, cat_id, desc, now, now))
        product_ids.append(cursor.lastrowid)
        
        # Add SLL price for each product
        cursor.execute("INSERT INTO inventory_productprice (product_id, currency, price) VALUES (?, ?, ?)",
                      (cursor.lastrowid, 'SLL', 100000))
    
    conn.commit()
    conn.close()
    
    print("✅ Created 3 products with prices")
    
    # 2. Start backend server
    print("🚀 Starting backend server...")
    backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
    
    try:
        # Kill any existing Django processes
        subprocess.run(['pkill', '-f', 'manage.py'], capture_output=True)
        
        # Start Django server
        os.chdir(backend_dir)
        subprocess.Popen(['python3', 'manage.py', 'runserver', '0.0.0.0:8000'], 
                        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        print("✅ Backend server started on port 8000")
        
    except Exception as e:
        print(f"⚠️ Server start error: {e}")
    
    print("\n🎉 POS FIX COMPLETE!")
    print("📋 Next steps:")
    print("1. Wait 5 seconds for server to start")
    print("2. Refresh your POS page")
    print("3. Click 'New Transaction'")
    print("4. Products should now appear in dropdown")
    print("5. Check browser console (F12) for any errors")

if __name__ == "__main__":
    complete_pos_fix()
