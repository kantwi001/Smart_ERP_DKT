#!/usr/bin/env python3
import os
import sys

# Change to backend directory and add to path
backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from inventory.models import Category, Product, ProductPrice

def create_sample_products():
    """Create sample products for POS testing"""
    
    # Create categories
    electronics, _ = Category.objects.get_or_create(
        name="Electronics",
        defaults={"description": "Electronic devices and accessories"}
    )
    
    food, _ = Category.objects.get_or_create(
        name="Food & Beverages",
        defaults={"description": "Food items and drinks"}
    )
    
    clothing, _ = Category.objects.get_or_create(
        name="Clothing",
        defaults={"description": "Apparel and accessories"}
    )
    
    # Create sample products
    products_data = [
        {
            "name": "Smartphone",
            "category": electronics,
            "sku": "PHONE-001",
            "quantity": 25,
            "description": "Latest model smartphone with advanced features",
            "prices": [
                {"currency": "SLL", "price": 2500000},
                {"currency": "USD", "price": 299},
                {"currency": "GHS", "price": 1800},
                {"currency": "LRD", "price": 45000}
            ]
        },
        {
            "name": "Laptop Computer",
            "category": electronics,
            "sku": "LAPTOP-001",
            "quantity": 15,
            "description": "High-performance laptop for business and gaming",
            "prices": [
                {"currency": "SLL", "price": 8500000},
                {"currency": "USD", "price": 999},
                {"currency": "GHS", "price": 6200},
                {"currency": "LRD", "price": 155000}
            ]
        },
        {
            "name": "Coffee Beans",
            "category": food,
            "sku": "COFFEE-001",
            "quantity": 100,
            "description": "Premium arabica coffee beans",
            "prices": [
                {"currency": "SLL", "price": 125000},
                {"currency": "USD", "price": 15},
                {"currency": "GHS", "price": 90},
                {"currency": "LRD", "price": 2300}
            ]
        },
        {
            "name": "T-Shirt",
            "category": clothing,
            "sku": "TSHIRT-001",
            "quantity": 50,
            "description": "Cotton t-shirt available in multiple colors",
            "prices": [
                {"currency": "SLL", "price": 85000},
                {"currency": "USD", "price": 10},
                {"currency": "GHS", "price": 60},
                {"currency": "LRD", "price": 1500}
            ]
        },
        {
            "name": "Wireless Headphones",
            "category": electronics,
            "sku": "HEADPHONE-001",
            "quantity": 30,
            "description": "Bluetooth wireless headphones with noise cancellation",
            "prices": [
                {"currency": "SLL", "price": 750000},
                {"currency": "USD", "price": 89},
                {"currency": "GHS", "price": 550},
                {"currency": "LRD", "price": 13500}
            ]
        }
    ]
    
    created_count = 0
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            sku=product_data["sku"],
            defaults={
                "name": product_data["name"],
                "category": product_data["category"],
                "quantity": product_data["quantity"],
                "description": product_data["description"]
            }
        )
        
        if created:
            created_count += 1
            print(f"Created product: {product.name} (SKU: {product.sku})")
            
            # Create prices for each currency
            for price_data in product_data["prices"]:
                ProductPrice.objects.get_or_create(
                    product=product,
                    currency=price_data["currency"],
                    defaults={"price": price_data["price"]}
                )
        else:
            print(f"Product already exists: {product.name} (SKU: {product.sku})")
    
    print(f"\nSample data creation complete!")
    print(f"Created {created_count} new products")
    print(f"Total products in database: {Product.objects.count()}")

if __name__ == "__main__":
    create_sample_products()
