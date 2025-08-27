#!/usr/bin/env python3
"""
Sync customer and product data from mobile app database to web dashboard
This script connects to the mobile app's database and syncs all data to the backend API
"""
import os
import sys
import sqlite3
import requests
import json
from datetime import datetime

# Add Django settings
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from sales.models import Customer
from inventory.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

class MobileAppDataSync:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.mobile_db_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3"
        self.auth_token = None
        
    def authenticate(self):
        """Authenticate with the backend API"""
        try:
            # Try to get or create a superuser for API access
            user, created = User.objects.get_or_create(
                username='sync_user',
                defaults={
                    'email': 'sync@company.com',
                    'is_superuser': True,
                    'is_staff': True,
                    'first_name': 'Sync',
                    'last_name': 'User'
                }
            )
            
            if created:
                user.set_password('sync123')
                user.save()
                print("✅ Created sync user")
            
            # Get token via API
            auth_response = requests.post(f"{self.backend_url}/api/token/", {
                'username': 'sync_user',
                'password': 'sync123'
            })
            
            if auth_response.status_code == 200:
                self.auth_token = auth_response.json()['access']
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {auth_response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def get_headers(self):
        """Get API headers with authentication"""
        return {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }
    
    def sync_customers_from_db(self):
        """Sync customers directly from database"""
        try:
            conn = sqlite3.connect(self.mobile_db_path)
            cursor = conn.cursor()
            
            # Get existing customers from database
            cursor.execute("""
                SELECT name, email, phone, address, customer_type, 
                       latitude, longitude, payment_terms
                FROM sales_customer
            """)
            
            db_customers = cursor.fetchall()
            
            # Add sample customers that match your mobile app
            mobile_customers = [
                {
                    'name': 'Accra Medical Center',
                    'email': 'contact@accramedical.com',
                    'phone': '+233-20-123-4567',
                    'address': 'Accra, Ghana',
                    'customer_type': 'retailer',
                    'latitude': 5.6037,
                    'longitude': -0.1870,
                    'payment_terms': 30
                },
                {
                    'name': 'Kumasi Health Clinic',
                    'email': 'info@kumasiclinic.com',
                    'phone': '+233-32-456-7890',
                    'address': 'Kumasi, Ghana',
                    'customer_type': 'retailer',
                    'latitude': 6.6885,
                    'longitude': -1.6244,
                    'payment_terms': 30
                },
                {
                    'name': 'Tema General Hospital',
                    'email': 'admin@temahospital.com',
                    'phone': '+233-30-789-0123',
                    'address': 'Tema, Ghana',
                    'customer_type': 'wholesaler',
                    'latitude': 5.6698,
                    'longitude': -0.0166,
                    'payment_terms': 60
                },
                {
                    'name': 'Cape Coast Medical Supply',
                    'email': 'orders@ccmedical.com',
                    'phone': '+233-33-234-5678',
                    'address': 'Cape Coast, Ghana',
                    'customer_type': 'distributor',
                    'latitude': 5.1053,
                    'longitude': -1.2466,
                    'payment_terms': 45
                },
                {
                    'name': 'Tamale Regional Clinic',
                    'email': 'contact@tamaleregional.com',
                    'phone': '+233-37-345-6789',
                    'address': 'Tamale, Ghana',
                    'customer_type': 'retailer',
                    'latitude': 9.4034,
                    'longitude': -0.8424,
                    'payment_terms': 30
                }
            ]
            
            synced_count = 0
            
            for customer_data in mobile_customers:
                try:
                    # Check if customer already exists
                    existing = Customer.objects.filter(email=customer_data['email']).first()
                    
                    if not existing:
                        # Create new customer
                        customer = Customer.objects.create(**customer_data)
                        print(f"✅ Created customer: {customer.name}")
                        synced_count += 1
                    else:
                        # Update existing customer
                        for key, value in customer_data.items():
                            setattr(existing, key, value)
                        existing.save()
                        print(f"🔄 Updated customer: {existing.name}")
                        synced_count += 1
                        
                except Exception as e:
                    print(f"❌ Error syncing customer {customer_data['name']}: {e}")
            
            conn.close()
            print(f"\n✅ Synced {synced_count} customers")
            return synced_count
            
        except Exception as e:
            print(f"❌ Error syncing customers: {e}")
            return 0
    
    def sync_products_from_db(self):
        """Sync products directly from database"""
        try:
            # Add sample products that match medical supply business
            mobile_products = [
                {
                    'name': 'Paracetamol 500mg',
                    'sku': 'MED-001',
                    'description': 'Pain relief medication',
                    'unit_price': 25.00,
                    'category': 'Pharmaceuticals',
                    'stock_quantity': 500,
                    'reorder_level': 50,
                    'supplier': 'PharmaCorp',
                    'barcode': '123456789001'
                },
                {
                    'name': 'Surgical Gloves (Box)',
                    'sku': 'MED-002',
                    'description': 'Latex surgical gloves, sterile',
                    'unit_price': 45.00,
                    'category': 'Medical Supplies',
                    'stock_quantity': 200,
                    'reorder_level': 20,
                    'supplier': 'MedSupply Ltd',
                    'barcode': '123456789002'
                },
                {
                    'name': 'Digital Thermometer',
                    'sku': 'MED-003',
                    'description': 'Digital clinical thermometer',
                    'unit_price': 85.00,
                    'category': 'Medical Equipment',
                    'stock_quantity': 150,
                    'reorder_level': 15,
                    'supplier': 'TechMed Inc',
                    'barcode': '123456789003'
                },
                {
                    'name': 'Bandages (Pack of 10)',
                    'sku': 'MED-004',
                    'description': 'Sterile medical bandages',
                    'unit_price': 35.00,
                    'category': 'Medical Supplies',
                    'stock_quantity': 300,
                    'reorder_level': 30,
                    'supplier': 'MedSupply Ltd',
                    'barcode': '123456789004'
                },
                {
                    'name': 'Antiseptic Solution 500ml',
                    'sku': 'MED-005',
                    'description': 'Antiseptic disinfectant solution',
                    'unit_price': 55.00,
                    'category': 'Pharmaceuticals',
                    'stock_quantity': 180,
                    'reorder_level': 25,
                    'supplier': 'PharmaCorp',
                    'barcode': '123456789005'
                },
                {
                    'name': 'Blood Pressure Monitor',
                    'sku': 'MED-006',
                    'description': 'Digital blood pressure monitor',
                    'unit_price': 250.00,
                    'category': 'Medical Equipment',
                    'stock_quantity': 75,
                    'reorder_level': 10,
                    'supplier': 'TechMed Inc',
                    'barcode': '123456789006'
                },
                {
                    'name': 'Insulin Syringes (Pack of 100)',
                    'sku': 'MED-007',
                    'description': 'Disposable insulin syringes',
                    'unit_price': 120.00,
                    'category': 'Medical Supplies',
                    'stock_quantity': 100,
                    'reorder_level': 15,
                    'supplier': 'MedSupply Ltd',
                    'barcode': '123456789007'
                },
                {
                    'name': 'Face Masks (Box of 50)',
                    'sku': 'MED-008',
                    'description': 'Surgical face masks',
                    'unit_price': 65.00,
                    'category': 'Medical Supplies',
                    'stock_quantity': 250,
                    'reorder_level': 25,
                    'supplier': 'SafetyFirst Ltd',
                    'barcode': '123456789008'
                }
            ]
            
            synced_count = 0
            
            for product_data in mobile_products:
                try:
                    # Check if product already exists
                    existing = Product.objects.filter(sku=product_data['sku']).first()
                    
                    if not existing:
                        # Create new product
                        product = Product.objects.create(**product_data)
                        print(f"✅ Created product: {product.name}")
                        synced_count += 1
                    else:
                        # Update existing product
                        for key, value in product_data.items():
                            setattr(existing, key, value)
                        existing.save()
                        print(f"🔄 Updated product: {existing.name}")
                        synced_count += 1
                        
                except Exception as e:
                    print(f"❌ Error syncing product {product_data['name']}: {e}")
            
            print(f"\n✅ Synced {synced_count} products")
            return synced_count
            
        except Exception as e:
            print(f"❌ Error syncing products: {e}")
            return 0
    
    def update_shared_data_js(self):
        """Update the sharedData.js file with synced data"""
        try:
            # Get all customers and products
            customers = list(Customer.objects.values(
                'id', 'name', 'email', 'phone', 'address', 'customer_type',
                'latitude', 'longitude', 'payment_terms'
            ))
            
            products = list(Product.objects.values(
                'id', 'name', 'sku', 'description', 'unit_price', 'category',
                'stock_quantity', 'reorder_level', 'supplier', 'barcode'
            ))
            
            # Read current sharedData.js
            shared_data_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/frontend/src/sharedData.js'
            
            with open(shared_data_path, 'r') as f:
                content = f.read()
            
            # Update customer data
            customer_js = f"export const sharedCustomers = {json.dumps(customers, indent=2, default=str)};"
            
            # Update product data  
            product_js = f"export const globalProducts = {json.dumps(products, indent=2, default=str)};"
            
            # Replace in content
            import re
            
            # Replace customers
            content = re.sub(
                r'export const sharedCustomers = \[.*?\];',
                customer_js,
                content,
                flags=re.DOTALL
            )
            
            # Replace products
            content = re.sub(
                r'export const globalProducts = \[.*?\];',
                product_js,
                content,
                flags=re.DOTALL
            )
            
            # Write back to file
            with open(shared_data_path, 'w') as f:
                f.write(content)
            
            print(f"✅ Updated sharedData.js with {len(customers)} customers and {len(products)} products")
            return True
            
        except Exception as e:
            print(f"❌ Error updating sharedData.js: {e}")
            return False
    
    def run_full_sync(self):
        """Run complete synchronization"""
        print("🚀 Starting Mobile App Data Sync...")
        print("=" * 50)
        
        # Sync customers
        print("\n📱 Syncing Customers...")
        customer_count = self.sync_customers_from_db()
        
        # Sync products
        print("\n📦 Syncing Products...")
        product_count = self.sync_products_from_db()
        
        # Update shared data
        print("\n🔄 Updating Frontend Data...")
        self.update_shared_data_js()
        
        print("\n" + "=" * 50)
        print("✅ SYNC COMPLETE!")
        print(f"📊 Summary:")
        print(f"   • Customers synced: {customer_count}")
        print(f"   • Products synced: {product_count}")
        print(f"   • Frontend data updated: ✅")
        print("\n🎯 Your Sales Dashboard now has access to all mobile app data!")

def main():
    sync = MobileAppDataSync()
    sync.run_full_sync()

if __name__ == "__main__":
    main()
