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

def fix_models_file():
    """Remove Payment model from models.py"""
    try:
        models_file = backend_dir / 'sales' / 'models.py'
        
        with open(models_file, 'r') as f:
            content = f.read()
        
        # Remove Payment model class completely
        lines = content.split('\n')
        new_lines = []
        in_payment_class = False
        indent_level = 0
        
        for line in lines:
            if line.strip().startswith('class Payment('):
                in_payment_class = True
                indent_level = len(line) - len(line.lstrip())
                continue
            
            if in_payment_class:
                current_indent = len(line) - len(line.lstrip())
                # If we hit a line with same or less indentation and it's not empty, we're done with the class
                if line.strip() and current_indent <= indent_level:
                    in_payment_class = False
                    new_lines.append(line)
                # Skip lines that are part of Payment class
                continue
            
            new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        with open(models_file, 'w') as f:
            f.write(content)
        
        print("✅ Payment model removed from models.py")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing models: {e}")
        return False

def create_migration_to_remove_payment():
    """Create migration to remove Payment table if it exists"""
    try:
        import subprocess
        
        os.chdir(backend_dir)
        
        # Create migration
        result = subprocess.run([
            sys.executable, 'manage.py', 'makemigrations', 'sales',
            '--name', 'remove_payment_model', '--empty'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Empty migration created")
            
            # Find the migration file
            migrations_dir = backend_dir / 'sales' / 'migrations'
            migration_files = list(migrations_dir.glob('*_remove_payment_model.py'))
            
            if migration_files:
                migration_file = migration_files[0]
                
                # Add SQL to drop Payment table if it exists
                migration_content = f'''# Generated migration to remove Payment model
from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('sales', '{migration_file.stem.split("_")[0]}_add_payment_model'),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS sales_payment CASCADE;",
            reverse_sql="-- No reverse operation"
        ),
    ]
'''
                
                with open(migration_file, 'w') as f:
                    f.write(migration_content)
                
                print("✅ Migration file updated to drop Payment table")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating migration: {e}")
        return False

def run_django_setup_and_migrate():
    """Setup Django and run migrations"""
    try:
        django.setup()
        
        import subprocess
        
        os.chdir(backend_dir)
        
        # Run migrations
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate', 'sales', '--fake-initial'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migrations completed")
            print(result.stdout)
        else:
            print(f"Migration output: {result.stderr}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error with Django setup: {e}")
        return False

def test_sales_orders_api():
    """Test if sales orders API works now"""
    try:
        django.setup()
        
        from sales.models import SalesOrder
        from sales.serializers import SalesOrderSerializer
        
        # Test queryset
        queryset = SalesOrder.objects.all()
        print(f"✅ SalesOrder queryset works: {queryset.count()} orders")
        
        # Test serializer
        if queryset.exists():
            order = queryset.first()
            serializer = SalesOrderSerializer(order)
            data = serializer.data
            print("✅ SalesOrderSerializer works")
            print(f"Order keys: {list(data.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ API test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚨 Emergency Fix for Sales Orders API")
    
    # Step 1: Fix models file
    if fix_models_file():
        print("Step 1: ✅ Models fixed")
    else:
        print("Step 1: ❌ Models fix failed")
    
    # Step 2: Setup Django and test
    if run_django_setup_and_migrate():
        print("Step 2: ✅ Django setup completed")
    else:
        print("Step 2: ❌ Django setup failed")
    
    # Step 3: Test API
    if test_sales_orders_api():
        print("Step 3: ✅ Sales Orders API working")
    else:
        print("Step 3: ❌ Sales Orders API still has issues")
    
    print("\n=== Final Steps ===")
    print("1. Restart your Django backend server")
    print("2. Test the sales orders in frontend")
    print("3. The Payment functionality is now completely removed")
    print("4. Sales orders should load without errors")
