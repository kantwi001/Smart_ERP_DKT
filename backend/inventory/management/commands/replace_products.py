from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Product, Category, ProductPrice
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Clear all products and add new product list'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing products',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL existing products. Run with --confirm to proceed.'
                )
            )
            return

        # New product list from user
        new_products = [
            "Fiesta Classic Lydia",
            "Safeload",
            "Medabone",
            "Depo Provera",
            "Implanon NXT",
            "Classic Lubricant",
            "Kiss strawberry...",
            "Fiesta Dumsor",
            "Fiesta Party Pack",
            "Levoplant",
            "Lydia sleek iud",
            "Kiss Classic",
            "HIV ST",
            "Female Condom",
            "Mygesty",
            "Fiesta Strawberry",
            "Fiesta Vibe",
            "Lydia OCP"
        ]

        with transaction.atomic():
            # Clear all existing products and related data
            self.stdout.write('Clearing existing products...')
            ProductPrice.objects.all().delete()
            Product.objects.all().delete()
            
            # Create or get categories for the new products
            contraceptive_category, _ = Category.objects.get_or_create(
                name='Contraceptives & Family Planning',
                defaults={'description': 'Family planning and contraceptive products'}
            )
            
            medical_category, _ = Category.objects.get_or_create(
                name='Medical Supplies',
                defaults={'description': 'Medical and healthcare supplies'}
            )
            
            testing_category, _ = Category.objects.get_or_create(
                name='Testing Kits',
                defaults={'description': 'Medical testing and diagnostic kits'}
            )

            # Add new products
            self.stdout.write('Adding new products...')
            
            for i, product_name in enumerate(new_products, 1):
                # Determine category based on product name
                if any(keyword in product_name.lower() for keyword in ['fiesta', 'kiss', 'classic lubricant', 'female condom']):
                    category = contraceptive_category
                elif 'hiv st' in product_name.lower():
                    category = testing_category
                else:
                    category = medical_category
                
                # Generate SKU
                sku = f"PRD-{i:03d}"
                
                # Create product
                product = Product.objects.create(
                    name=product_name,
                    category=category,
                    sku=sku,
                    quantity=random.randint(50, 500),  # Random stock quantity
                    description=f"High-quality {product_name.lower()} for healthcare needs"
                )
                
                # Add pricing in Ghana Cedis
                ProductPrice.objects.create(
                    product=product,
                    currency='GHS',
                    price=Decimal(str(random.uniform(5.0, 150.0)))  # Random price between 5-150 GHS
                )
                
                # Add USD pricing for some products
                if random.choice([True, False]):
                    ProductPrice.objects.create(
                        product=product,
                        currency='USD',
                        price=Decimal(str(random.uniform(1.0, 25.0)))  # Random USD price
                    )
                
                self.stdout.write(f'Created: {product_name} (SKU: {sku})')

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully replaced all products with {len(new_products)} new items!'
                )
            )
            
            # Print summary
            self.stdout.write('\n=== SUMMARY ===')
            self.stdout.write(f'Total products: {Product.objects.count()}')
            self.stdout.write(f'Categories: {Category.objects.count()}')
            self.stdout.write(f'Price entries: {ProductPrice.objects.count()}')
            
            # Show products by category
            for category in Category.objects.all():
                count = Product.objects.filter(category=category).count()
                self.stdout.write(f'{category.name}: {count} products')
