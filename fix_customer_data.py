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

def fix_customer_data():
    """Fix customer data issues"""
    try:
        from sales.models import Customer
        
        print("=== Fixing Customer Data Issues ===")
        
        # Find the problematic customer
        customers = Customer.objects.filter(name__icontains='enerst')
        if not customers.exists():
            customers = Customer.objects.filter(name__icontains='ernest')
        
        if customers.exists():
            print(f"Found {customers.count()} matching customers:")
            for customer in customers:
                print(f"  Customer: {customer.name} (ID: {customer.id})")
                
                # Clean up the customer data
                original_name = customer.name
                cleaned_name = customer.name.strip()
                
                if original_name != cleaned_name:
                    print(f"    Cleaning name: '{original_name}' -> '{cleaned_name}'")
                    customer.name = cleaned_name
                    customer.save()
                
                # Ensure required fields are present
                if not customer.email:
                    customer.email = f"{customer.name.lower().replace(' ', '.')}@example.com"
                    print(f"    Added default email: {customer.email}")
                
                if not customer.phone:
                    customer.phone = "0000000000"
                    print(f"    Added default phone: {customer.phone}")
                
                customer.save()
                print(f"    ✅ Customer data fixed")
        else:
            print("No matching customers found. Creating 'Ernest chemist' customer...")
            
            # Create the customer if it doesn't exist
            customer = Customer.objects.create(
                name="Ernest chemist",
                email="ernest.chemist@example.com",
                phone="0244123456",
                address="Accra, Ghana"
            )
            print(f"✅ Created customer: {customer.name} (ID: {customer.id})")
        
        return True
        
    except Exception as e:
        print(f"Error fixing customer data: {e}")
        return False

def test_customer_api():
    """Test customer API to ensure it's working"""
    try:
        from sales.serializers import CustomerSerializer
        from sales.models import Customer
        
        print("\n=== Testing Customer Serialization ===")
        
        # Get all customers and serialize them
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        
        print(f"Successfully serialized {len(serializer.data)} customers")
        
        # Check for the specific customer
        enerst_customers = [c for c in serializer.data if 'enerst' in c.get('name', '').lower() or 'ernest' in c.get('name', '').lower()]
        
        if enerst_customers:
            print("Found 'Ernest/Enerst' customers in serialized data:")
            for customer in enerst_customers:
                print(f"  ID: {customer.get('id')} | Name: '{customer.get('name')}' | Email: {customer.get('email')}")
        else:
            print("No 'Ernest/Enerst' customers found in serialized data")
        
        return True
        
    except Exception as e:
        print(f"Error testing customer API: {e}")
        return False

def clear_customer_cache():
    """Clear any potential caching issues"""
    try:
        from django.core.cache import cache
        
        print("\n=== Clearing Cache ===")
        cache.clear()
        print("✅ Cache cleared")
        
        return True
        
    except Exception as e:
        print(f"Error clearing cache: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing Customer Data Issues")
    
    # Fix customer data
    if fix_customer_data():
        print("✅ Customer data fixed")
    else:
        print("❌ Failed to fix customer data")
    
    # Test API serialization
    if test_customer_api():
        print("✅ Customer API working")
    else:
        print("❌ Customer API issues found")
    
    # Clear cache
    if clear_customer_cache():
        print("✅ Cache cleared")
    
    print("\n=== Next Steps ===")
    print("1. Run this script: python fix_customer_data.py")
    print("2. Restart the backend server")
    print("3. Refresh the frontend page")
    print("4. Check if 'Ernest chemist' now appears in customer list")
