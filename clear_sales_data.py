#!/usr/bin/env python3
import os
import sys
import sqlite3

# Path to database
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

def clear_sales_data():
    """Clear all data from Sales module and submodules"""
    
    print("🗑️ Clearing all Sales module data...")
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Sales module tables to clear
    sales_tables = [
        'sales_customer',
        'sales_sale', 
        'sales_customerapproval',
        'sales_quote',
        'sales_lead',
        'sales_promotion',
        'sales_promotionproduct',
        'sales_promotion_applicable_products'  # Many-to-many table
    ]
    
    for table in sales_tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
            count = cursor.rowcount
            print(f"✅ Cleared {count} records from {table}")
        except sqlite3.OperationalError as e:
            print(f"⚠️  Table {table} not found or error: {e}")
    
    # Reset auto-increment counters for sales tables
    for table in sales_tables:
        try:
            cursor.execute(f"DELETE FROM sqlite_sequence WHERE name = '{table}'")
        except sqlite3.OperationalError:
            pass
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Sales module data cleared successfully!")
    print("✅ All customers, sales, quotes, leads, and promotions removed")
    print("🔒 Inventory and other modules preserved")

if __name__ == "__main__":
    clear_sales_data()
