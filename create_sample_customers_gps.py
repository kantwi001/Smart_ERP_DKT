#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal

# Add the backend directory to the Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sales.models import Customer

def create_sample_customers():
    """Create sample customers with GPS coordinates in Ghana"""
    
    sample_customers = [
        {
            'name': 'Accra Central Market',
            'email': 'accra.market@example.com',
            'phone': '+233244123456',
            'address': 'Makola Market, Accra Central',
            'customer_type': 'wholesaler',
            'latitude': Decimal('5.5502'),
            'longitude': Decimal('-0.2174'),
            'payment_terms': 30
        },
        {
            'name': 'Kumasi Trade Center',
            'email': 'kumasi.trade@example.com',
            'phone': '+233244234567',
            'address': 'Kejetia Market, Kumasi',
            'customer_type': 'distributor',
            'latitude': Decimal('6.6885'),
            'longitude': Decimal('-1.6244'),
            'payment_terms': 45
        },
        {
            'name': 'Tamale Distribution Hub',
            'email': 'tamale.hub@example.com',
            'phone': '+233244345678',
            'address': 'Central Market, Tamale',
            'customer_type': 'distributor',
            'latitude': Decimal('9.4034'),
            'longitude': Decimal('-0.8424'),
            'payment_terms': 30
        },
        {
            'name': 'Cape Coast Retail Store',
            'email': 'capecoast.retail@example.com',
            'phone': '+233244456789',
            'address': 'Kotokuraba Market, Cape Coast',
            'customer_type': 'retailer',
            'latitude': Decimal('5.1053'),
            'longitude': Decimal('-1.2466'),
            'payment_terms': 15
        },
        {
            'name': 'Takoradi Port Supplies',
            'email': 'takoradi.port@example.com',
            'phone': '+233244567890',
            'address': 'Takoradi Market Circle',
            'customer_type': 'wholesaler',
            'latitude': Decimal('4.8845'),
            'longitude': Decimal('-1.7554'),
            'payment_terms': 60
        },
        {
            'name': 'Ho Regional Store',
            'email': 'ho.regional@example.com',
            'phone': '+233244678901',
            'address': 'Ho Central Market',
            'customer_type': 'retailer',
            'latitude': Decimal('6.6111'),
            'longitude': Decimal('0.4708'),
            'payment_terms': 15
        },
        {
            'name': 'Sunyani Commercial Hub',
            'email': 'sunyani.commercial@example.com',
            'phone': '+233244789012',
            'address': 'Sunyani Main Market',
            'customer_type': 'distributor',
            'latitude': Decimal('7.3392'),
            'longitude': Decimal('-2.3265'),
            'payment_terms': 30
        },
        {
            'name': 'Wa Northern Supplies',
            'email': 'wa.northern@example.com',
            'phone': '+233244890123',
            'address': 'Wa Central Market',
            'customer_type': 'retailer',
            'latitude': Decimal('10.0606'),
            'longitude': Decimal('-2.5057'),
            'payment_terms': 15
        },
        {
            'name': 'Bolgatanga Trade Post',
            'email': 'bolga.trade@example.com',
            'phone': '+233244901234',
            'address': 'Bolgatanga Market',
            'customer_type': 'distributor',
            'latitude': Decimal('10.7856'),
            'longitude': Decimal('-0.8514'),
            'payment_terms': 45
        },
        {
            'name': 'Tema Industrial Supplies',
            'email': 'tema.industrial@example.com',
            'phone': '+233245012345',
            'address': 'Tema Community 1 Market',
            'customer_type': 'wholesaler',
            'latitude': Decimal('5.6698'),
            'longitude': Decimal('-0.0166'),
            'payment_terms': 30
        }
    ]
    
    created_count = 0
    updated_count = 0
    
    for customer_data in sample_customers:
        customer, created = Customer.objects.get_or_create(
            email=customer_data['email'],
            defaults=customer_data
        )
        
        if created:
            created_count += 1
            print(f"✓ Created customer: {customer.name} at ({customer.latitude}, {customer.longitude})")
        else:
            # Update existing customer with GPS coordinates if they don't have them
            if not customer.latitude or not customer.longitude:
                customer.latitude = customer_data['latitude']
                customer.longitude = customer_data['longitude']
                customer.address = customer_data['address']
                customer.customer_type = customer_data['customer_type']
                customer.save()
                updated_count += 1
                print(f"✓ Updated customer: {customer.name} with GPS coordinates")
            else:
                print(f"- Customer already exists with GPS: {customer.name}")
    
    print(f"\n📊 Summary:")
    print(f"   Created: {created_count} new customers")
    print(f"   Updated: {updated_count} existing customers")
    print(f"   Total customers with GPS: {Customer.objects.filter(latitude__isnull=False, longitude__isnull=False).count()}")
    
    return created_count + updated_count

if __name__ == '__main__':
    print("🗺️  Creating sample customers with GPS coordinates for heat map...")
    print("=" * 60)
    
    try:
        result = create_sample_customers()
        print(f"\n✅ Successfully processed {result} customers!")
        print("\n🎯 You can now view the customer heat map in the Sales Dashboard.")
        
    except Exception as e:
        print(f"\n❌ Error creating sample customers: {e}")
        sys.exit(1)
