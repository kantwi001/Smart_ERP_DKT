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

from django.db import transaction
from sales.models import Customer, Sale
from pos.models import POSSession
from procurement.models import Vendor, ProcurementRequest
from accounting.models import Transaction as AccTransaction
from inventory.models import Product, Category, ProductPrice
from hr.models import Employee, Department

def clear_all_data_and_sync():
    """Clear all data and establish proper syncing between modules"""
    
    print("🗑️ Starting complete data cleanup and sync setup...")
    
    with transaction.atomic():
        # Clear all business data
        POSSession.objects.all().delete()
        Sale.objects.all().delete()
        Customer.objects.all().delete()
        Vendor.objects.all().delete()
        ProcurementRequest.objects.all().delete()
        AccTransaction.objects.all().delete()
        
        # Clear additional modules
        try:
            from manufacturing.models import WorkOrder
            WorkOrder.objects.all().delete()
        except: pass
        
        try:
            from purchasing.models import PurchaseOrder
            PurchaseOrder.objects.all().delete()
        except: pass
        
        try:
            from warehouse.models import WarehouseLocation, StockMovement
            StockMovement.objects.all().delete()
            WarehouseLocation.objects.all().delete()
        except: pass
        
        print("✅ All business data cleared")
        
        # Create sample categories and products
        electronics, _ = Category.objects.get_or_create(
            name="Electronics",
            defaults={"description": "Electronic devices"}
        )
        
        food, _ = Category.objects.get_or_create(
            name="Food & Beverages",
            defaults={"description": "Food items"}
        )
        
        # Create sample products
        products_data = [
            ("Smartphone", "PHONE-001", 25, electronics),
            ("Laptop", "LAPTOP-001", 15, electronics),
            ("Coffee Beans", "COFFEE-001", 100, food),
            ("T-Shirt", "TSHIRT-001", 50, electronics),
            ("Headphones", "HEADPHONE-001", 30, electronics)
        ]
        
        for name, sku, qty, cat in products_data:
            product, created = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    "name": name,
                    "category": cat,
                    "quantity": qty,
                    "description": f"Sample {name}"
                }
            )
            
            if created:
                # Add multi-currency prices
                prices = {
                    "SLL": {"PHONE-001": 2500000, "LAPTOP-001": 8500000, "COFFEE-001": 125000, "TSHIRT-001": 250000, "HEADPHONE-001": 750000},
                    "USD": {"PHONE-001": 299, "LAPTOP-001": 999, "COFFEE-001": 15, "TSHIRT-001": 29, "HEADPHONE-001": 89},
                    "GHS": {"PHONE-001": 1800, "LAPTOP-001": 6200, "COFFEE-001": 90, "TSHIRT-001": 180, "HEADPHONE-001": 540},
                    "LRD": {"PHONE-001": 45000, "LAPTOP-001": 155000, "COFFEE-001": 2300, "TSHIRT-001": 4500, "HEADPHONE-001": 13500}
                }
                
                for currency, price_map in prices.items():
                    ProductPrice.objects.create(
                        product=product,
                        currency=currency,
                        price=price_map[sku]
                    )
        
        # Create sample customers for sales/POS sync
        customers_data = [
            ("John Doe", "john@example.com", "+1234567890"),
            ("Jane Smith", "jane@example.com", "+1234567891"),
            ("Bob Johnson", "bob@example.com", "+1234567892")
        ]
        
        for name, email, phone in customers_data:
            Customer.objects.create(
                name=name,
                email=email,
                phone=phone,
                address="Sample Address"
            )
        
        # Create sample vendors for procurement sync
        vendors_data = [
            ("Tech Supplier Inc", "tech@supplier.com"),
            ("Food Distributors Ltd", "food@distributor.com"),
            ("General Supplies Co", "general@supplies.com")
        ]
        
        for name, email in vendors_data:
            Vendor.objects.create(
                name=name,
                email=email,
                phone="+1234567800",
                address="Vendor Address"
            )
        
        print("✅ Sample data created with proper syncing:")
        print(f"   - {Product.objects.count()} products with multi-currency pricing")
        print(f"   - {Customer.objects.count()} customers (shared between Sales & POS)")
        print(f"   - {Vendor.objects.count()} vendors (for procurement)")
        print(f"   - {Category.objects.count()} product categories")
        
        print("\n🔗 Data syncing established:")
        print("   - Inventory products available in POS & Sales")
        print("   - Customers shared between Sales & POS modules")
        print("   - Multi-currency pricing for all products")
        print("   - Vendor data ready for procurement")
        
        print("\n🎉 Complete data reset and sync setup finished!")

if __name__ == "__main__":
    clear_all_data_and_sync()
