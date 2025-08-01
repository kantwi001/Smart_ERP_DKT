from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Product, Category, ProductPrice, InventoryTransfer
from sales.models import Sale
from accounting.models import Transaction as AccountingTransaction
from django.contrib.auth import get_user_model
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Clear all existing products and add new product list with proper categorization'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing products and related data',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This command will DELETE ALL existing products and related data.\n'
                    'Run with --confirm to proceed.'
                )
            )
            return

        # New product list provided by user
        new_products = [
            # Condoms category
            {'name': 'Fiesta Classic Lydia', 'category': 'Condoms', 'sku': 'FCS-LYD-001'},
            {'name': 'Kiss strawberry...', 'category': 'Condoms', 'sku': 'KIS-STR-002'},
            {'name': 'Fiesta Dumsor', 'category': 'Condoms', 'sku': 'FCS-DUM-003'},
            {'name': 'Fiesta Party Pack', 'category': 'Condoms', 'sku': 'FCS-PPK-004'},
            {'name': 'Kiss Classic', 'category': 'Condoms', 'sku': 'KIS-CLS-005'},
            {'name': 'Fiesta Strawberry', 'category': 'Condoms', 'sku': 'FCS-STR-006'},
            {'name': 'Fiesta Vibe', 'category': 'Condoms', 'sku': 'FCS-VIB-007'},
            
            # Contraceptives/Medical category
            {'name': 'Safeload', 'category': 'Contraceptives', 'sku': 'SFL-001'},
            {'name': 'Medabone', 'category': 'Medical Supplies', 'sku': 'MDB-001'},
            {'name': 'Depo Provera', 'category': 'Contraceptives', 'sku': 'DPO-001'},
            {'name': 'Implanon NXT', 'category': 'Contraceptives', 'sku': 'IMP-NXT-001'},
            {'name': 'Classic Lubricant', 'category': 'Personal Care', 'sku': 'CLB-001'},
            {'name': 'Levoplant', 'category': 'Contraceptives', 'sku': 'LVP-001'},
            {'name': 'Lydia sleek iud', 'category': 'Contraceptives', 'sku': 'LYD-IUD-001'},
            {'name': 'HIV ST', 'category': 'Medical Supplies', 'sku': 'HIV-ST-001'},
            {'name': 'Female Condom', 'category': 'Condoms', 'sku': 'FCM-001'},
            {'name': 'Mygesty', 'category': 'Contraceptives', 'sku': 'MYG-001'},
            {'name': 'Lydia OCP', 'category': 'Contraceptives', 'sku': 'LYD-OCP-001'},
        ]

        with transaction.atomic():
            self.stdout.write('Starting product refresh...')
            
            # Step 1: Delete all existing products and related data
            self.stdout.write('Deleting existing products and related data...')
            
            # Delete related data first (foreign key constraints)
            InventoryTransfer.objects.all().delete()
            ProductPrice.objects.all().delete()
            
            # Delete products
            deleted_products = Product.objects.count()
            Product.objects.all().delete()
            self.stdout.write(f'Deleted {deleted_products} existing products')
            
            # Step 2: Create/update categories
            self.stdout.write('Creating product categories...')
            categories = {}
            category_names = list(set([product['category'] for product in new_products]))
            
            for cat_name in category_names:
                category, created = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={
                        'description': f'{cat_name} products for reproductive health and family planning'
                    }
                )
                categories[cat_name] = category
                if created:
                    self.stdout.write(f'Created category: {cat_name}')
                else:
                    self.stdout.write(f'Using existing category: {cat_name}')
            
            # Step 3: Create new products
            self.stdout.write('Creating new products...')
            created_products = []
            
            for product_data in new_products:
                category = categories[product_data['category']]
                
                product = Product.objects.create(
                    name=product_data['name'],
                    sku=product_data['sku'],
                    category=category,
                    description=f"{product_data['name']} - {product_data['category']} product",
                    quantity=random.randint(50, 500),  # Random initial stock
                )
                created_products.append(product)
                
                # Create prices in multiple currencies
                currencies = ['GHS', 'USD', 'EUR']
                base_price = random.randint(5, 100)  # Random base price
                
                for currency in currencies:
                    if currency == 'GHS':
                        price = base_price
                    elif currency == 'USD':
                        price = round(base_price / 12, 2)  # Rough GHS to USD conversion
                    else:  # EUR
                        price = round(base_price / 13, 2)  # Rough GHS to EUR conversion
                    
                    ProductPrice.objects.create(
                        product=product,
                        currency=currency,
                        price=price
                    )
                
                self.stdout.write(f'Created product: {product.name} (SKU: {product.sku})')
            
            # Step 4: Create some sample inventory transfers for demo
            self.stdout.write('Creating sample inventory transfers...')
            
            # Get some users for transfers
            users = list(User.objects.filter(is_active=True)[:5])
            if not users:
                # Create a demo user if none exist
                demo_user = User.objects.create_user(
                    username='demo_user',
                    email='demo@example.com',
                    password='demo123'
                )
                users = [demo_user]
            
            locations = ['Main Warehouse', 'Regional Store', 'Distribution Center', 'Retail Outlet']
            
            for i in range(10):
                product = random.choice(created_products)
                from_loc = random.choice(locations)
                to_loc = random.choice([loc for loc in locations if loc != from_loc])
                
                InventoryTransfer.objects.create(
                    product=product,
                    quantity=random.randint(5, 50),
                    from_location=from_loc,
                    to_location=to_loc,
                    requested_by=random.choice(users),
                    status=random.choice(['pending', 'completed', 'in_transit'])
                )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully refreshed products!\n'
                    f'- Created {len(created_products)} new products\n'
                    f'- Created {len(categories)} categories\n'
                    f'- Added pricing in multiple currencies\n'
                    f'- Generated sample inventory transfers'
                )
            )
