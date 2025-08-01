from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from sales.models import Sale, Customer
from accounting.models import Transaction
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed sample data for dashboard (sales, customers, transactions, users)'

    def handle(self, *args, **kwargs):
        # Create staff users
        staff, _ = User.objects.get_or_create(username='staff1', defaults={
            'email': 'staff1@example.com', 'is_staff': True, 'is_superuser': False
        })
        staff2, _ = User.objects.get_or_create(username='staff2', defaults={
            'email': 'staff2@example.com', 'is_staff': True, 'is_superuser': False
        })

        # Create customers
        customers = []
        for i in range(1, 6):
            cust, _ = Customer.objects.get_or_create(
                name=f'Customer {i}',
                defaults={'email': f'customer{i}@example.com'}
            )
            customers.append(cust)

        # Create sales
        for i in range(10):
            Sale.objects.create(
                customer=random.choice(customers),
                staff=random.choice([staff, staff2]),
                total=random.randint(100, 2000),
                status='completed',
                date=datetime.now() - timedelta(days=random.randint(0, 30))
            )

        # Create sample accounts
        from accounting.models import Account
        cash, _ = Account.objects.get_or_create(name='Cash', defaults={'type': 'Asset', 'balance': 10000})
        bank, _ = Account.objects.get_or_create(name='Bank', defaults={'type': 'Asset', 'balance': 5000})
        accounts = [cash, bank]
        # Create transactions
        for i in range(10):
            Transaction.objects.create(
                account=random.choice(accounts),
                amount=random.randint(50, 500),
                transaction_type=random.choice(['credit', 'debit']),
                description=f'Sample transaction {i+1}',
                date=datetime.now() - timedelta(days=random.randint(0, 30))
            )

        # --- Inventory Demo Data ---
        from inventory.models import Category, Product, ProductPrice, InventoryTransfer
        
        # Create categories
        categories = []
        for cname in ['Electronics', 'Office Supplies', 'Raw Materials']:
            cat, _ = Category.objects.get_or_create(name=cname, defaults={'description': f'{cname} category'})
            categories.append(cat)

        # Create products
        products = []
        for i in range(8):
            cat = random.choice(categories)
            sku = f'SKU{i+1:03}'
            prod, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name': f'{cat.name} Product {i+1}',
                    'category': cat,
                    'quantity': random.randint(5, 100),
                    'description': f'{cat.name} demo product {i+1}'
                }
            )
            if not created:
                # Update name, category, description, quantity if already exists
                prod.name = f'{cat.name} Product {i+1}'
                prod.category = cat
                prod.description = f'{cat.name} demo product {i+1}'
                prod.quantity = random.randint(5, 100)
                prod.save()
            products.append(prod)
            # Add prices in multiple currencies
            for code in ['SLL', 'USD', 'GHS']:
                ProductPrice.objects.get_or_create(product=prod, currency=code, defaults={'price': random.randint(10, 200)})

        # Create inventory transfers
        locations = ['Warehouse A', 'Warehouse B', 'Storefront']
        for i in range(5):
            InventoryTransfer.objects.create(
                product=random.choice(products),
                quantity=random.randint(1, 20),
                from_location=random.choice(locations),
                to_location=random.choice(locations),
                requested_by=random.choice([staff, staff2]),
                status=random.choice(['pending', 'completed', 'in transit']),
            )

        self.stdout.write(self.style.SUCCESS('Sample dashboard data seeded successfully.'))
