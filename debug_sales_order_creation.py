#!/usr/bin/env python3
import os
import sys
import django
from pathlib import Path
import traceback

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def test_sales_order_creation():
    """Test sales order creation to identify the exact error"""
    try:
        django.setup()
        
        from sales.models import Customer, SalesOrder, SalesOrderItem
        from sales.serializers import SalesOrderSerializer
        from inventory.models import Product
        from users.models import User
        
        print("🔍 Testing Sales Order Creation...")
        
        # Check if we have required data
        customers = Customer.objects.all()
        products = Product.objects.all()
        users = User.objects.all()
        
        print(f"Available customers: {customers.count()}")
        print(f"Available products: {products.count()}")
        print(f"Available users: {users.count()}")
        
        if not customers.exists():
            print("❌ No customers found - creating test customer")
            customer = Customer.objects.create(
                name="Test Customer",
                email="test@example.com",
                phone="1234567890",
                customer_type="retailer"
            )
        else:
            customer = customers.first()
            print(f"✅ Using customer: {customer.name}")
        
        if not products.exists():
            print("❌ No products found - this might be the issue")
            return False
        else:
            product = products.first()
            print(f"✅ Using product: {product.name} (ID: {product.id})")
        
        if not users.exists():
            print("❌ No users found - this might be the issue")
            return False
        else:
            user = users.first()
            print(f"✅ Using user: {user.username} (ID: {user.id})")
        
        # Test data similar to frontend payload with multiple products
        test_data = {
            'customer': customer.id,
            'sales_agent': user.id,
            'payment_method': 'cash',
            'payment_terms': 0,  # 0 days for immediate payment
            'subtotal': 40.00,
            'total': 40.00,
            'items': [
                {
                    'product': 2,  # Using product ID 2 like frontend
                    'quantity': 1,
                    'unit_price': 15.00
                },
                {
                    'product': 3,  # Using product ID 3 like frontend
                    'quantity': 1,
                    'unit_price': 25.00
                }
            ]
        }
        
        print(f"Test payload: {test_data}")
        
        # Create mock request context
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        mock_request = MockRequest(user)
        
        # Test serializer
        serializer = SalesOrderSerializer(data=test_data, context={'request': mock_request})
        
        if not serializer.is_valid():
            print(f"❌ Serializer validation failed: {serializer.errors}")
            return False
        
        print("✅ Serializer validation passed")
        
        # Try to create the sales order
        sales_order = serializer.save()
        print(f"✅ Sales order created successfully: {sales_order.order_number}")
        
        # Check items were created
        items = sales_order.items.all()
        print(f"✅ Order items created: {items.count()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during sales order creation: {e}")
        traceback.print_exc()
        return False

def check_model_fields():
    """Check if all required model fields are properly defined"""
    try:
        django.setup()
        
        from sales.models import SalesOrder, SalesOrderItem
        
        print("\n🔍 Checking SalesOrder model fields...")
        
        # Get all fields
        fields = SalesOrder._meta.get_fields()
        required_fields = ['customer', 'sales_agent', 'subtotal', 'total', 'payment_method']
        
        for field_name in required_fields:
            field = next((f for f in fields if f.name == field_name), None)
            if field:
                print(f"✅ {field_name}: {field}")
            else:
                print(f"❌ Missing field: {field_name}")
        
        print("\n🔍 Checking SalesOrderItem model fields...")
        item_fields = SalesOrderItem._meta.get_fields()
        required_item_fields = ['sales_order', 'product', 'quantity', 'unit_price']
        
        for field_name in required_item_fields:
            field = next((f for f in item_fields if f.name == field_name), None)
            if field:
                print(f"✅ {field_name}: {field}")
            else:
                print(f"❌ Missing field: {field_name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error checking model fields: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚨 Sales Order Creation Diagnostic")
    
    # Step 1: Check model fields
    if check_model_fields():
        print("Step 1: ✅ Model fields check passed")
    else:
        print("Step 1: ❌ Model fields check failed")
    
    # Step 2: Test creation
    if test_sales_order_creation():
        print("Step 2: ✅ Sales order creation test passed")
        print("\n✅ Sales order creation should work in API")
    else:
        print("Step 2: ❌ Sales order creation test failed")
        print("\n❌ Sales order creation has issues - check errors above")
