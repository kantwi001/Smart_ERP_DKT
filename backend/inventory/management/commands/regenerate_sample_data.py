from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from inventory.models import Product, Category, ProductPrice, InventoryTransfer
from sales.models import Sale, Customer
from accounting.models import Transaction as AccountingTransaction, Account
from procurement.models import ProcurementRequest
from manufacturing.models import WorkOrder
from hr.models import Employee, Department
from datetime import datetime, timedelta
from decimal import Decimal
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Delete all sample data and regenerate based on new products'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm that you want to delete all existing sample data',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete ALL existing sample data. Run with --confirm to proceed.'
                )
            )
            return

        with transaction.atomic():
            self.stdout.write('Clearing all existing sample data...')
            
            # Clear all sample data (keep users and products)
            try:
                WorkOrder.objects.all().delete()
            except:
                pass
            try:
                ProcurementRequest.objects.all().delete()
            except:
                pass
            try:
                AccountingTransaction.objects.all().delete()
            except:
                pass
            try:
                Sale.objects.all().delete()
            except:
                pass
            try:
                InventoryTransfer.objects.all().delete()
            except:
                pass
            
            # Clear customers (will recreate)
            try:
                Customer.objects.all().delete()
            except:
                pass
            
            # Clear employees and departments (will recreate)
            try:
                Employee.objects.all().delete()
            except:
                pass
            try:
                Department.objects.all().delete()
            except:
                pass
            
            # Clear accounts (will recreate)
            try:
                Account.objects.all().delete()
            except:
                pass

            self.stdout.write('Generating new sample data based on healthcare products...')
            
            # Get all products
            products = list(Product.objects.all())
            if not products:
                self.stdout.write(self.style.ERROR('No products found! Please run replace_products first.'))
                return

            # Create healthcare-focused customers
            healthcare_customers = [
                'Korle-Bu Teaching Hospital',
                'Ridge Hospital',
                'Tema General Hospital',
                'Kumasi South Hospital',
                'Cape Coast Teaching Hospital',
                'Tamale Teaching Hospital',
                'Ho Municipal Hospital',
                'Sunyani Regional Hospital',
                'Planned Parenthood Ghana',
                'Marie Stopes Ghana',
                'Family Health International',
                'Ghana Health Service',
                'USAID Ghana Health',
                'World Health Organization Ghana',
                'UNFPA Ghana Office'
            ]
            
            customers = []
            for i, name in enumerate(healthcare_customers, 1):
                try:
                    customer = Customer.objects.create(
                        name=name,
                        email=f'procurement{i}@{name.lower().replace(" ", "").replace("-", "")}.org',
                        phone=f'+233{random.randint(200000000, 299999999)}' if hasattr(Customer, 'phone') else None,
                        address=f'{random.choice(["Accra", "Kumasi", "Tamale", "Cape Coast", "Ho"])}, Ghana' if hasattr(Customer, 'address') else None
                    )
                    customers.append(customer)
                    self.stdout.write(f'Created customer: {name}')
                except Exception as e:
                    # Try with minimal fields
                    customer = Customer.objects.create(
                        name=name,
                        email=f'procurement{i}@{name.lower().replace(" ", "").replace("-", "")}.org'
                    )
                    customers.append(customer)
                    self.stdout.write(f'Created customer: {name} (minimal fields)')

            # Create healthcare suppliers
            healthcare_suppliers = [
                'Danadams Pharmaceutical Ltd',
                'Kinapharma Ltd',
                'Phyto-Riker (GIHOC) Ltd',
                'Ayrton Drug Manufacturing Ltd',
                'LaGray Chemical Company Ltd',
                'Starwin Products Ltd',
                'Tobinco Pharmaceuticals Ltd',
                'Entrance Pharmaceuticals Ltd',
                'Dannex Ayrton Starwin Ltd',
                'Kama Industries Ltd'
            ]
            
            suppliers = []
            for i, name in enumerate(healthcare_suppliers, 1):
                supplier = Supplier.objects.create(
                    name=name,
                    email=f'sales@{name.lower().replace(" ", "").replace("(", "").replace(")", "")}.com',
                    phone=f'+233{random.randint(300000000, 399999999)}',
                    address=f'{random.choice(["Tema", "Accra", "Kumasi"])}, Ghana',
                    contact_person=f'{random.choice(["Mr.", "Mrs.", "Dr."])} {random.choice(["Kwame", "Ama", "Kofi", "Akosua", "Yaw", "Efua"])} {random.choice(["Asante", "Osei", "Mensah", "Boateng", "Adjei"])}'
                )
                suppliers.append(supplier)
                self.stdout.write(f'Created supplier: {name}')

            # Create departments
            departments = [
                'Procurement',
                'Sales & Distribution',
                'Quality Assurance',
                'Warehouse & Logistics',
                'Finance & Accounting',
                'Human Resources',
                'Regulatory Affairs',
                'Customer Service'
            ]
            
            dept_objects = []
            for dept_name in departments:
                dept = Department.objects.create(
                    name=dept_name,
                    description=f'{dept_name} department for healthcare products distribution'
                )
                dept_objects.append(dept)

            # Create employees
            employee_names = [
                ('Dr. Kwame Asante', 'Procurement Manager'),
                ('Mrs. Ama Osei', 'Sales Director'),
                ('Mr. Kofi Mensah', 'QA Specialist'),
                ('Ms. Akosua Boateng', 'Warehouse Supervisor'),
                ('Mr. Yaw Adjei', 'Finance Manager'),
                ('Mrs. Efua Darko', 'HR Manager'),
                ('Dr. Kwaku Owusu', 'Regulatory Officer'),
                ('Ms. Abena Sarpong', 'Customer Service Lead')
            ]
            
            employees = []
            for i, (name, position) in enumerate(employee_names):
                employee = Employee.objects.create(
                    user=User.objects.create_user(
                        username=f'employee{i+1}',
                        email=f'{name.lower().replace(" ", ".").replace(".", "")}@company.com',
                        first_name=name.split()[1],
                        last_name=name.split()[-1]
                    ),
                    employee_id=f'EMP{i+1:03d}',
                    department=dept_objects[i % len(dept_objects)],
                    position=position,
                    salary=Decimal(str(random.randint(3000, 8000))),
                    hire_date=datetime.now().date() - timedelta(days=random.randint(30, 1000))
                )
                employees.append(employee)

            # Create accounts
            accounts_data = [
                ('Cash', 'Asset', 50000),
                ('Bank - GCB', 'Asset', 150000),
                ('Bank - Ecobank', 'Asset', 75000),
                ('Accounts Receivable', 'Asset', 25000),
                ('Inventory', 'Asset', 200000),
                ('Accounts Payable', 'Liability', 30000),
                ('Sales Revenue', 'Revenue', 0),
                ('Cost of Goods Sold', 'Expense', 0),
                ('Operating Expenses', 'Expense', 0)
            ]
            
            accounts = []
            for name, acc_type, balance in accounts_data:
                account = Account.objects.create(
                    name=name,
                    type=acc_type,
                    balance=Decimal(str(balance))
                )
                accounts.append(account)

            # Generate sales data
            self.stdout.write('Generating sales transactions...')
            for i in range(50):
                customer = random.choice(customers)
                selected_products = random.sample(products, random.randint(1, 5))
                
                total_amount = 0
                for product in selected_products:
                    price = product.prices.filter(currency='GHS').first()
                    if price:
                        quantity = random.randint(10, 100)
                        total_amount += float(price.price) * quantity

                sale = Sale.objects.create(
                    customer=customer,
                    staff=random.choice(employees).user,
                    total=Decimal(str(total_amount)),
                    status=random.choice(['completed', 'pending', 'cancelled']),
                    date=datetime.now() - timedelta(days=random.randint(0, 90))
                )

            # Generate POS transactions
            self.stdout.write('Generating POS transactions...')
            for i in range(30):
                selected_products = random.sample(products, random.randint(1, 3))
                
                pos_transaction = POSTransaction.objects.create(
                    transaction_id=f'POS{i+1:04d}',
                    cashier=random.choice(employees).user,
                    total_amount=Decimal('0'),
                    payment_method=random.choice(['cash', 'card', 'mobile_money']),
                    created_at=datetime.now() - timedelta(days=random.randint(0, 30))
                )
                
                total = 0
                for product in selected_products:
                    price = product.prices.filter(currency='GHS').first()
                    if price:
                        quantity = random.randint(1, 10)
                        item_total = float(price.price) * quantity
                        total += item_total
                        
                        POSItem.objects.create(
                            transaction=pos_transaction,
                            product=product,
                            quantity=quantity,
                            unit_price=price.price,
                            total_price=Decimal(str(item_total))
                        )
                
                pos_transaction.total_amount = Decimal(str(total))
                pos_transaction.save()

            # Generate procurement requests
            self.stdout.write('Generating procurement requests...')
            for i in range(20):
                product = random.choice(products)
                supplier = random.choice(suppliers)
                
                ProcurementRequest.objects.create(
                    product=product,
                    supplier=supplier,
                    quantity=random.randint(100, 1000),
                    unit_price=product.prices.filter(currency='GHS').first().price if product.prices.filter(currency='GHS').exists() else Decimal('10.00'),
                    status=random.choice(['pending', 'approved', 'ordered', 'received']),
                    requested_by=random.choice(employees).user,
                    created_at=datetime.now() - timedelta(days=random.randint(0, 60))
                )

            # Generate inventory transfers
            self.stdout.write('Generating inventory transfers...')
            locations = ['Main Warehouse', 'Accra Branch', 'Kumasi Branch', 'Tamale Branch', 'Cape Coast Branch']
            
            for i in range(25):
                product = random.choice(products)
                from_location = random.choice(locations)
                to_location = random.choice([loc for loc in locations if loc != from_location])
                
                InventoryTransfer.objects.create(
                    product=product,
                    quantity=random.randint(10, 100),
                    from_location=from_location,
                    to_location=to_location,
                    requested_by=random.choice(employees).user,
                    status=random.choice(['pending', 'approved', 'in_transit', 'completed']),
                    created_at=datetime.now() - timedelta(days=random.randint(0, 45))
                )

            # Generate accounting transactions
            self.stdout.write('Generating accounting transactions...')
            for i in range(40):
                account = random.choice(accounts)
                amount = Decimal(str(random.randint(100, 5000)))
                
                AccountingTransaction.objects.create(
                    account=account,
                    amount=amount,
                    description=f'Healthcare product transaction #{i+1}',
                    transaction_type=random.choice(['debit', 'credit']),
                    date=datetime.now() - timedelta(days=random.randint(0, 60))
                )

            # Generate production orders for relevant products
            self.stdout.write('Generating production orders...')
            manufacturing_products = [p for p in products if 'fiesta' in p.name.lower() or 'kiss' in p.name.lower()]
            
            for i in range(15):
                if manufacturing_products:
                    product = random.choice(manufacturing_products)
                    
                    production_order = ProductionOrder.objects.create(
                        product=product,
                        quantity=random.randint(500, 2000),
                        status=random.choice(['planned', 'in_progress', 'completed', 'cancelled']),
                        start_date=datetime.now().date() - timedelta(days=random.randint(0, 30)),
                        end_date=datetime.now().date() + timedelta(days=random.randint(1, 60)),
                        created_by=random.choice(employees).user
                    )
                    
                    # Create work orders for production
                    work_order_types = ['Mixing', 'Packaging', 'Quality Check', 'Labeling', 'Boxing']
                    for j, work_type in enumerate(work_order_types[:random.randint(2, 4)]):
                        WorkOrder.objects.create(
                            production_order=production_order,
                            operation=work_type,
                            status=random.choice(['pending', 'in_progress', 'completed']),
                            assigned_to=random.choice(employees).user,
                            estimated_hours=random.randint(2, 8),
                            actual_hours=random.randint(1, 10) if random.choice([True, False]) else None
                        )

            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully regenerated all sample data based on healthcare products!'
                )
            )
            
            # Print comprehensive summary
            self.stdout.write('\n=== COMPREHENSIVE SUMMARY ===')
            self.stdout.write(f'Products: {Product.objects.count()}')
            self.stdout.write(f'Customers: {Customer.objects.count()}')
            self.stdout.write(f'Suppliers: {Supplier.objects.count()}')
            self.stdout.write(f'Employees: {Employee.objects.count()}')
            self.stdout.write(f'Departments: {Department.objects.count()}')
            self.stdout.write(f'Sales: {Sale.objects.count()}')
            self.stdout.write(f'POS Transactions: {POSTransaction.objects.count()}')
            self.stdout.write(f'POS Items: {POSItem.objects.count()}')
            self.stdout.write(f'Procurement Requests: {ProcurementRequest.objects.count()}')
            self.stdout.write(f'Inventory Transfers: {InventoryTransfer.objects.count()}')
            self.stdout.write(f'Accounting Transactions: {AccountingTransaction.objects.count()}')
            self.stdout.write(f'Production Orders: {ProductionOrder.objects.count()}')
            self.stdout.write(f'Work Orders: {WorkOrder.objects.count()}')
            self.stdout.write(f'Accounts: {Account.objects.count()}')
