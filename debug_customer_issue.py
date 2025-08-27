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

def debug_customer_issue():
    """Debug the missing customer issue"""
    try:
        from sales.models import Customer
        
        print("=== Customer Database Debug ===")
        
        # Search for "Enerst chemist" variations
        search_terms = ['Enerst chemist', 'Ernest chemist', 'enerst', 'ernest', 'chemist']
        
        print(f"Total customers in database: {Customer.objects.count()}")
        print("\n=== Searching for 'Enerst chemist' variations ===")
        
        found_customers = []
        
        for term in search_terms:
            customers = Customer.objects.filter(name__icontains=term)
            if customers.exists():
                print(f"\nFound customers matching '{term}':")
                for customer in customers:
                    print(f"  ID: {customer.id}")
                    print(f"  Name: '{customer.name}'")
                    print(f"  Email: {customer.email}")
                    print(f"  Phone: {customer.phone}")
                    print(f"  Created: {customer.created_at}")
                    print(f"  Active: {getattr(customer, 'is_active', 'N/A')}")
                    print("  ---")
                    found_customers.append(customer)
        
        if not found_customers:
            print("No customers found matching search terms.")
            
            # Show all customers for reference
            print("\n=== All customers in database ===")
            all_customers = Customer.objects.all().order_by('-id')[:10]
            for customer in all_customers:
                print(f"  ID: {customer.id} | Name: '{customer.name}' | Email: {customer.email}")
        
        # Check for duplicates
        print("\n=== Checking for duplicate names ===")
        from django.db.models import Count
        
        duplicates = Customer.objects.values('name').annotate(
            count=Count('name')
        ).filter(count__gt=1)
        
        if duplicates:
            print("Found duplicate customer names:")
            for dup in duplicates:
                print(f"  Name: '{dup['name']}' appears {dup['count']} times")
                customers_with_name = Customer.objects.filter(name=dup['name'])
                for customer in customers_with_name:
                    print(f"    ID: {customer.id} | Created: {customer.created_at}")
        else:
            print("No duplicate customer names found.")
            
        return found_customers
        
    except Exception as e:
        print(f"Error debugging customers: {e}")
        return []

def fix_customer_visibility():
    """Fix customer visibility issues"""
    try:
        from sales.models import Customer
        
        print("\n=== Fixing Customer Visibility ===")
        
        # Find customers that might have visibility issues
        problem_customers = Customer.objects.filter(
            name__icontains='enerst'
        ) | Customer.objects.filter(
            name__icontains='ernest'
        )
        
        if problem_customers.exists():
            print("Found potential problem customers:")
            for customer in problem_customers:
                print(f"  Checking customer: {customer.name} (ID: {customer.id})")
                
                # Check if customer has required fields
                issues = []
                if not customer.name.strip():
                    issues.append("Empty name")
                if not customer.email:
                    issues.append("Missing email")
                if not customer.phone:
                    issues.append("Missing phone")
                
                if issues:
                    print(f"    Issues found: {', '.join(issues)}")
                else:
                    print(f"    Customer appears valid")
                    
                # Ensure customer is active if field exists
                if hasattr(customer, 'is_active'):
                    if not customer.is_active:
                        print(f"    Customer is inactive - activating...")
                        customer.is_active = True
                        customer.save()
                        print(f"    ✅ Customer activated")
        else:
            print("No problem customers found.")
            
    except Exception as e:
        print(f"Error fixing customer visibility: {e}")

def create_test_api_call():
    """Test the customer API endpoint"""
    try:
        import requests
        
        print("\n=== Testing Customer API ===")
        
        # Test the API endpoint
        api_url = "http://localhost:2025/api/sales/customers/"
        
        try:
            response = requests.get(api_url)
            if response.status_code == 200:
                customers = response.json()
                print(f"API returned {len(customers)} customers")
                
                # Search for the problematic customer
                enerst_customers = [c for c in customers if 'enerst' in c.get('name', '').lower() or 'ernest' in c.get('name', '').lower()]
                
                if enerst_customers:
                    print("Found 'Enerst/Ernest' customers via API:")
                    for customer in enerst_customers:
                        print(f"  ID: {customer.get('id')} | Name: '{customer.get('name')}' | Email: {customer.get('email')}")
                else:
                    print("No 'Enerst/Ernest' customers found via API")
                    
            else:
                print(f"API request failed with status: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("Could not connect to API - backend may not be running")
            
    except ImportError:
        print("Requests library not available - skipping API test")
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    print("🔍 Debugging Customer Issue: 'Enerst chemist'")
    
    # Debug the database
    found_customers = debug_customer_issue()
    
    # Fix visibility issues
    fix_customer_visibility()
    
    # Test API
    create_test_api_call()
    
    print("\n=== Summary ===")
    if found_customers:
        print(f"✅ Found {len(found_customers)} matching customers in database")
        print("The issue may be with frontend data loading or API response")
    else:
        print("❌ No matching customers found in database")
        print("The customer may have been deleted or the name is different")
    
    print("\n💡 Recommendations:")
    print("1. Check if the customer name has typos or extra spaces")
    print("2. Refresh the frontend customer data")
    print("3. Check browser console for API errors")
    print("4. Verify backend server is running on localhost:2025")
