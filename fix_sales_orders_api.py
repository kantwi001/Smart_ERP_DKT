#!/usr/bin/env python3
import os
import sys
from pathlib import Path

def fix_serializers():
    """Fix the serializers.py to remove Payment model dependencies temporarily"""
    try:
        backend_dir = Path(__file__).parent / 'backend'
        serializers_file = backend_dir / 'sales' / 'serializers.py'
        
        print("=== Fixing Sales Serializers ===")
        
        # Read current content
        with open(serializers_file, 'r') as f:
            content = f.read()
        
        # Remove Payment import from the import line
        content = content.replace(
            'from .models import Customer, Sale, CustomerApproval, Quote, Lead, Promotion, PromotionProduct, SalesOrder, SalesOrderItem, FinanceTransaction, Payment',
            'from .models import Customer, Sale, CustomerApproval, Quote, Lead, Promotion, PromotionProduct, SalesOrder, SalesOrderItem, FinanceTransaction'
        )
        
        # Remove PaymentSerializer class
        lines = content.split('\n')
        new_lines = []
        skip_payment_serializer = False
        indent_level = 0
        
        for line in lines:
            if line.strip().startswith('class PaymentSerializer'):
                skip_payment_serializer = True
                indent_level = len(line) - len(line.lstrip())
                continue
            
            if skip_payment_serializer:
                current_indent = len(line) - len(line.lstrip())
                # If we hit a line with same or less indentation and it's not empty, we're done with the class
                if line.strip() and current_indent <= indent_level:
                    skip_payment_serializer = False
                    new_lines.append(line)
                # Skip lines that are part of PaymentSerializer
                continue
            
            new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        # Remove payments field from SalesOrderSerializer
        content = content.replace('payments = PaymentSerializer(many=True, read_only=True)', '')
        content = content.replace('PaymentSerializer(data=payment_data, context={\'request\': request})', 'None')
        content = content.replace('PaymentSerializer(payment).data', '{}')
        
        # Write back
        with open(serializers_file, 'w') as f:
            f.write(content)
        
        print("✅ Serializers fixed")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing serializers: {e}")
        return False

def fix_views():
    """Fix the views.py to remove Payment model dependencies temporarily"""
    try:
        backend_dir = Path(__file__).parent / 'backend'
        views_file = backend_dir / 'sales' / 'views.py'
        
        print("=== Fixing Sales Views ===")
        
        # Read current content
        with open(views_file, 'r') as f:
            content = f.read()
        
        # Remove Payment import
        content = content.replace(
            'SalesOrder, SalesOrderItem, FinanceTransaction, Payment',
            'SalesOrder, SalesOrderItem, FinanceTransaction'
        )
        content = content.replace(
            'PaymentSerializer', 
            '# PaymentSerializer'
        )
        
        # Comment out PaymentViewSet class
        lines = content.split('\n')
        new_lines = []
        in_payment_viewset = False
        indent_level = 0
        
        for line in lines:
            if line.strip().startswith('class PaymentViewSet'):
                in_payment_viewset = True
                indent_level = len(line) - len(line.lstrip())
                new_lines.append(f"# {line}")
                continue
            
            if in_payment_viewset:
                current_indent = len(line) - len(line.lstrip())
                # If we hit a line with same or less indentation and it's not empty, we're done with the class
                if line.strip() and current_indent <= indent_level:
                    in_payment_viewset = False
                    new_lines.append(line)
                else:
                    # Comment out lines that are part of PaymentViewSet
                    new_lines.append(f"# {line}" if line.strip() else line)
                continue
            
            new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        # Write back
        with open(views_file, 'w') as f:
            f.write(content)
        
        print("✅ Views fixed")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing views: {e}")
        return False

def fix_urls():
    """Fix the urls.py to remove Payment router"""
    try:
        backend_dir = Path(__file__).parent / 'backend'
        urls_file = backend_dir / 'sales' / 'urls.py'
        
        print("=== Fixing Sales URLs ===")
        
        # Read current content
        with open(urls_file, 'r') as f:
            content = f.read()
        
        # Remove PaymentViewSet from imports
        content = content.replace(
            'FinanceTransactionViewSet, PaymentViewSet',
            'FinanceTransactionViewSet'
        )
        
        # Remove payment router registration
        content = content.replace(
            "router.register(r'payments', PaymentViewSet)",
            "# router.register(r'payments', PaymentViewSet)"
        )
        
        # Write back
        with open(urls_file, 'w') as f:
            f.write(content)
        
        print("✅ URLs fixed")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing URLs: {e}")
        return False

def create_simple_sales_order_serializer():
    """Create a simplified SalesOrderSerializer without Payment dependencies"""
    try:
        backend_dir = Path(__file__).parent / 'backend'
        serializers_file = backend_dir / 'sales' / 'serializers.py'
        
        print("=== Creating Simple SalesOrderSerializer ===")
        
        # Read current content
        with open(serializers_file, 'r') as f:
            content = f.read()
        
        # Replace SalesOrderSerializer with simplified version
        simple_serializer = '''class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, required=False)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    sales_agent_name = serializers.CharField(source='sales_agent.get_full_name', read_only=True)
    sales_agent_email = serializers.CharField(source='sales_agent.email', read_only=True)
    sales_agent = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ['order_number', 'created_at', 'updated_at', 'confirmed_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Set sales_agent to current user if not provided or null
        if 'sales_agent' not in validated_data or validated_data.get('sales_agent') is None:
            validated_data['sales_agent'] = self.context['request'].user
        
        sales_order = SalesOrder.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            SalesOrderItem.objects.create(sales_order=sales_order, **item_data)
        
        # Create finance transaction for receivables if credit sale
        if sales_order.payment_method == 'credit':
            FinanceTransaction.objects.create(
                sales_order=sales_order,
                customer=sales_order.customer,
                transaction_type='receivable',
                amount=sales_order.total,
                due_date=sales_order.due_date,
                created_by=self.context['request'].user,
                description=f"Accounts receivable for order {sales_order.order_number}"
            )
        
        return sales_order'''
        
        # Find and replace the SalesOrderSerializer class
        import re
        pattern = r'class SalesOrderSerializer\(serializers\.ModelViewSet\):.*?(?=class|\Z)'
        content = re.sub(pattern, simple_serializer, content, flags=re.DOTALL)
        
        # Write back
        with open(serializers_file, 'w') as f:
            f.write(content)
        
        print("✅ Simple SalesOrderSerializer created")
        return True
        
    except Exception as e:
        print(f"❌ Error creating simple serializer: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Quick Fix for Sales Orders API Error")
    
    # Apply fixes
    fixes_applied = []
    
    if fix_serializers():
        fixes_applied.append("Serializers")
    
    if fix_views():
        fixes_applied.append("Views")
    
    if fix_urls():
        fixes_applied.append("URLs")
    
    print(f"\n✅ Applied fixes to: {', '.join(fixes_applied)}")
    
    print("\n=== Next Steps ===")
    print("1. Restart your Django backend server")
    print("2. Test the sales orders loading in frontend")
    print("3. The Payment functionality will be temporarily disabled")
    print("4. Run the migration script later to properly add Payment model")
