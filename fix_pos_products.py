#!/usr/bin/env python3
import os
import sys
import sqlite3
from datetime import datetime

# Path to database
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

def fix_pos_products():
    """Check products and recreate if missing"""
    
    print("🔍 Checking product data...")
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if products exist
    cursor.execute("SELECT COUNT(*) FROM inventory_product")
    product_count = cursor.fetchone()[0]
    print(f"Current products in database: {product_count}")
    
    if product_count == 0:
        print("⚠️ No products found! Creating sample products...")
        
        # Get current timestamp
        now = datetime.now().isoformat()
        
        # Create categories first
        cursor.execute("DELETE FROM inventory_category")
        cursor.execute("INSERT INTO inventory_category (name, description) VALUES (?, ?)", 
                      ('Electronics', 'Electronic devices'))
        electronics_id = cursor.lastrowid
        
        cursor.execute("INSERT INTO inventory_category (name, description) VALUES (?, ?)", 
                      ('Food & Beverages', 'Food items'))
        food_id = cursor.lastrowid
        
        # Create products
        products = [
            ('Smartphone', 'PHONE-001', 25, electronics_id, 'Latest smartphone'),
            ('Laptop', 'LAPTOP-001', 15, electronics_id, 'High-performance laptop'),
            ('Coffee Beans', 'COFFEE-001', 100, food_id, 'Premium coffee beans'),
            ('T-Shirt', 'TSHIRT-001', 50, electronics_id, 'Cotton t-shirt'),
            ('Headphones', 'HEADPHONE-001', 30, electronics_id, 'Wireless headphones')
        ]
        
        for name, sku, qty, cat_id, desc in products:
            cursor.execute("INSERT INTO inventory_product (name, sku, quantity, category_id, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", 
                          (name, sku, qty, cat_id, desc, now, now))
            product_id = cursor.lastrowid
            
            # Add prices
            prices = {
                'PHONE-001': {'SLL': 2500000, 'USD': 299, 'GHS': 1800, 'LRD': 45000},
                'LAPTOP-001': {'SLL': 8500000, 'USD': 999, 'GHS': 6200, 'LRD': 155000},
                'COFFEE-001': {'SLL': 125000, 'USD': 15, 'GHS': 90, 'LRD': 2300},
                'TSHIRT-001': {'SLL': 250000, 'USD': 29, 'GHS': 180, 'LRD': 4500},
                'HEADPHONE-001': {'SLL': 750000, 'USD': 89, 'GHS': 540, 'LRD': 13500}
            }
            
            for currency, price in prices[sku].items():
                cursor.execute("INSERT INTO inventory_productprice (product_id, currency, price) VALUES (?, ?, ?)",
                              (product_id, currency, price))
        
        conn.commit()
        print("✅ Created 5 sample products with pricing")
    
    # Verify products exist and show them
    cursor.execute("SELECT id, name, sku, quantity FROM inventory_product")
    products = cursor.fetchall()
    
    print(f"\n📦 Products in database ({len(products)}):")
    for product in products:
        print(f"  - ID: {product[0]}, Name: {product[1]}, SKU: {product[2]}, Stock: {product[3]}")
    
    conn.close()
    
    print("\n🔧 Products ready for POS!")
    print("Now refresh your POS page and try the New Transaction again.")

if __name__ == "__main__":
    fix_pos_products()
