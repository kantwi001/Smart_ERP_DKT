#!/usr/bin/env python3
"""
Create 100 real sample customers and 19 warehouses for ERP system
"""
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from sales.models import Customer
from warehouse.models import Warehouse
from inventory.models import Product, Category
from django.contrib.auth import get_user_model
import random
from decimal import Decimal

User = get_user_model()

# Real customer data
CUSTOMER_DATA = [
    {"name": "Acme Corporation", "email": "contact@acmecorp.com", "phone": "+1-555-0101", "address": "123 Business Ave, New York, NY 10001", "city": "New York", "state": "NY", "country": "USA", "postal_code": "10001"},
    {"name": "Global Tech Solutions", "email": "info@globaltech.com", "phone": "+1-555-0102", "address": "456 Innovation Dr, San Francisco, CA 94105", "city": "San Francisco", "state": "CA", "country": "USA", "postal_code": "94105"},
    {"name": "Metro Manufacturing", "email": "sales@metromanuf.com", "phone": "+1-555-0103", "address": "789 Industrial Blvd, Detroit, MI 48201", "city": "Detroit", "state": "MI", "country": "USA", "postal_code": "48201"},
    {"name": "Sunrise Retail Group", "email": "orders@sunriseretail.com", "phone": "+1-555-0104", "address": "321 Commerce St, Chicago, IL 60601", "city": "Chicago", "state": "IL", "country": "USA", "postal_code": "60601"},
    {"name": "Pacific Logistics", "email": "dispatch@pacificlog.com", "phone": "+1-555-0105", "address": "654 Harbor Way, Los Angeles, CA 90210", "city": "Los Angeles", "state": "CA", "country": "USA", "postal_code": "90210"},
    {"name": "Atlantic Healthcare", "email": "procurement@atlantichealth.com", "phone": "+1-555-0106", "address": "987 Medical Center Dr, Boston, MA 02101", "city": "Boston", "state": "MA", "country": "USA", "postal_code": "02101"},
    {"name": "Mountain View Electronics", "email": "sales@mvelectronics.com", "phone": "+1-555-0107", "address": "147 Tech Park Rd, Austin, TX 78701", "city": "Austin", "state": "TX", "country": "USA", "postal_code": "78701"},
    {"name": "Coastal Construction", "email": "contracts@coastalconst.com", "phone": "+1-555-0108", "address": "258 Builder's Lane, Miami, FL 33101", "city": "Miami", "state": "FL", "country": "USA", "postal_code": "33101"},
    {"name": "Central Food Services", "email": "orders@centralfood.com", "phone": "+1-555-0109", "address": "369 Kitchen Way, Denver, CO 80201", "city": "Denver", "state": "CO", "country": "USA", "postal_code": "80201"},
    {"name": "Northern Textiles", "email": "wholesale@northtextiles.com", "phone": "+1-555-0110", "address": "741 Fabric St, Seattle, WA 98101", "city": "Seattle", "state": "WA", "country": "USA", "postal_code": "98101"},
    {"name": "Eastern Automotive", "email": "parts@easternautomotive.com", "phone": "+1-555-0111", "address": "852 Motor Ave, Atlanta, GA 30301", "city": "Atlanta", "state": "GA", "country": "USA", "postal_code": "30301"},
    {"name": "Western Mining Co", "email": "operations@westernmining.com", "phone": "+1-555-0112", "address": "963 Mining Rd, Phoenix, AZ 85001", "city": "Phoenix", "state": "AZ", "country": "USA", "postal_code": "85001"},
    {"name": "Urban Development LLC", "email": "projects@urbandev.com", "phone": "+1-555-0113", "address": "159 Development Dr, Portland, OR 97201", "city": "Portland", "state": "OR", "country": "USA", "postal_code": "97201"},
    {"name": "Suburban Supplies", "email": "sales@suburbansupplies.com", "phone": "+1-555-0114", "address": "357 Supply Chain Blvd, Nashville, TN 37201", "city": "Nashville", "state": "TN", "country": "USA", "postal_code": "37201"},
    {"name": "Industrial Equipment Corp", "email": "equipment@indequip.com", "phone": "+1-555-0115", "address": "468 Machinery Way, Cleveland, OH 44101", "city": "Cleveland", "state": "OH", "country": "USA", "postal_code": "44101"},
    {"name": "Digital Marketing Agency", "email": "campaigns@digitalmarketing.com", "phone": "+1-555-0116", "address": "579 Creative Ave, Las Vegas, NV 89101", "city": "Las Vegas", "state": "NV", "country": "USA", "postal_code": "89101"},
    {"name": "Green Energy Solutions", "email": "renewable@greenenergy.com", "phone": "+1-555-0117", "address": "680 Solar Dr, Sacramento, CA 95814", "city": "Sacramento", "state": "CA", "country": "USA", "postal_code": "95814"},
    {"name": "Blue Ocean Shipping", "email": "cargo@blueocean.com", "phone": "+1-555-0118", "address": "791 Port Authority Rd, Baltimore, MD 21201", "city": "Baltimore", "state": "MD", "country": "USA", "postal_code": "21201"},
    {"name": "Red Rock Consulting", "email": "advisory@redrock.com", "phone": "+1-555-0119", "address": "802 Consultant Plaza, Salt Lake City, UT 84101", "city": "Salt Lake City", "state": "UT", "country": "USA", "postal_code": "84101"},
    {"name": "Silver Star Hospitality", "email": "reservations@silverstar.com", "phone": "+1-555-0120", "address": "913 Hotel Row, Orlando, FL 32801", "city": "Orlando", "state": "FL", "country": "USA", "postal_code": "32801"},
    {"name": "Golden Gate Pharmaceuticals", "email": "research@goldengatepharma.com", "phone": "+1-555-0121", "address": "124 Research Blvd, San Diego, CA 92101", "city": "San Diego", "state": "CA", "country": "USA", "postal_code": "92101"},
    {"name": "Diamond Tech Industries", "email": "innovation@diamondtech.com", "phone": "+1-555-0122", "address": "235 Innovation Center, Raleigh, NC 27601", "city": "Raleigh", "state": "NC", "country": "USA", "postal_code": "27601"},
    {"name": "Platinum Financial Services", "email": "services@platinumfinancial.com", "phone": "+1-555-0123", "address": "346 Financial District, Charlotte, NC 28201", "city": "Charlotte", "state": "NC", "country": "USA", "postal_code": "28201"},
    {"name": "Copper Wire Electric", "email": "electrical@copperwire.com", "phone": "+1-555-0124", "address": "457 Electric Ave, Tampa, FL 33601", "city": "Tampa", "state": "FL", "country": "USA", "postal_code": "33601"},
    {"name": "Iron Works Manufacturing", "email": "production@ironworks.com", "phone": "+1-555-0125", "address": "568 Steel Mill Rd, Pittsburgh, PA 15201", "city": "Pittsburgh", "state": "PA", "country": "USA", "postal_code": "15201"},
    {"name": "Crystal Clear Water", "email": "purification@crystalclear.com", "phone": "+1-555-0126", "address": "679 Water Treatment Way, Milwaukee, WI 53201", "city": "Milwaukee", "state": "WI", "country": "USA", "postal_code": "53201"},
    {"name": "Marble Stone Quarry", "email": "quarry@marblestone.com", "phone": "+1-555-0127", "address": "780 Quarry Rd, Burlington, VT 05401", "city": "Burlington", "state": "VT", "country": "USA", "postal_code": "05401"},
    {"name": "Granite Peak Construction", "email": "building@granitepeak.com", "phone": "+1-555-0128", "address": "891 Construction Blvd, Boise, ID 83701", "city": "Boise", "state": "ID", "country": "USA", "postal_code": "83701"},
    {"name": "Sapphire Software Solutions", "email": "development@sapphiresoftware.com", "phone": "+1-555-0129", "address": "902 Software Park, Kansas City, MO 64101", "city": "Kansas City", "state": "MO", "country": "USA", "postal_code": "64101"},
    {"name": "Ruby Red Restaurants", "email": "franchise@rubyred.com", "phone": "+1-555-0130", "address": "113 Restaurant Row, New Orleans, LA 70112", "city": "New Orleans", "state": "LA", "country": "USA", "postal_code": "70112"},
    {"name": "Emerald Green Landscaping", "email": "design@emeraldgreen.com", "phone": "+1-555-0131", "address": "224 Garden Center Dr, Richmond, VA 23219", "city": "Richmond", "state": "VA", "country": "USA", "postal_code": "23219"},
    {"name": "Topaz Transportation", "email": "logistics@topaztrans.com", "phone": "+1-555-0132", "address": "335 Transport Hub, Memphis, TN 38103", "city": "Memphis", "state": "TN", "country": "USA", "postal_code": "38103"},
    {"name": "Opal Office Solutions", "email": "office@opalsolutions.com", "phone": "+1-555-0133", "address": "446 Business Center, Oklahoma City, OK 73102", "city": "Oklahoma City", "state": "OK", "country": "USA", "postal_code": "73102"},
    {"name": "Pearl Publishing House", "email": "editorial@pearlpublishing.com", "phone": "+1-555-0134", "address": "557 Publishing Plaza, Hartford, CT 06103", "city": "Hartford", "state": "CT", "country": "USA", "postal_code": "06103"},
    {"name": "Jade Jewelry Designs", "email": "custom@jadejewelry.com", "phone": "+1-555-0135", "address": "668 Artisan Alley, Providence, RI 02903", "city": "Providence", "state": "RI", "country": "USA", "postal_code": "02903"},
    {"name": "Amber Analytics", "email": "data@amberanalytics.com", "phone": "+1-555-0136", "address": "779 Data Center Dr, Columbus, OH 43215", "city": "Columbus", "state": "OH", "country": "USA", "postal_code": "43215"},
    {"name": "Coral Reef Marine", "email": "marine@coralreef.com", "phone": "+1-555-0137", "address": "880 Marina Blvd, Honolulu, HI 96813", "city": "Honolulu", "state": "HI", "country": "USA", "postal_code": "96813"},
    {"name": "Turquoise Travel Agency", "email": "bookings@turquoisetravel.com", "phone": "+1-555-0138", "address": "991 Travel Plaza, Anchorage, AK 99501", "city": "Anchorage", "state": "AK", "country": "USA", "postal_code": "99501"},
    {"name": "Onyx Operations", "email": "operations@onyxops.com", "phone": "+1-555-0139", "address": "102 Operations Center, Little Rock, AR 72201", "city": "Little Rock", "state": "AR", "country": "USA", "postal_code": "72201"},
    {"name": "Quartz Quality Control", "email": "quality@quartzqc.com", "phone": "+1-555-0140", "address": "213 Quality Assurance Way, Des Moines, IA 50309", "city": "Des Moines", "state": "IA", "country": "USA", "postal_code": "50309"},
    {"name": "Agate Agricultural", "email": "farming@agateag.com", "phone": "+1-555-0141", "address": "324 Farm Road, Topeka, KS 66603", "city": "Topeka", "state": "KS", "country": "USA", "postal_code": "66603"},
    {"name": "Obsidian Oil & Gas", "email": "drilling@obsidianoil.com", "phone": "+1-555-0142", "address": "435 Energy Corridor, Jackson, MS 39201", "city": "Jackson", "state": "MS", "country": "USA", "postal_code": "39201"},
    {"name": "Flint Fire Safety", "email": "safety@flintfire.com", "phone": "+1-555-0143", "address": "546 Safety Systems Blvd, Helena, MT 59601", "city": "Helena", "state": "MT", "country": "USA", "postal_code": "59601"},
    {"name": "Slate Roofing Solutions", "email": "roofing@slateroofing.com", "phone": "+1-555-0144", "address": "657 Roofing Row, Lincoln, NE 68508", "city": "Lincoln", "state": "NE", "country": "USA", "postal_code": "68508"},
    {"name": "Sandstone Security", "email": "security@sandstonesec.com", "phone": "+1-555-0145", "address": "768 Security Plaza, Carson City, NV 89701", "city": "Carson City", "state": "NV", "country": "USA", "postal_code": "89701"},
    {"name": "Limestone Logistics", "email": "shipping@limestonelogistics.com", "phone": "+1-555-0146", "address": "879 Logistics Lane, Concord, NH 03301", "city": "Concord", "state": "NH", "country": "USA", "postal_code": "03301"},
    {"name": "Shale Shipping Services", "email": "freight@shaleshipping.com", "phone": "+1-555-0147", "address": "980 Freight Yard, Trenton, NJ 08608", "city": "Trenton", "state": "NJ", "country": "USA", "postal_code": "08608"},
    {"name": "Basalt Building Materials", "email": "materials@basaltbuilding.com", "phone": "+1-555-0148", "address": "191 Materials Market, Santa Fe, NM 87501", "city": "Santa Fe", "state": "NM", "country": "USA", "postal_code": "87501"},
    {"name": "Pumice Processing Plant", "email": "processing@pumiceplant.com", "phone": "+1-555-0149", "address": "292 Processing Park, Albany, NY 12207", "city": "Albany", "state": "NY", "country": "USA", "postal_code": "12207"},
    {"name": "Volcanic Ventures", "email": "ventures@volcanicventures.com", "phone": "+1-555-0150", "address": "393 Venture Valley, Bismarck, ND 58501", "city": "Bismarck", "state": "ND", "country": "USA", "postal_code": "58501"},
    {"name": "Magma Manufacturing", "email": "production@magmamanuf.com", "phone": "+1-555-0151", "address": "494 Manufacturing Mile, Fargo, ND 58102", "city": "Fargo", "state": "ND", "country": "USA", "postal_code": "58102"},
    {"name": "Lava Landscaping", "email": "design@lavalandscaping.com", "phone": "+1-555-0152", "address": "595 Landscape Loop, Cheyenne, WY 82001", "city": "Cheyenne", "state": "WY", "country": "USA", "postal_code": "82001"}
]

# Warehouse data for 19 locations
WAREHOUSE_DATA = [
    {"name": "New York Distribution Center", "location": "Brooklyn, NY", "address": "500 Industrial Pkwy, Brooklyn, NY 11232", "capacity": 50000, "current_stock": 35000},
    {"name": "Los Angeles Warehouse", "location": "Los Angeles, CA", "address": "1200 Warehouse Blvd, Los Angeles, CA 90021", "capacity": 75000, "current_stock": 52000},
    {"name": "Chicago Central Hub", "location": "Chicago, IL", "address": "800 Distribution Dr, Chicago, IL 60609", "capacity": 60000, "current_stock": 41000},
    {"name": "Houston Storage Facility", "location": "Houston, TX", "address": "2000 Logistics Ln, Houston, TX 77032", "capacity": 45000, "current_stock": 28000},
    {"name": "Phoenix Regional Center", "location": "Phoenix, AZ", "address": "1500 Desert Storage Way, Phoenix, AZ 85043", "capacity": 40000, "current_stock": 22000},
    {"name": "Philadelphia East Coast Hub", "location": "Philadelphia, PA", "address": "900 Port Access Rd, Philadelphia, PA 19153", "capacity": 35000, "current_stock": 19000},
    {"name": "San Antonio South Texas", "location": "San Antonio, TX", "address": "1100 Commerce Center, San Antonio, TX 78219", "capacity": 30000, "current_stock": 18000},
    {"name": "San Diego Pacific Center", "location": "San Diego, CA", "address": "700 Pacific Storage Dr, San Diego, CA 92154", "capacity": 25000, "current_stock": 15000},
    {"name": "Dallas Metroplex Hub", "location": "Dallas, TX", "address": "1800 Metroplex Blvd, Dallas, TX 75261", "capacity": 55000, "current_stock": 38000},
    {"name": "San Jose Tech Valley", "location": "San Jose, CA", "address": "600 Silicon Storage Way, San Jose, CA 95110", "capacity": 20000, "current_stock": 12000},
    {"name": "Austin Central Texas", "location": "Austin, TX", "address": "1300 Hill Country Dr, Austin, TX 78744", "capacity": 28000, "current_stock": 16000},
    {"name": "Jacksonville Southeast", "location": "Jacksonville, FL", "address": "1000 Atlantic Storage Rd, Jacksonville, FL 32218", "capacity": 32000, "current_stock": 21000},
    {"name": "Fort Worth Alliance", "location": "Fort Worth, TX", "address": "1600 Alliance Pkwy, Fort Worth, TX 76177", "capacity": 42000, "current_stock": 29000},
    {"name": "Columbus Midwest Hub", "location": "Columbus, OH", "address": "1400 Midwest Distribution, Columbus, OH 43228", "capacity": 38000, "current_stock": 24000},
    {"name": "Charlotte Southeast Hub", "location": "Charlotte, NC", "address": "1700 Southeast Center Dr, Charlotte, NC 28208", "capacity": 33000, "current_stock": 20000},
    {"name": "Indianapolis Crossroads", "location": "Indianapolis, IN", "address": "1900 Crossroads Blvd, Indianapolis, IN 46241", "capacity": 36000, "current_stock": 23000},
    {"name": "Seattle Northwest Center", "location": "Seattle, WA", "address": "2100 Northwest Storage, Seattle, WA 98108", "capacity": 29000, "current_stock": 17000},
    {"name": "Denver Mountain West", "location": "Denver, CO", "address": "2200 Mountain View Dr, Denver, CO 80249", "capacity": 31000, "current_stock": 19000},
    {"name": "Boston Northeast Hub", "location": "Boston, MA", "address": "2300 Northeast Logistics, Boston, MA 02128", "capacity": 27000, "current_stock": 14000}
]

def create_customers():
    """Create 100 sample customers"""
    print("🏢 Creating 100 sample customers...")
    
    # Get or create a default user for created_by field
    try:
        default_user = User.objects.get(username='arkucollins')
    except User.DoesNotExist:
        print("❌ Default user 'arkucollins' not found. Please create this user first.")
        return
    
    created_count = 0
    
    for i, customer_data in enumerate(CUSTOMER_DATA):
        try:
            customer, created = Customer.objects.get_or_create(
                email=customer_data['email'],
                defaults={
                    'name': customer_data['name'],
                    'phone': customer_data['phone'],
                    'address': customer_data['address'],
                    'customer_type': customer_data.get('customer_type', 'retailer'),
                    'payment_terms': customer_data.get('payment_terms', 30)
                }
            )
            if created:
                created_count += 1
                print(f"✅ Created customer: {customer.name}")
            else:
                print(f"⚠️  Customer already exists: {customer.name}")
        except Exception as e:
            print(f"❌ Error creating customer {customer_data['name']}: {e}")
    
    # Generate 48 additional customers to reach 100 total
    print("📝 Generating 48 additional customers...")
    additional_customers = [
        "Tech Innovations LLC", "Global Supply Chain", "Metro Distribution", 
        "Pacific Trading Co", "Atlantic Wholesale", "Mountain View Corp",
        "Coastal Enterprises", "Central Business Hub", "Northern Commerce",
        "Eastern Markets", "Western Distributors", "Urban Solutions",
        "Suburban Retail", "Industrial Partners", "Commercial Ventures",
        "Professional Services", "Enterprise Solutions", "Business Networks",
        "Trade Associates", "Market Leaders", "Industry Experts",
        "Strategic Partners", "Growth Ventures", "Success Enterprises",
        "Premier Trading", "Elite Commerce", "Advanced Systems",
        "Dynamic Solutions", "Innovative Partners", "Progressive Trade",
        "Modern Enterprises", "Future Commerce", "Smart Business",
        "Digital Trading", "Next Gen Solutions", "Rapid Growth Co",
        "Efficient Systems", "Reliable Partners", "Quality Enterprises",
        "Excellence Trading", "Superior Commerce", "Outstanding Solutions",
        "Remarkable Partners", "Exceptional Trading", "Premium Commerce",
        "Ultimate Solutions", "Perfect Partners", "Ideal Trading"
    ]
    
    for i, company_name in enumerate(additional_customers, start=53):
        try:
            customer, created = Customer.objects.get_or_create(
                email=f"contact{i}@{company_name.lower().replace(' ', '').replace(',', '')}.com",
                defaults={
                    'name': company_name,
                    'phone': f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
                    'address': f"{random.randint(100, 9999)} Business Ave, Suite {random.randint(100, 999)}, City {random.randint(10, 99)}, State {random.randint(10, 50)}, {random.randint(10000, 99999)}",
                    'customer_type': random.choice(['wholesaler', 'distributor', 'retailer']),
                    'payment_terms': random.choice([30, 60, 90])
                }
            )
            if created:
                created_count += 1
                print(f"✅ Created additional customer: {customer.name}")
        except Exception as e:
            print(f"❌ Error creating additional customer {i}: {e}")
    
    print(f"🎉 Successfully created {created_count} new customers!")
    print(f"📊 Total customers in database: {Customer.objects.count()}")

def create_warehouses():
    """Create 19 warehouses"""
    print("🏭 Creating 19 warehouses...")
    
    # Get or create a default user for created_by field
    try:
        default_user = User.objects.get(username='arkucollins')
    except User.DoesNotExist:
        print("❌ Default user 'arkucollins' not found. Please create this user first.")
        return
    
    created_count = 0
    
    for warehouse_data in WAREHOUSE_DATA:
        try:
            warehouse, created = Warehouse.objects.get_or_create(
                name=warehouse_data['name'],
                defaults={
                    'location': warehouse_data['location'],
                    'address': warehouse_data['address'],
                    'capacity': warehouse_data['capacity'],
                    'current_stock': warehouse_data['current_stock'],
                    'status': 'active',
                    'created_by': default_user
                }
            )
            if created:
                created_count += 1
                print(f"✅ Created warehouse: {warehouse.name}")
            else:
                print(f"⚠️  Warehouse already exists: {warehouse.name}")
        except Exception as e:
            print(f"❌ Error creating warehouse {warehouse_data['name']}: {e}")
    
    print(f"🎉 Successfully created {created_count} new warehouses!")
    print(f"📊 Total warehouses in database: {Warehouse.objects.count()}")

def create_sample_products():
    """Create sample products for the inventory"""
    print("📦 Creating sample products...")
    
    try:
        default_user = User.objects.get(username='arkucollins')
    except User.DoesNotExist:
        print("❌ Default user 'arkucollins' not found. Please create this user first.")
        return
    
    # Get a warehouse for the products
    try:
        warehouse = Warehouse.objects.first()
        if not warehouse:
            print("❌ No warehouses found. Please create warehouses first.")
            return
    except Exception as e:
        print(f"❌ Error getting warehouse: {e}")
        return
    
    products_data = [
        {"name": "Laptop Computer", "sku": "LAP-001", "description": "High-performance laptop for business use", "category": "Electronics", "price": 1200.00, "cost": 800.00, "quantity": 25},
        {"name": "Office Chair", "sku": "CHR-002", "description": "Ergonomic office chair with lumbar support", "category": "Furniture", "price": 350.00, "cost": 200.00, "quantity": 15},
        {"name": "Wireless Mouse", "sku": "MOU-003", "description": "Bluetooth wireless mouse with precision tracking", "category": "Electronics", "price": 45.00, "cost": 25.00, "quantity": 100},
        {"name": "Desk Lamp", "sku": "LAM-004", "description": "LED desk lamp with adjustable brightness", "category": "Office Supplies", "price": 75.00, "cost": 40.00, "quantity": 50},
        {"name": "Notebook Set", "sku": "NOT-005", "description": "Premium notebook set with pen", "category": "Stationery", "price": 25.00, "cost": 12.00, "quantity": 200},
    ]
    
    created_count = 0
    
    for product_data in products_data:
        try:
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults={
                    'name': product_data['name'],
                    'description': product_data['description'],
                    'category': product_data['category'],
                    'price': Decimal(str(product_data['price'])),
                    'cost': Decimal(str(product_data['cost'])),
                    'quantity': product_data['quantity'],
                    'min_stock': 10,
                    'max_stock': 500,
                    'unit': 'piece',
                    'status': 'active',
                    'warehouse': warehouse,
                    'created_by': default_user
                }
            )
            if created:
                created_count += 1
                print(f"✅ Created product: {product.name}")
            else:
                print(f"⚠️  Product already exists: {product.name}")
        except Exception as e:
            print(f"❌ Error creating product {product_data['name']}: {e}")
    
    print(f"🎉 Successfully created {created_count} new products!")
    print(f"📊 Total products in database: {Product.objects.count()}")

def main():
    print("🚀 Starting sample data creation...")
    print("=" * 50)
    
    # Create warehouses first
    create_warehouses()
    print()
    
    # Create customers
    create_customers()
    print()
    
    # Create sample products
    create_sample_products()
    print()
    
    print("=" * 50)
    print("✅ Sample data creation completed!")
    print(f"📊 Summary:")
    print(f"   - Customers: {Customer.objects.count()}")
    print(f"   - Warehouses: {Warehouse.objects.count()}")
    print(f"   - Products: {Product.objects.count()}")

if __name__ == "__main__":
    main()
