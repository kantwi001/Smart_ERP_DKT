#!/usr/bin/env python3
import os
import sys
import django
from pathlib import Path
import sqlite3
from datetime import datetime

# Set up Django environment
backend_path = Path('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
sys.path.insert(0, str(backend_path))
os.chdir(backend_path)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

print("🔄 RESETTING ERP SYSTEM DATABASE AND USERS")
print("=" * 60)

try:
    django.setup()
    print("✅ Django setup successful")
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    sys.exit(1)

from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line

User = get_user_model()

def reset_system():
    """Complete system reset"""
    
    print("\n🗑️  Step 1: Removing old database...")
    db_path = backend_path / 'db.sqlite3'
    if db_path.exists():
        os.remove(db_path)
        print("✅ Old database removed")
    else:
        print("ℹ️  No existing database found")
    
    print("\n🔧 Step 2: Running migrations...")
    try:
        execute_from_command_line(['manage.py', 'migrate'])
        print("✅ Database migrations completed")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    print("\n🗑️  Step 3: Resetting database...")
    db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'
    
    print("🗑️ Resetting entire database...")
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get current timestamp
    now = datetime.now().isoformat()
    
    # Get all table names except Django system tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'django_%' AND name NOT LIKE 'auth_%' AND name NOT LIKE 'sqlite_%'")
    tables = cursor.fetchall()
    
    # Delete all data from business tables
    business_tables = [
        'sales_customer', 'sales_sale', 'pos_possession', 'pos_sale',
        'procurement_vendor', 'procurement_procurementrequest',
        'accounting_transaction', 'manufacturing_workorder',
        'purchasing_purchaseorder', 'warehouse_warehouselocation',
        'warehouse_stockmovement', 'inventory_product', 'inventory_category',
        'inventory_productprice', 'hr_employee', 'hr_department'
    ]
    
    for table in business_tables:
        try:
            cursor.execute(f"DELETE FROM {table}")
            print(f"✅ Cleared {table}")
        except sqlite3.OperationalError:
            pass  # Table doesn't exist
    
    # Reset auto-increment counters
    cursor.execute("DELETE FROM sqlite_sequence WHERE name NOT LIKE 'django_%' AND name NOT LIKE 'auth_%'")
    
    conn.commit()
    
    # Create fresh categories (no timestamps for Category model)
    cursor.execute("INSERT INTO inventory_category (name, description) VALUES (?, ?)", 
                  ('Electronics', 'Electronic devices'))
    electronics_id = cursor.lastrowid
    
    cursor.execute("INSERT INTO inventory_category (name, description) VALUES (?, ?)", 
                  ('Food & Beverages', 'Food items'))
    food_id = cursor.lastrowid
    
    # Create fresh products (with timestamps for Product model)
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
        
        # Add prices (no timestamps for ProductPrice model)
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
    
    # Create customers (with customer_type field required)
    customers = [
        ('John Doe', 'john@example.com', '+1234567890', 'Sample Address', 'retailer'),
        ('Jane Smith', 'jane@example.com', '+1234567891', 'Sample Address', 'wholesaler'),
        ('Bob Johnson', 'bob@example.com', '+1234567892', 'Sample Address', 'distributor')
    ]
    
    for name, email, phone, address, customer_type in customers:
        cursor.execute("INSERT INTO sales_customer (name, email, phone, address, customer_type, payment_terms, is_blacklisted) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      (name, email, phone, address, customer_type, 30, 0))
    
    # Create vendors (with contact_person field required)
    vendors = [
        ('Tech Supplier Inc', 'John Smith', 'tech@supplier.com', '+1234567800', 'Vendor Address'),
        ('Food Distributors Ltd', 'Jane Doe', 'food@distributor.com', '+1234567801', 'Vendor Address'),
        ('General Supplies Co', 'Bob Wilson', 'general@supplies.com', '+1234567802', 'Vendor Address')
    ]
    
    for name, contact_person, email, phone, address in vendors:
        cursor.execute("INSERT INTO procurement_vendor (name, contact_person, email, phone, address, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      (name, contact_person, email, phone, address, 1, now))
    
    conn.commit()
    conn.close()
    
    print("✅ Database completely reset!")
    print("✅ Created 5 products with multi-currency pricing")
    print("✅ Created 3 customers for Sales/POS")
    print("✅ Created 3 vendors for Procurement")
    print("🔗 All modules now have synced sample data")
    
    print("\n👤 Step 4: Creating admin users...")
    
    # Create demo users for login
    demo_users = [
        {
            'username': 'admin@erp.com',
            'email': 'admin@erp.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_superuser': True,
            'is_staff': True,
            'role': 'superadmin'
        },
        {
            'username': 'manager@erp.com',
            'email': 'manager@erp.com',
            'password': 'manager123',
            'first_name': 'Manager',
            'last_name': 'User',
            'is_superuser': False,
            'is_staff': True,
            'role': 'manager'
        },
        {
            'username': 'employee@erp.com',
            'email': 'employee@erp.com',
            'password': 'employee123',
            'first_name': 'Employee',
            'last_name': 'User',
            'is_superuser': False,
            'is_staff': False,
            'role': 'employee'
        },
        {
            'username': 'sales@erp.com',
            'email': 'sales@erp.com',
            'password': 'sales123',
            'first_name': 'Sales',
            'last_name': 'User',
            'is_superuser': False,
            'is_staff': False,
            'role': 'sales'
        }
    ]
    
    for user_data in demo_users:
        try:
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name']
            )
            user.is_superuser = user_data['is_superuser']
            user.is_staff = user_data['is_staff']
            if hasattr(user, 'role'):
                user.role = user_data['role']
            user.save()
            
            status = "SUPERUSER" if user.is_superuser else "USER"
            print(f"✅ Created {status}: {user.username} / {user_data['password']}")
            
        except Exception as e:
            print(f"❌ Failed to create user {user_data['username']}: {e}")
    
    print("\n📊 Step 5: Listing all users...")
    users = User.objects.all()
    print(f"Total users created: {users.count()}")
    print("-" * 40)
    for user in users:
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Superuser: {'Yes' if user.is_superuser else 'No'}")
        print(f"Active: {'Yes' if user.is_active else 'No'}")
        print("-" * 20)
    
    print("\n🎉 SYSTEM RESET COMPLETE!")
    print("=" * 60)
    print("LOGIN CREDENTIALS:")
    print("- Admin: admin@erp.com / admin123")
    print("- Manager: manager@erp.com / manager123") 
    print("- Employee: employee@erp.com / employee123")
    print("- Sales: sales@erp.com / sales123")
    print("=" * 60)
    print("✅ Database: SQLite at backend/db.sqlite3")
    print("✅ Backend Port: 2025")
    print("✅ Frontend Port: 2026")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    success = reset_system()
    if success:
        print("\n🚀 Ready to start servers!")
        print("Run: ./start_servers.sh")
    else:
        print("\n❌ Reset failed. Check errors above.")
        sys.exit(1)
