#!/usr/bin/env python3
import os
import sys
import subprocess
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django
django.setup()

def run_migration():
    """Run Django migrations"""
    try:
        print("Running Django migrations...")
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate'
        ], cwd=backend_dir, capture_output=True, text=True)
        
        print("Migration output:")
        print(result.stdout)
        if result.stderr:
            print("Migration errors:")
            print(result.stderr)
            
        return result.returncode == 0
    except Exception as e:
        print(f"Error running migration: {e}")
        return False

def check_product_model():
    """Check if Product model has the new fields"""
    try:
        from inventory.models import Product
        
        # Check if we can create a product with new fields
        test_fields = ['cost', 'min_stock', 'max_stock', 'unit']
        model_fields = [field.name for field in Product._meta.fields]
        
        print("Product model fields:")
        for field in model_fields:
            print(f"  - {field}")
            
        missing_fields = [field for field in test_fields if field not in model_fields]
        if missing_fields:
            print(f"Missing fields: {missing_fields}")
            return False
        else:
            print("All required fields are present in Product model")
            return True
            
    except Exception as e:
        print(f"Error checking Product model: {e}")
        return False

def check_productprice_model():
    """Check ProductPrice model and API"""
    try:
        from inventory.models import ProductPrice
        
        print("ProductPrice model fields:")
        model_fields = [field.name for field in ProductPrice._meta.fields]
        for field in model_fields:
            print(f"  - {field}")
            
        # Try to query ProductPrice
        count = ProductPrice.objects.count()
        print(f"ProductPrice records in database: {count}")
        
        return True
    except Exception as e:
        print(f"Error checking ProductPrice model: {e}")
        return False

if __name__ == "__main__":
    print("=== Database Migration and Model Check ===")
    
    # Run migration
    migration_success = run_migration()
    
    if migration_success:
        print("\n=== Checking Product Model ===")
        product_ok = check_product_model()
        
        print("\n=== Checking ProductPrice Model ===")
        productprice_ok = check_productprice_model()
        
        if product_ok and productprice_ok:
            print("\n✅ All checks passed! Backend should be ready.")
        else:
            print("\n❌ Some checks failed. Review the output above.")
    else:
        print("\n❌ Migration failed. Check the errors above.")
