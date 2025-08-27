#!/usr/bin/env python3
import os
import sys
import django
from decimal import Decimal
from datetime import date

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sales.models import SalesOrder, Payment
from users.models import User

def create_test_payment():
    """Create a test payment requiring approval to test Finance module integration"""
    print("🚨 Creating Test Payment for Finance Module")
    
    try:
        # Get the latest sales order
        latest_order = SalesOrder.objects.order_by('-id').first()
        if not latest_order:
            print("❌ No sales orders found. Create a sales order first.")
            return
            
        print(f"✅ Using sales order: {latest_order.order_number}")
        
        # Get user for created_by
        user = User.objects.first()
        if not user:
            print("❌ No users found")
            return
            
        # Create a test payment requiring approval
        payment = Payment.objects.create(
            sales_order=latest_order,
            amount=Decimal('20.00'),  # Partial payment
            payment_method='cheque',
            payment_date=date.today(),
            reference='CHQ-001-TEST',
            status='pending',  # Requires approval
            notes='Test cheque payment for Finance module integration',
            created_by=user
        )
        
        print(f"✅ Created test payment: {payment.payment_number}")
        print(f"   Amount: ${payment.amount}")
        print(f"   Method: {payment.payment_method}")
        print(f"   Status: {payment.status}")
        print(f"   Sales Order: {payment.sales_order.order_number}")
        
        # Update sales order payment status
        latest_order.payment_status = 'partial'
        latest_order.save()
        
        print(f"✅ Updated sales order payment status to: {latest_order.payment_status}")
        
        # Create another credit sales order for aging analysis
        from sales.models import Customer
        customer = Customer.objects.first()
        if customer:
            from datetime import datetime, timedelta
            
            credit_order = SalesOrder.objects.create(
                customer=customer,
                sales_agent=user,
                payment_method='credit',
                payment_terms=30,
                subtotal=Decimal('150.00'),
                total=Decimal('150.00'),
                payment_status='pending',
                status='confirmed',
                due_date=date.today() - timedelta(days=45),  # Overdue
                notes='Test credit order for aging analysis'
            )
            
            print(f"✅ Created overdue credit order: {credit_order.order_number}")
            print(f"   Due date: {credit_order.due_date} (45 days overdue)")
            print(f"   Amount: ${credit_order.total}")
        
        print("\n🎯 Finance module should now show:")
        print("   - Pending Payments: 1 payment requiring approval")
        print("   - Customer Balance: Real customer balances")
        print("   - Receivables: Aging analysis with overdue amounts")
        
    except Exception as e:
        print(f"❌ Error creating test payment: {e}")

if __name__ == "__main__":
    create_test_payment()
