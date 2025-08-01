from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Import only the models we know exist
from inventory.models import Product, Category, ProductPrice, InventoryTransfer
from sales.models import Sale, Customer
from accounting.models import Account, Transaction as AccountingTransaction
from warehouse.models import Warehouse, WarehouseLocation, StockMovement

User = get_user_model()

class Command(BaseCommand):
    help = 'Generate comprehensive demo data using updated product categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing demo data and regenerate',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This command will DELETE ALL existing demo data and regenerate.\n'
                    'Run with --confirm to proceed.'
                )
            )
            return

        with transaction.atomic():
            self.stdout.write('Starting demo data generation...')
            
            # Step 1: Clear existing demo data
            self.clear_existing_data()
            
            # Step 2: Create users
            users = self.create_users()
            
            # Step 3: Create customers
            customers = self.create_customers()
            
            # Step 4: Create accounting accounts
            accounts = self.create_accounting_accounts()
            
            # Step 5: Create warehouses and locations
            warehouses = self.create_warehouses_and_locations(users)
            
            # Step 6: Generate sales data
            self.generate_sales_data(customers, users)
            
            # Step 7: Generate inventory transfers
            self.generate_inventory_transfers(users, warehouses)
            
            # Step 8: Generate warehouse movements
            self.generate_warehouse_movements(warehouses, users)
            
            # Step 9: Generate accounting transactions
            self.generate_accounting_transactions(accounts)
            
            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully generated comprehensive demo data for all core modules!'
                )
            )

    def clear_existing_data(self):
        self.stdout.write('Clearing existing demo data...')
        
        # Clear in order to respect foreign key constraints
        StockMovement.objects.all().delete()
        WarehouseLocation.objects.all().delete()
        AccountingTransaction.objects.all().delete()
        Sale.objects.all().delete()
        InventoryTransfer.objects.all().delete()
        
        # Clear customers (but keep products)
        Customer.objects.all().delete()
        
        self.stdout.write('Existing demo data cleared.')

    def create_users(self):
        self.stdout.write('Creating demo users...')
        
        # Create demo users
        users = []
        user_data = [
            {'username': 'sales_manager', 'role': 'sales_manager'},
            {'username': 'sales_rep_1', 'role': 'employee'},
            {'username': 'sales_rep_2', 'role': 'employee'},
            {'username': 'operations_mgr', 'role': 'manager'},
            {'username': 'finance_mgr', 'role': 'manager'},
        ]
        
        for user_info in user_data:
            user, created = User.objects.get_or_create(
                username=user_info['username'],
                defaults={
                    'email': f"{user_info['username']}@example.com",
                    'role': user_info['role'],
                    'is_active': True,
                }
            )
            if created:
                user.set_password('demo123')
                user.save()
            users.append(user)
        
        self.stdout.write(f'Created {len(users)} demo users.')
        return users

    def create_customers(self):
        self.stdout.write('Creating customers...')
        
        customers = []
        customer_data = [
            {'name': 'Accra Medical Center', 'type': 'wholesaler', 'email': 'orders@accramedical.com'},
            {'name': 'Kumasi Health Clinic', 'type': 'retailer', 'email': 'procurement@kumasiclinic.com'},
            {'name': 'Tema General Hospital', 'type': 'wholesaler', 'email': 'supplies@temageneral.com'},
            {'name': 'Cape Coast Pharmacy', 'type': 'retailer', 'email': 'manager@ccpharmacy.com'},
            {'name': 'Tamale Regional Hospital', 'type': 'wholesaler', 'email': 'admin@tamaleregional.com'},
            {'name': 'Ho Municipal Hospital', 'type': 'retailer', 'email': 'supplies@homuncipal.com'},
            {'name': 'Sekondi Health Center', 'type': 'retailer', 'email': 'orders@sekondihealth.com'},
            {'name': 'Sunyani Medical Supplies', 'type': 'distributor', 'email': 'info@sunyanimedical.com'},
        ]
        
        for customer_info in customer_data:
            customer = Customer.objects.create(
                name=customer_info['name'],
                email=customer_info['email'],
                customer_type=customer_info['type'],
                phone=f'+233{random.randint(200000000, 299999999)}',
                address=f'{customer_info["name"]} Address, Ghana',
                payment_terms=random.choice([30, 45, 60])
            )
            customers.append(customer)
        
        self.stdout.write(f'Created {len(customers)} customers.')
        return customers

    def create_accounting_accounts(self):
        self.stdout.write('Creating accounting accounts...')
        
        accounts = []
        account_data = [
            {'name': 'Cash', 'type': 'Asset', 'balance': 50000},
            {'name': 'Bank - GCB', 'type': 'Asset', 'balance': 150000},
            {'name': 'Accounts Receivable', 'type': 'Asset', 'balance': 75000},
            {'name': 'Inventory', 'type': 'Asset', 'balance': 200000},
            {'name': 'Sales Revenue', 'type': 'Revenue', 'balance': 0},
            {'name': 'Cost of Goods Sold', 'type': 'Expense', 'balance': 0},
            {'name': 'Operating Expenses', 'type': 'Expense', 'balance': 0},
        ]
        
        for acc_info in account_data:
            account, created = Account.objects.get_or_create(
                name=acc_info['name'],
                defaults={
                    'type': acc_info['type'],
                    'balance': acc_info['balance']
                }
            )
            accounts.append(account)
        
        self.stdout.write(f'Created {len(accounts)} accounting accounts.')
        return accounts

    def create_warehouses_and_locations(self, users):
        self.stdout.write('Creating warehouses and locations...')
        
        warehouses = []
        warehouse_data = [
            {'name': 'Accra Main Warehouse', 'code': 'ACC-001', 'manager': users[1]},
            {'name': 'Kumasi Regional Store', 'code': 'KUM-002', 'manager': users[2]},
            {'name': 'Tema Distribution Center', 'code': 'TEM-003', 'manager': users[1]},
        ]
        
        for wh_info in warehouse_data:
            warehouse, created = Warehouse.objects.get_or_create(
                code=wh_info['code'],
                defaults={
                    'name': wh_info['name'],
                    'manager': wh_info['manager'],
                    'address': f'{wh_info["name"]} Location, Ghana',
                    'capacity': random.randint(1000, 5000)
                }
            )
            warehouses.append(warehouse)
            
            # Create locations within each warehouse
            location_names = ['Receiving Area', 'Storage Area', 'Picking Area', 'Shipping Area']
            for loc_name in location_names:
                WarehouseLocation.objects.get_or_create(
                    warehouse=warehouse,
                    name=loc_name,
                    defaults={
                        'code': f'{warehouse.code}-{loc_name[:3].upper()}',
                        'aisle': f'A{random.randint(1, 10)}',
                        'shelf': f'S{random.randint(1, 20)}',
                    }
                )
        
        self.stdout.write(f'Created {len(warehouses)} warehouses with locations.')
        return warehouses

    def generate_sales_data(self, customers, users):
        self.stdout.write('Generating sales data...')
        
        products = list(Product.objects.all())
        sales_count = 0
        
        # Generate sales for the last 90 days
        for i in range(50):
            customer = random.choice(customers)
            staff = random.choice(users[:3])  # Sales staff
            
            # Random date in last 90 days
            days_ago = random.randint(0, 90)
            sale_date = timezone.now() - timedelta(days=days_ago)
            
            # Calculate total based on product categories
            total = Decimal(random.randint(500, 5000))
            
            sale = Sale.objects.create(
                customer=customer,
                staff=staff,
                date=sale_date,
                total=total,
                status=random.choice(['completed', 'pending', 'unpaid']),
                currency='GHS'
            )
            sales_count += 1
        
        self.stdout.write(f'Generated {sales_count} sales records.')

    def generate_inventory_transfers(self, users, warehouses):
        self.stdout.write('Generating inventory transfers...')
        
        products = list(Product.objects.all())
        transfer_count = 0
        
        for i in range(30):
            product = random.choice(products)
            user = random.choice(users)
            
            from_wh = random.choice(warehouses)
            to_wh = random.choice([wh for wh in warehouses if wh != from_wh])
            
            transfer = InventoryTransfer.objects.create(
                product=product,
                quantity=random.randint(10, 100),
                from_location=from_wh.name,
                to_location=to_wh.name,
                requested_by=user,
                status=random.choice(['pending', 'completed', 'in transit'])
            )
            transfer_count += 1
        
        self.stdout.write(f'Generated {transfer_count} inventory transfers.')

    def generate_warehouse_movements(self, warehouses, users):
        self.stdout.write('Generating warehouse movements...')
        
        movement_count = 0
        
        for warehouse in warehouses:
            locations = list(warehouse.locations.all())
            if not locations:
                continue
                
            for i in range(15):
                location = random.choice(locations)
                user = random.choice(users)
                
                movement = StockMovement.objects.create(
                    warehouse=warehouse,
                    location=location,
                    movement_type=random.choice(['in', 'out', 'transfer']),
                    quantity=random.randint(5, 50),
                    created_by=user,
                    reference=f'MOV-{random.randint(1000, 9999)}',
                    notes=f'Demo stock movement for {warehouse.name}'
                )
                movement_count += 1
        
        self.stdout.write(f'Generated {movement_count} warehouse movements.')

    def generate_accounting_transactions(self, accounts):
        self.stdout.write('Generating accounting transactions...')
        
        transaction_count = 0
        
        for i in range(40):
            account = random.choice(accounts)
            
            transaction = AccountingTransaction.objects.create(
                account=account,
                amount=Decimal(random.randint(100, 10000)),
                transaction_type=random.choice(['credit', 'debit']),
                description=f'Demo transaction {i+1} - {account.name}',
                date=timezone.now() - timedelta(days=random.randint(0, 60))
            )
            transaction_count += 1
        
        self.stdout.write(f'Generated {transaction_count} accounting transactions.')
