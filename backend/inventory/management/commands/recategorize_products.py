from django.core.management.base import BaseCommand
from django.db import transaction
from inventory.models import Product, Category

class Command(BaseCommand):
    help = 'Add new product categories and recategorize products accordingly'

    def handle(self, *args, **options):
        # New categories to create
        new_categories = [
            'Female Condom',
            'HIVST', 
            'Lubes',
            'Injectable',
            'OCP Lydia',
            'MVA KITS',
            'Medical Abortion',
            'IUD',
            'Implant Contraceps',
            'Emergency Contraceptives',
            'Condoms'  # Keep existing condoms category
        ]

        # Product categorization mapping
        product_categorization = {
            # Female Condom category
            'Female Condom': 'Female Condom',
            
            # HIVST category
            'HIV ST': 'HIVST',
            
            # Lubes category
            'Classic Lubricant': 'Lubes',
            
            # Injectable category
            'Depo Provera': 'Injectable',
            'Safeload': 'Injectable',
            
            # OCP Lydia category
            'Lydia OCP': 'OCP Lydia',
            
            # IUD category
            'Lydia sleek iud': 'IUD',
            
            # Implant Contraceps category
            'Implanon NXT': 'Implant Contraceps',
            'Levoplant': 'Implant Contraceps',
            
            # Emergency Contraceptives category
            'Mygesty': 'Emergency Contraceptives',
            
            # Condoms category (male condoms)
            'Fiesta Classic Lydia': 'Condoms',
            'Kiss strawberry...': 'Condoms',
            'Fiesta Dumsor': 'Condoms',
            'Fiesta Party Pack': 'Condoms',
            'Kiss Classic': 'Condoms',
            'Fiesta Strawberry': 'Condoms',
            'Fiesta Vibe': 'Condoms',
            
            # Medical Supplies (keeping existing for Medabone)
            'Medabone': 'Medical Supplies',
        }

        with transaction.atomic():
            self.stdout.write('Starting product recategorization...')
            
            # Step 1: Create new categories
            self.stdout.write('Creating new product categories...')
            categories = {}
            
            for cat_name in new_categories:
                category, created = Category.objects.get_or_create(
                    name=cat_name,
                    defaults={
                        'description': f'{cat_name} - Reproductive health and family planning products'
                    }
                )
                categories[cat_name] = category
                if created:
                    self.stdout.write(f'Created category: {cat_name}')
                else:
                    self.stdout.write(f'Using existing category: {cat_name}')
            
            # Keep existing Medical Supplies category for Medabone
            medical_supplies, _ = Category.objects.get_or_create(
                name='Medical Supplies',
                defaults={'description': 'Medical supplies and equipment'}
            )
            categories['Medical Supplies'] = medical_supplies
            
            # Step 2: Recategorize products
            self.stdout.write('Recategorizing products...')
            recategorized_count = 0
            
            for product_name, category_name in product_categorization.items():
                try:
                    product = Product.objects.get(name=product_name)
                    new_category = categories[category_name]
                    
                    if product.category != new_category:
                        old_category = product.category.name
                        product.category = new_category
                        product.save()
                        
                        self.stdout.write(
                            f'Recategorized "{product_name}" from "{old_category}" to "{category_name}"'
                        )
                        recategorized_count += 1
                    else:
                        self.stdout.write(f'"{product_name}" already in "{category_name}" category')
                        
                except Product.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Product "{product_name}" not found - skipping')
                    )
            
            # Step 3: Clean up old unused categories (optional)
            self.stdout.write('Checking for unused categories...')
            old_categories = ['Contraceptives', 'Personal Care']
            
            for old_cat_name in old_categories:
                try:
                    old_category = Category.objects.get(name=old_cat_name)
                    if old_category.product_set.count() == 0:
                        old_category.delete()
                        self.stdout.write(f'Deleted unused category: {old_cat_name}')
                    else:
                        self.stdout.write(f'Category "{old_cat_name}" still has products - keeping')
                except Category.DoesNotExist:
                    pass
            
            # Step 4: Display final categorization summary
            self.stdout.write('\n=== FINAL PRODUCT CATEGORIZATION ===')
            for category in Category.objects.all().order_by('name'):
                products = category.product_set.all()
                self.stdout.write(f'\n{category.name} ({products.count()} products):')
                for product in products:
                    self.stdout.write(f'  - {product.name} (SKU: {product.sku})')
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'\nSuccessfully recategorized products!\n'
                    f'- Created/updated {len(new_categories)} categories\n'
                    f'- Recategorized {recategorized_count} products\n'
                    f'- All products now properly categorized'
                )
            )
