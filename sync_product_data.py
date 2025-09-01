#!/usr/bin/env python
import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from inventory.models import Product, Category
from decimal import Decimal

def sync_product_data():
    """Sync product data to ensure consistency across all modules"""
    
    # Create categories first
    categories_data = [
        {'name': 'Smartphones', 'description': 'Mobile phones and smartphones'},
        {'name': 'Laptops', 'description': 'Laptop computers'},
        {'name': 'Tablets', 'description': 'Tablet devices'},
        {'name': 'Accessories', 'description': 'Phone and computer accessories'},
        {'name': 'Wearables', 'description': 'Smart watches and wearable devices'},
        {'name': 'Monitors', 'description': 'Computer monitors and displays'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"Created category: {category.name}")
        else:
            print(f"Category exists: {category.name}")
    
    # Product data with realistic inventory levels
    products_data = [
        {
            'name': 'Samsung Galaxy S23',
            'sku': 'SGS23-001',
            'description': 'Latest Samsung flagship smartphone with advanced camera',
            'category': 'Smartphones',
            'quantity': 25,
            'unit_price': Decimal('2500.00'),
            'cost_price': Decimal('2000.00'),
            'min_stock': 10,
            'max_stock': 100,
            'is_active': True
        },
        {
            'name': 'iPhone 15 Pro',
            'sku': 'IP15P-002',
            'description': 'Apple iPhone 15 Pro with titanium design',
            'category': 'Smartphones',
            'quantity': 18,
            'unit_price': Decimal('3200.00'),
            'cost_price': Decimal('2800.00'),
            'min_stock': 8,
            'max_stock': 80,
            'is_active': True
        },
        {
            'name': 'MacBook Air M2',
            'sku': 'MBA-M2-003',
            'description': 'Apple MacBook Air with M2 chip',
            'category': 'Laptops',
            'quantity': 12,
            'unit_price': Decimal('4500.00'),
            'cost_price': Decimal('3800.00'),
            'min_stock': 5,
            'max_stock': 50,
            'is_active': True
        },
        {
            'name': 'Dell XPS 13',
            'sku': 'DXP13-004',
            'description': 'Dell XPS 13 ultrabook with Intel processor',
            'category': 'Laptops',
            'quantity': 15,
            'unit_price': Decimal('3800.00'),
            'cost_price': Decimal('3200.00'),
            'min_stock': 6,
            'max_stock': 60,
            'is_active': True
        },
        {
            'name': 'HP Pavilion 15',
            'sku': 'HPP15-005',
            'description': 'HP Pavilion 15 laptop for business and personal use',
            'category': 'Laptops',
            'quantity': 22,
            'unit_price': Decimal('2200.00'),
            'cost_price': Decimal('1800.00'),
            'min_stock': 8,
            'max_stock': 80,
            'is_active': True
        },
        {
            'name': 'iPad Pro 12.9',
            'sku': 'IPP129-006',
            'description': 'Apple iPad Pro 12.9 inch with M2 chip',
            'category': 'Tablets',
            'quantity': 10,
            'unit_price': Decimal('3500.00'),
            'cost_price': Decimal('3000.00'),
            'min_stock': 5,
            'max_stock': 40,
            'is_active': True
        },
        {
            'name': 'Surface Laptop 5',
            'sku': 'SL5-007',
            'description': 'Microsoft Surface Laptop 5 with Windows 11',
            'category': 'Laptops',
            'quantity': 8,
            'unit_price': Decimal('4200.00'),
            'cost_price': Decimal('3600.00'),
            'min_stock': 4,
            'max_stock': 40,
            'is_active': True
        },
        {
            'name': 'AirPods Pro',
            'sku': 'APP-008',
            'description': 'Apple AirPods Pro with active noise cancellation',
            'category': 'Accessories',
            'quantity': 35,
            'unit_price': Decimal('850.00'),
            'cost_price': Decimal('650.00'),
            'min_stock': 15,
            'max_stock': 100,
            'is_active': True
        },
        {
            'name': 'Samsung Watch 6',
            'sku': 'SW6-009',
            'description': 'Samsung Galaxy Watch 6 smartwatch',
            'category': 'Wearables',
            'quantity': 20,
            'unit_price': Decimal('1200.00'),
            'cost_price': Decimal('950.00'),
            'min_stock': 8,
            'max_stock': 60,
            'is_active': True
        },
        {
            'name': 'Gaming Monitor 27"',
            'sku': 'GM27-010',
            'description': '27 inch gaming monitor with 144Hz refresh rate',
            'category': 'Monitors',
            'quantity': 6,
            'unit_price': Decimal('1800.00'),
            'cost_price': Decimal('1400.00'),
            'min_stock': 3,
            'max_stock': 30,
            'is_active': True
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for product_data in products_data:
        category = Category.objects.get(name=product_data['category'])
        
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults={
                'name': product_data['name'],
                'description': product_data['description'],
                'category': category,
                'quantity': product_data['quantity'],
                'unit_price': product_data['unit_price'],
                'cost_price': product_data['cost_price'],
                'min_stock': product_data['min_stock'],
                'max_stock': product_data['max_stock'],
                'is_active': product_data['is_active']
            }
        )
        
        if created:
            created_count += 1
            print(f"Created product: {product.name} (SKU: {product.sku}) - Qty: {product.quantity}")
        else:
            # Update existing product with new data
            product.name = product_data['name']
            product.description = product_data['description']
            product.category = category
            product.quantity = product_data['quantity']
            product.unit_price = product_data['unit_price']
            product.cost_price = product_data['cost_price']
            product.min_stock = product_data['min_stock']
            product.max_stock = product_data['max_stock']
            product.is_active = product_data['is_active']
            product.save()
            updated_count += 1
            print(f"Updated product: {product.name} (SKU: {product.sku}) - Qty: {product.quantity}")
    
    print(f"\nSync completed:")
    print(f"- Created {created_count} new products")
    print(f"- Updated {updated_count} existing products")
    print(f"- Total products in database: {Product.objects.count()}")
    
    # Display current inventory summary
    print(f"\nInventory Summary:")
    print(f"- Total inventory value: GHS {sum(p.quantity * p.unit_price for p in Product.objects.all()):,.2f}")
    print(f"- Total stock units: {sum(p.quantity for p in Product.objects.all())}")
    print(f"- Low stock items: {Product.objects.filter(quantity__lte=10).count()}")

if __name__ == '__main__':
    print("Starting product data synchronization...")
    sync_product_data()
    print("Product data synchronization completed!")
