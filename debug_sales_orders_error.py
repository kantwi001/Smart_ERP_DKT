#!/usr/bin/env python3
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

def test_sales_models():
    """Test if sales models can be imported and used"""
    try:
        print("=== Testing Sales Models Import ===")
        
        # Test basic imports
        from sales.models import SalesOrder, Customer
        print("✅ Basic models imported successfully")
        
        # Test Payment model import
        try:
            from sales.models import Payment
            print("✅ Payment model imported successfully")
        except ImportError as e:
            print(f"❌ Payment model import failed: {e}")
            return False
        
        # Test model queries
        print(f"Total customers: {Customer.objects.count()}")
        print(f"Total sales orders: {SalesOrder.objects.count()}")
        
        try:
            print(f"Total payments: {Payment.objects.count()}")
        except Exception as e:
            print(f"❌ Payment model query failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Model import/test failed: {e}")
        return False

def test_serializers():
    """Test if serializers can be imported"""
    try:
        print("\n=== Testing Serializers Import ===")
        
        from sales.serializers import SalesOrderSerializer, CustomerSerializer
        print("✅ Basic serializers imported successfully")
        
        try:
            from sales.serializers import PaymentSerializer
            print("✅ Payment serializer imported successfully")
        except ImportError as e:
            print(f"❌ Payment serializer import failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Serializer import failed: {e}")
        return False

def test_api_endpoint():
    """Test the sales orders API endpoint"""
    try:
        print("\n=== Testing API Endpoint ===")
        
        from sales.views import SalesOrderViewSet
        from sales.models import SalesOrder
        from sales.serializers import SalesOrderSerializer
        
        # Test queryset
        queryset = SalesOrder.objects.all()
        print(f"✅ Queryset works: {queryset.count()} orders")
        
        # Test serializer
        if queryset.exists():
            order = queryset.first()
            serializer = SalesOrderSerializer(order)
            print("✅ Serializer works")
            
            # Check for problematic fields
            data = serializer.data
            print(f"Order data keys: {list(data.keys())}")
            
            # Check for Payment-related fields
            if 'payments' in data:
                print(f"✅ Payments field present: {len(data['payments'])} payments")
            else:
                print("⚠️ Payments field missing from serializer")
        else:
            print("ℹ️ No sales orders to test serialization")
        
        return True
        
    except Exception as e:
        print(f"❌ API endpoint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_migrations():
    """Check migration status"""
    try:
        print("\n=== Checking Migration Status ===")
        
        import subprocess
        
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Check migration status
        result = subprocess.run([
            sys.executable, 'manage.py', 'showmigrations', 'sales'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Migration status:")
            print(result.stdout)
            
            # Check if there are unapplied migrations
            if '[ ]' in result.stdout:
                print("⚠️ Unapplied migrations found")
                return False
            else:
                print("✅ All migrations applied")
                return True
        else:
            print(f"❌ Error checking migrations: {result.stderr}")
            return False
        
    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return False

def fix_issues():
    """Attempt to fix common issues"""
    try:
        print("\n=== Attempting Fixes ===")
        
        import subprocess
        
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Create migrations
        print("Creating migrations...")
        result = subprocess.run([
            sys.executable, 'manage.py', 'makemigrations', 'sales'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations created")
            print(result.stdout)
        else:
            print(f"Migration creation output: {result.stderr}")
        
        # Apply migrations
        print("Applying migrations...")
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate', 'sales'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations applied")
            print(result.stdout)
            return True
        else:
            print(f"❌ Migration failed: {result.stderr}")
            return False
        
    except Exception as e:
        print(f"❌ Fix attempt failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Debugging Sales Orders Loading Error")
    
    # Test models
    models_ok = test_sales_models()
    
    # Test serializers
    serializers_ok = test_serializers()
    
    # Check migrations
    migrations_ok = check_migrations()
    
    # Test API endpoint
    api_ok = test_api_endpoint()
    
    print("\n=== Summary ===")
    print(f"Models: {'✅' if models_ok else '❌'}")
    print(f"Serializers: {'✅' if serializers_ok else '❌'}")
    print(f"Migrations: {'✅' if migrations_ok else '❌'}")
    print(f"API Endpoint: {'✅' if api_ok else '❌'}")
    
    if not all([models_ok, serializers_ok, migrations_ok, api_ok]):
        print("\n🔧 Attempting to fix issues...")
        if fix_issues():
            print("✅ Issues fixed - restart your backend server")
        else:
            print("❌ Could not fix all issues automatically")
    else:
        print("\n✅ All tests passed - the issue may be in the frontend or network")
    
    print("\n=== Next Steps ===")
    print("1. Restart your Django backend server")
    print("2. Check browser console for frontend errors")
    print("3. Verify API endpoint is accessible at http://localhost:2025/api/sales/sales-orders/")
    print("4. Check if authentication is working properly")
