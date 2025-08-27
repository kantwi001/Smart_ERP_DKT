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

def create_payment_migration():
    """Create and run migration for Payment model"""
    try:
        import subprocess
        
        print("=== Creating Payment Model Migration ===")
        
        # Change to backend directory
        os.chdir(backend_dir)
        
        # Create migration
        result = subprocess.run([
            sys.executable, 'manage.py', 'makemigrations', 'sales',
            '--name', 'add_payment_model'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration created successfully")
            print(result.stdout)
        else:
            print("❌ Error creating migration:")
            print(result.stderr)
            return False
        
        # Run migration
        result = subprocess.run([
            sys.executable, 'manage.py', 'migrate', 'sales'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Migration applied successfully")
            print(result.stdout)
        else:
            print("❌ Error applying migration:")
            print(result.stderr)
            return False
        
        return True
        
    except Exception as e:
        print(f"Error creating migration: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Creating Payment Model Migration")
    
    if create_payment_migration():
        print("✅ Payment model migration completed successfully")
    else:
        print("❌ Payment model migration failed")
    
    print("\n=== Next Steps ===")
    print("1. Restart your Django backend server")
    print("2. Test the payment functionality in the frontend")
    print("3. Verify finance approval workflow works correctly")
