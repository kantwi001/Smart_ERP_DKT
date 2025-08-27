#!/usr/bin/env python3

import os
import sys
import django
import psycopg2
from decimal import Decimal

# Add backend to path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from sales.models import Customer
from inventory.models import Product, Category
from warehouse.models import Warehouse
from django.db import connection

User = get_user_model()

def test_postgresql_connection():
    """Test PostgreSQL database connection"""
    print("🔍 Testing PostgreSQL connection...")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connected to: {version}")
            
            # List tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print(f"✅ Found {len(tables)} tables in database")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def test_user_creation():
    """Test user creation and retrieval"""
    print("\n👤 Testing user management...")
    try:
        # Check if superuser exists
        user = User.objects.filter(email='arkucollins@gmail.com').first()
        if user:
            print(f"✅ Superuser exists: {user.email} ({user.first_name} {user.last_name})")
        else:
            print("⚠️ Creating superuser...")
            user = User.objects.create_superuser(
                username='arkucollins',
                email='arkucollins@gmail.com',
                password='admin123',
                first_name='Collins',
                last_name='Arku'
            )
            print(f"✅ Superuser created: {user.email}")
        return True
    except Exception as e:
        print(f"❌ User creation failed: {e}")
        return False

def test_customer_creation():
    """Test customer creation with GPS coordinates"""
    print("\n🏢 Testing customer creation...")
    try:
        # Create test customer
        customer_data = {
            'name': 'Test Customer Ltd',
            'email': 'test@customer.com',
            'phone': '+1234567890',
            'address': '123 Test Street',
            'latitude': 6.6745,  # Using float values
            'longitude': -1.5716,
            'payment_terms': 30
        }
        
        # Check if customer already exists
        existing = Customer.objects.filter(email=customer_data['email']).first()
        if existing:
            print(f"✅ Customer already exists: {existing.name}")
            customer = existing
        else:
            customer = Customer.objects.create(**customer_data)
            print(f"✅ Customer created: {customer.name}")
        
        # Verify GPS coordinates
        print(f"   📍 GPS: {customer.latitude}, {customer.longitude}")
        return True
    except Exception as e:
        print(f"❌ Customer creation failed: {e}")
        return False

def test_product_creation():
    """Test product creation"""
    print("\n📦 Testing product creation...")
    try:
        # Create or get category first
        category, created = Category.objects.get_or_create(
            name='Electronics',
            defaults={'description': 'Electronic products'}
        )
        
        # Create test product
        product_data = {
            'name': 'Test Product',
            'sku': 'TEST001',
            'description': 'Test product for PostgreSQL migration',
            'category': category,
            'quantity': 100
        }
        
        existing = Product.objects.filter(sku=product_data['sku']).first()
        if existing:
            print(f"✅ Product already exists: {existing.name}")
        else:
            product = Product.objects.create(**product_data)
            print(f"✅ Product created: {product.name} ({product.sku})")
        return True
    except Exception as e:
        print(f"❌ Product creation failed: {e}")
        return False

def test_warehouse_creation():
    """Test warehouse creation"""
    print("\n🏭 Testing warehouse creation...")
    try:
        warehouse_data = {
            'name': 'Main Warehouse',
            'code': 'MAIN001',
            'address': 'Test Location',
            'capacity': 1000
        }
        
        existing = Warehouse.objects.filter(code=warehouse_data['code']).first()
        if existing:
            print(f"✅ Warehouse already exists: {existing.name}")
        else:
            warehouse = Warehouse.objects.create(**warehouse_data)
            print(f"✅ Warehouse created: {warehouse.name}")
        return True
    except Exception as e:
        print(f"❌ Warehouse creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 PostgreSQL Migration Test Suite")
    print("=" * 50)
    
    tests = [
        test_postgresql_connection,
        test_user_creation,
        test_customer_creation,
        test_product_creation,
        test_warehouse_creation
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! PostgreSQL migration successful!")
        print("\n🔧 Next steps:")
        print("1. Start backend: ./start_backend.sh")
        print("2. Start frontend: cd frontend && npm start")
        print("3. Test customer creation in web app")
        print("4. Test mobile app connectivity")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
