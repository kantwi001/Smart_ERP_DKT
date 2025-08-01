from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from inventory.models import Product, Category, ProductPrice, InventoryTransfer
from sales.models import Sale, Customer
from datetime import datetime, timedelta
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete all sample data and regenerate based on healthcare products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing sample data',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL existing sample data. Run with --confirm to proceed.'
                )
            )
            return

        with transaction.atomic():
            self.stdout.write('Clearing existing sample data...')
            
            # Clear sample data safely
            try:
                Sale.objects.all().delete()
                self.stdout.write('Cleared sales')
            except Exception as e:
                self.stdout.write(f'Could not clear sales: {e}')
            
            try:
                InventoryTransfer.objects.all().delete()
                self.stdout.write('Cleared inventory transfers')
            except Exception as e:
                self.stdout.write(f'Could not clear inventory transfers: {e}')
            
            try:
                Customer.objects.all().delete()
                self.stdout.write('Cleared customers')
            except Exception as e:
                self.stdout.write(f'Could not clear customers: {e}')

            self.stdout.write('Generating new healthcare-focused sample data...')
            
            # Get all products
            products = list(Product.objects.all())
            if not products:
                self.stdout.write(self.style.ERROR('No products found! Please run replace_products first.'))
                return

            # Create healthcare customers
            healthcare_customers = [
                'Korle-Bu Teaching Hospital',
                'Ridge Hospital', 
                'Tema General Hospital',
                'Kumasi South Hospital',
                'Cape Coast Teaching Hospital',
                'Tamale Teaching Hospital',
                'Ho Municipal Hospital',
                'Planned Parenthood Ghana',
                'Marie Stopes Ghana',
                'Ghana Health Service',
                'USAID Ghana Health',
                'UNFPA Ghana Office'
            ]
            
            customers = []
            for i, name in enumerate(healthcare_customers, 1):
                try:
                    customer = Customer.objects.create(
                        name=name,
                        email=f'procurement{i}@healthcare{i}.org'
                    )
                    customers.append(customer)
                    self.stdout.write(f'Created customer: {name}')
                except Exception as e:
                    self.stdout.write(f'Error creating customer {name}: {e}')

            # Create staff users for sales
            staff_users = []
            try:
                staff1, created = User.objects.get_or_create(
                    username='sales_rep1',
                    defaults={
                        'email': 'sales1@company.com',
                        'first_name': 'Kwame',
                        'last_name': 'Asante'
                    }
                )
                staff_users.append(staff1)
                
                staff2, created = User.objects.get_or_create(
                    username='sales_rep2', 
                    defaults={
                        'email': 'sales2@company.com',
                        'first_name': 'Ama',
                        'last_name': 'Osei'
                    }
                )
                staff_users.append(staff2)
                
                self.stdout.write('Created staff users')
            except Exception as e:
                self.stdout.write(f'Error creating staff: {e}')

            # Generate realistic sales data
            self.stdout.write('Generating sales transactions...')
            sales_count = 0
            for i in range(40):
                try:
                    if customers and staff_users:
                        customer = random.choice(customers)
                        staff = random.choice(staff_users)
                        
                        # Select 1-4 products for this sale
                        selected_products = random.sample(products, random.randint(1, min(4, len(products))))
                        
                        total_amount = 0
                        for product in selected_products:
                            # Get price for this product
                            price_obj = product.prices.filter(currency='GHS').first()
                            if price_obj:
                                quantity = random.randint(5, 50)  # Healthcare bulk orders
                                total_amount += float(price_obj.price) * quantity
                        
                        if total_amount > 0:
                            sale = Sale.objects.create(
                                customer=customer,
                                staff=staff,
                                total=Decimal(str(total_amount)),
                                status=random.choice(['completed', 'pending']),
                                date=datetime.now() - timedelta(days=random.randint(0, 90))
                            )
                            sales_count += 1
                            
                            if sales_count % 10 == 0:
                                self.stdout.write(f'Created {sales_count} sales...')
                                
                except Exception as e:
                    self.stdout.write(f'Error creating sale {i}: {e}')

            # Generate inventory transfers
            self.stdout.write('Generating inventory transfers...')
            locations = ['Main Warehouse', 'Accra Branch', 'Kumasi Branch', 'Tamale Branch']
            transfer_count = 0
            
            for i in range(25):
                try:
                    if staff_users:
                        product = random.choice(products)
                        from_location = random.choice(locations)
                        to_location = random.choice([loc for loc in locations if loc != from_location])
                        
                        transfer = InventoryTransfer.objects.create(
                            product=product,
                            quantity=random.randint(10, 100),
                            from_location=from_location,
                            to_location=to_location,
                            requested_by=random.choice(staff_users),
                            status=random.choice(['pending', 'approved', 'completed']),
                            created_at=datetime.now() - timedelta(days=random.randint(0, 45))
                        )
                        transfer_count += 1
                        
                except Exception as e:
                    self.stdout.write(f'Error creating transfer {i}: {e}')

            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully regenerated healthcare-focused sample data!'
                )
            )
            
            # Print summary
            self.stdout.write('\n=== SUMMARY ===')
            self.stdout.write(f'Products: {Product.objects.count()}')
            self.stdout.write(f'Customers: {Customer.objects.count()}')
            self.stdout.write(f'Sales: {Sale.objects.count()}')
            self.stdout.write(f'Inventory Transfers: {InventoryTransfer.objects.count()}')
            self.stdout.write(f'Staff Users: {len(staff_users)}')
            
            # Show product categories
            for category in Category.objects.all():
                count = Product.objects.filter(category=category).count()
                if count > 0:
                    self.stdout.write(f'{category.name}: {count} products')
