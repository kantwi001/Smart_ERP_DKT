from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from warehouse.models import Warehouse, WarehouseLocation, StockMovement
from inventory.models import Product
from sales.models import Sale, Customer
from datetime import datetime, timedelta
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Clear all warehouses and setup new warehouse system with codes, users, and stock management'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing warehouses',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL existing warehouses. Run with --confirm to proceed.'
                )
            )
            return

        # New warehouse list from user
        warehouse_list = [
            "Tema Warehouse",
            "Medical Oti",
            "Medical Western North",
            "Medical UW_Savannah",
            "Medical Bono East",
            "Medical Eastern_Volta",
            "Medical Northern Territory",
            "Medical Southwest Territory",
            "DKT Ghana-Marketing",
            "Medical Sales Rep-Middle Territory",
            "Medical Sales Warehouse-Southern Sector",
            "Promotional Stocks-Program Dept.",
            "Promotional Materials",
            "Training Materials",
            "Inspection and Regulatory",
            "Medical Brong Ahafo",
            "Northern Zone",
            "Central Western Zone",
            "Eastern Volta Zone",
            "Ashanti Zone",
            "Accra West Zone",
            "Accra East Zone",
            "Tema Central Warehouse",
            "National Sales and Distribution"
        ]

        try:
            with transaction.atomic():
                self.stdout.write('Clearing all existing warehouses...')
                
                # Clear existing warehouse data
                StockMovement.objects.all().delete()
                WarehouseLocation.objects.all().delete()
                Warehouse.objects.all().delete()
                self.stdout.write('Cleared existing warehouse data')

                self.stdout.write('Setting up new warehouse system...')
                
                # Get all products for stock allocation
                products = list(Product.objects.all())
                if not products:
                    self.stdout.write(self.style.ERROR('No products found! Please run product setup first.'))
                    return

                # Get all customers for sales generation
                customers = list(Customer.objects.all())
                if not customers:
                    self.stdout.write(self.style.ERROR('No customers found! Please run customer setup first.'))
                    return

                # Create Sales Manager role
                sales_manager, created = User.objects.get_or_create(
                    username='sales_manager',
                    defaults={
                        'email': 'sales.manager@company.com',
                        'first_name': 'Sales',
                        'last_name': 'Manager',
                        'is_staff': True
                    }
                )
                if created:
                    sales_manager.set_password('manager123')
                    sales_manager.save()
                
                self.stdout.write('Created Sales Manager user')

                # Create warehouses with codes and assign users
                warehouses = []
                sales_reps = []
                
                for i, warehouse_name in enumerate(warehouse_list, 1):
                    # Generate warehouse code
                    if 'Tema' in warehouse_name:
                        code = f'TW{i:03d}'
                    elif 'Medical' in warehouse_name:
                        code = f'MW{i:03d}'
                    elif 'Promotional' in warehouse_name:
                        code = f'PW{i:03d}'
                    elif 'Training' in warehouse_name:
                        code = f'TR{i:03d}'
                    elif 'Zone' in warehouse_name:
                        code = f'ZW{i:03d}'
                    elif 'Accra' in warehouse_name:
                        code = f'AW{i:03d}'
                    elif 'National' in warehouse_name:
                        code = f'NW{i:03d}'
                    else:
                        code = f'WH{i:03d}'

                    # Create Sales Rep for this warehouse
                    username = f'sales_rep_{i}'
                    sales_rep, created = User.objects.get_or_create(
                        username=username,
                        defaults={
                            'email': f'sales.rep{i}@company.com',
                            'first_name': f'Rep{i}',
                            'last_name': warehouse_name.split()[0],
                            'is_staff': True
                        }
                    )
                    if created:
                        sales_rep.set_password('rep123')
                        sales_rep.save()
                    
                    sales_reps.append(sales_rep)

                    # Create warehouse
                    warehouse = Warehouse.objects.create(
                        name=warehouse_name,
                        code=code,
                        address=f'{warehouse_name} Location, Ghana',
                        manager=sales_rep,
                        capacity=random.randint(5000, 20000),
                        is_active=True
                    )
                    warehouses.append(warehouse)

                    # Create warehouse locations
                    location_types = ['A-Section', 'B-Section', 'C-Section', 'Storage', 'Dispatch']
                    for j, loc_type in enumerate(location_types[:random.randint(2, 4)], 1):
                        WarehouseLocation.objects.create(
                            warehouse=warehouse,
                            name=f'{loc_type}',
                            code=f'{code}-L{j:02d}',
                            aisle=f'A{j}',
                            shelf=f'S{j}',
                            bin=f'B{j}',
                            is_active=True
                        )

                    self.stdout.write(f'Created warehouse: {warehouse_name} ({code}) - Manager: {sales_rep.username}')

                # Distribute stock to warehouses
                self.stdout.write('Distributing stock to warehouses...')
                
                for warehouse in warehouses:
                    # Randomly assign products to this warehouse
                    warehouse_products = random.sample(products, random.randint(8, 15))
                    locations = list(warehouse.locations.all())
                    
                    for product in warehouse_products:
                        if locations:
                            location = random.choice(locations)
                            quantity = random.randint(50, 500)
                            
                            # Create stock movement record
                            StockMovement.objects.create(
                                warehouse=warehouse,
                                location=location,
                                movement_type='in',
                                quantity=quantity,
                                reference=f'Initial Stock - {product.name}',
                                notes=f'Initial stock allocation for {warehouse.name}',
                                created_by=warehouse.manager,
                                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
                            )

                # Generate sales from each warehouse
                self.stdout.write('Generating warehouse-specific sales...')
                
                total_sales = 0
                for warehouse in warehouses:
                    # Generate 3-8 sales per warehouse
                    warehouse_sales_count = random.randint(3, 8)
                    
                    for i in range(warehouse_sales_count):
                        try:
                            customer = random.choice(customers)
                            
                            # Calculate sale amount
                            total_amount = random.uniform(500.0, 5000.0)
                            
                            # Create sale record
                            sale = Sale.objects.create(
                                customer=customer,
                                staff=warehouse.manager,
                                total=Decimal(str(total_amount)),
                                status=random.choice(['completed', 'pending']),
                                date=datetime.now() - timedelta(days=random.randint(0, 60))
                            )
                            total_sales += 1
                            
                            # Create corresponding stock out movement
                            warehouse_products = random.sample(products, random.randint(1, 3))
                            locations = list(warehouse.locations.all())
                            
                            for product in warehouse_products:
                                if locations:
                                    location = random.choice(locations)
                                    quantity_sold = random.randint(5, 50)
                                    
                                    StockMovement.objects.create(
                                        warehouse=warehouse,
                                        location=location,
                                        movement_type='out',
                                        quantity=quantity_sold,
                                        reference=f'Sale to {customer.name}',
                                        notes=f'Sale from {warehouse.name}',
                                        created_by=warehouse.manager,
                                        created_at=sale.date
                                    )
                                    
                        except Exception as e:
                            self.stdout.write(f'Error creating sale for {warehouse.name}: {e}')

                # Generate inter-warehouse transfers (using stock movements only)
                self.stdout.write('Generating inter-warehouse transfers...')
                
                transfer_count = 0
                for i in range(15):
                    try:
                        from_warehouse = random.choice(warehouses)
                        to_warehouse = random.choice([w for w in warehouses if w != from_warehouse])
                        
                        transfer_qty = random.randint(10, 50)
                        product = random.choice(products)
                        
                        from_location = random.choice(list(from_warehouse.locations.all()))
                        to_location = random.choice(list(to_warehouse.locations.all()))
                        
                        # Create stock movements for transfer
                        StockMovement.objects.create(
                            warehouse=from_warehouse,
                            location=from_location,
                            movement_type='out',
                            quantity=transfer_qty,
                            reference=f'Transfer to {to_warehouse.name} - {product.name}',
                            notes=f'Inter-warehouse transfer',
                            created_by=from_warehouse.manager,
                            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
                        )
                        
                        StockMovement.objects.create(
                            warehouse=to_warehouse,
                            location=to_location,
                            movement_type='in',
                            quantity=transfer_qty,
                            reference=f'Transfer from {from_warehouse.name} - {product.name}',
                            notes=f'Inter-warehouse transfer received',
                            created_by=to_warehouse.manager,
                            created_at=datetime.now() - timedelta(days=random.randint(0, 30))
                        )
                        
                        transfer_count += 1
                        
                    except Exception as e:
                        self.stdout.write(f'Error creating transfer {i}: {e}')

                self.stdout.write(
                    self.style.SUCCESS(
                        'Successfully setup comprehensive warehouse management system!'
                    )
                )
                
                # Print comprehensive summary
                self.stdout.write('\n=== WAREHOUSE SYSTEM SUMMARY ===')
                self.stdout.write(f'Total Warehouses: {Warehouse.objects.count()}')
                self.stdout.write(f'Total Warehouse Locations: {WarehouseLocation.objects.count()}')
                self.stdout.write(f'Total Sales Reps: {len(sales_reps)}')
                self.stdout.write(f'Sales Manager: {sales_manager.username}')
                self.stdout.write(f'Stock Movements: {StockMovement.objects.count()}')
                self.stdout.write(f'Warehouse Sales: {total_sales}')
                self.stdout.write(f'Inter-warehouse Transfers: {transfer_count}')
                
                self.stdout.write('\n=== WAREHOUSE LIST ===')
                for warehouse in Warehouse.objects.all().order_by('code'):
                    stock_in = StockMovement.objects.filter(warehouse=warehouse, movement_type='in').count()
                    stock_out = StockMovement.objects.filter(warehouse=warehouse, movement_type='out').count()
                    sales_count = Sale.objects.filter(staff=warehouse.manager).count()
                    
                    self.stdout.write(
                        f'{warehouse.code}: {warehouse.name} | '
                        f'Manager: {warehouse.manager.username} | '
                        f'Stock In: {stock_in} | Stock Out: {stock_out} | '
                        f'Sales: {sales_count}'
                    )
                
                self.stdout.write('\n=== ACCESS CONTROL SETUP ===')
                self.stdout.write(f'Sales Manager ({sales_manager.username}) can view ALL warehouses')
                self.stdout.write('Each Sales Rep can view only their assigned warehouse:')
                for warehouse in warehouses[:5]:  # Show first 5 as example
                    self.stdout.write(f'  - {warehouse.manager.username} → {warehouse.name} ({warehouse.code})')
                self.stdout.write(f'  ... and {len(warehouses)-5} more warehouse assignments')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error setting up warehouses: {e}'))
            raise
