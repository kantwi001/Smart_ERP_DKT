#!/usr/bin/env python
"""
ERP System Data Seeding Script
Populates the database with sample data for all modules
"""

import os
import sys
import django
from datetime import date, datetime, timedelta
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Import Django User model
from django.contrib.auth import get_user_model

# Import all models with correct names
from hr.models import Department, Employee
from inventory.models import Category, Product
from sales.models import Customer
from warehouse.models import Warehouse, WarehouseLocation

User = get_user_model()

def create_users():
    """Create sample users"""
    print("Creating users...")
    
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@erp.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.username}")
    else:
        print(f"✅ Admin user already exists: {admin_user.username}")

    # Create sample employees
    sample_users = [
        {'username': 'john.doe', 'email': 'john.doe@erp.com', 'first_name': 'John', 'last_name': 'Doe'},
        {'username': 'jane.smith', 'email': 'jane.smith@erp.com', 'first_name': 'Jane', 'last_name': 'Smith'},
        {'username': 'mike.wilson', 'email': 'mike.wilson@erp.com', 'first_name': 'Mike', 'last_name': 'Wilson'},
        {'username': 'sarah.jones', 'email': 'sarah.jones@erp.com', 'first_name': 'Sarah', 'last_name': 'Jones'},
    ]
    
    for user_data in sample_users:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults=user_data
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"✅ Created user: {user.username}")
        else:
            print(f"✅ User already exists: {user.username}")

def create_departments():
    """Create sample departments"""
    print("Creating departments...")
    
    departments = [
        'SALES',
        'HR', 
        'FINANCE',
        'OPERATIONS',
        'CD',
        'LOGISTICS/PROCUREMENT/SUPPLY CHAIN'
    ]
    
    for dept_name in departments:
        dept, created = Department.objects.get_or_create(name=dept_name)
        if created:
            print(f"✅ Created department: {dept.get_name_display()}")
        else:
            print(f"✅ Department already exists: {dept.get_name_display()}")

def create_employees():
    """Create sample employees"""
    print("Creating employees...")
    
    # Get users and departments
    users = User.objects.filter(username__in=['john.doe', 'jane.smith', 'mike.wilson', 'sarah.jones'])
    departments = Department.objects.all()
    
    employee_data = [
        {'username': 'john.doe', 'position': 'Sales Manager', 'department': 'SALES', 'salary': 5000.00},
        {'username': 'jane.smith', 'position': 'HR Specialist', 'department': 'HR', 'salary': 4500.00},
        {'username': 'mike.wilson', 'position': 'Operations Coordinator', 'department': 'OPERATIONS', 'salary': 4000.00},
        {'username': 'sarah.jones', 'position': 'Finance Analyst', 'department': 'FINANCE', 'salary': 4200.00},
    ]
    
    for emp_data in employee_data:
        try:
            user = User.objects.get(username=emp_data['username'])
            department = Department.objects.get(name=emp_data['department'])
            
            employee, created = Employee.objects.get_or_create(
                user=user,
                defaults={
                    'position': emp_data['position'],
                    'department': department,
                    'hire_date': date.today() - timedelta(days=365),
                    'salary': Decimal(str(emp_data['salary'])),
                    'is_active': True
                }
            )
            if created:
                print(f"✅ Created employee: {user.get_full_name()}")
            else:
                print(f"✅ Employee already exists: {user.get_full_name()}")
        except Exception as e:
            print(f"❌ Error creating employee for {emp_data['username']}: {e}")

def create_product_categories():
    """Create sample product categories"""
    print("Creating product categories...")
    
    categories = [
        {'name': 'Electronics', 'description': 'Electronic devices and components'},
        {'name': 'Furniture', 'description': 'Office and home furniture'},
        {'name': 'Supplies', 'description': 'Office and general supplies'},
        {'name': 'Equipment', 'description': 'Heavy equipment and machinery'},
        {'name': 'Software', 'description': 'Software licenses and applications'},
    ]
    
    for cat_data in categories:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        if created:
            print(f"✅ Created category: {category.name}")
        else:
            print(f"✅ Category already exists: {category.name}")

def create_products():
    """Create sample products"""
    print("Creating products...")
    
    # Get categories
    electronics = Category.objects.get(name='Electronics')
    furniture = Category.objects.get(name='Furniture')
    supplies = Category.objects.get(name='Supplies')
    equipment = Category.objects.get(name='Equipment')
    software = Category.objects.get(name='Software')
    
    products = [
        {'name': 'Laptop Computer', 'category': electronics, 'sku': 'ELEC-001', 'quantity': 25, 'description': 'High-performance business laptop'},
        {'name': 'Office Chair', 'category': furniture, 'sku': 'FURN-001', 'quantity': 50, 'description': 'Ergonomic office chair'},
        {'name': 'Printer Paper', 'category': supplies, 'sku': 'SUPP-001', 'quantity': 200, 'description': 'A4 white printer paper'},
        {'name': 'Conference Table', 'category': furniture, 'sku': 'FURN-002', 'quantity': 10, 'description': '12-person conference table'},
        {'name': 'Network Router', 'category': electronics, 'sku': 'ELEC-002', 'quantity': 15, 'description': 'Enterprise network router'},
        {'name': 'Forklift', 'category': equipment, 'sku': 'EQUIP-001', 'quantity': 3, 'description': 'Electric forklift'},
        {'name': 'Office Suite License', 'category': software, 'sku': 'SOFT-001', 'quantity': 100, 'description': 'Annual office software license'},
        {'name': 'Desk Lamp', 'category': furniture, 'sku': 'FURN-003', 'quantity': 30, 'description': 'LED desk lamp'},
        {'name': 'Wireless Mouse', 'category': electronics, 'sku': 'ELEC-003', 'quantity': 75, 'description': 'Wireless optical mouse'},
        {'name': 'Filing Cabinet', 'category': furniture, 'sku': 'FURN-004', 'quantity': 20, 'description': '4-drawer filing cabinet'},
    ]
    
    for prod_data in products:
        product, created = Product.objects.get_or_create(
            sku=prod_data['sku'],
            defaults={
                'name': prod_data['name'],
                'category': prod_data['category'],
                'quantity': prod_data['quantity'],
                'description': prod_data['description']
            }
        )
        if created:
            print(f"✅ Created product: {product.name}")
        else:
            print(f"✅ Product already exists: {product.name}")

def create_customers():
    """Create sample customers"""
    print("Creating customers...")
    
    customers = [
        {'name': 'Acme Corporation', 'email': 'contact@acme.com', 'phone': '+1-555-0101', 'address': '123 Business St', 'customer_type': 'wholesaler'},
        {'name': 'TechStart Inc', 'email': 'info@techstart.com', 'phone': '+1-555-0102', 'address': '456 Innovation Ave', 'customer_type': 'retailer'},
        {'name': 'Global Supplies Ltd', 'email': 'orders@globalsupplies.com', 'phone': '+1-555-0103', 'address': '789 Commerce Blvd', 'customer_type': 'distributor'},
        {'name': 'Local Office Solutions', 'email': 'sales@localoffice.com', 'phone': '+1-555-0104', 'address': '321 Main Street', 'customer_type': 'retailer'},
        {'name': 'Enterprise Systems Co', 'email': 'procurement@enterprise.com', 'phone': '+1-555-0105', 'address': '654 Corporate Dr', 'customer_type': 'wholesaler'},
        {'name': 'Small Business Hub', 'email': 'contact@smallbiz.com', 'phone': '+1-555-0106', 'address': '987 Startup Lane', 'customer_type': 'retailer'},
        {'name': 'Industrial Partners', 'email': 'info@industrial.com', 'phone': '+1-555-0107', 'address': '147 Factory Rd', 'customer_type': 'distributor'},
        {'name': 'Retail Chain Plus', 'email': 'buyers@retailchain.com', 'phone': '+1-555-0108', 'address': '258 Shopping Center', 'customer_type': 'wholesaler'},
    ]
    
    for cust_data in customers:
        customer, created = Customer.objects.get_or_create(
            email=cust_data['email'],
            defaults={
                'name': cust_data['name'],
                'phone': cust_data['phone'],
                'address': cust_data['address'],
                'customer_type': cust_data['customer_type'],
                'payment_terms': 30
            }
        )
        if created:
            print(f"✅ Created customer: {customer.name}")
        else:
            print(f"✅ Customer already exists: {customer.name}")

def create_warehouses():
    """Create sample warehouses"""
    print("Creating warehouse locations...")
    
    warehouses = [
        {'name': 'Main Warehouse', 'code': 'MAIN', 'address': '100 Warehouse District', 'capacity': 10000},
        {'name': 'North Distribution Center', 'code': 'NORTH', 'address': '200 North Industrial Park', 'capacity': 8000},
        {'name': 'South Storage Facility', 'code': 'SOUTH', 'address': '300 South Commerce Zone', 'capacity': 6000},
        {'name': 'East Regional Hub', 'code': 'EAST', 'address': '400 East Logistics Center', 'capacity': 7000},
        {'name': 'West Depot', 'code': 'WEST', 'address': '500 West Distribution Point', 'capacity': 5000},
    ]
    
    for warehouse_data in warehouses:
        warehouse, created = Warehouse.objects.get_or_create(
            code=warehouse_data['code'],
            defaults={
                'name': warehouse_data['name'],
                'address': warehouse_data['address'],
                'capacity': warehouse_data['capacity'],
                'is_active': True
            }
        )
        if created:
            print(f"✅ Created warehouse location: {warehouse.name}")
        else:
            print(f"✅ Warehouse location already exists: {warehouse.name}")

def main():
    """Main seeding function"""
    print("🌱 Starting ERP System Data Seeding...")
    print("=" * 50)
    
    try:
        create_users()
        create_departments()
        create_employees()
        create_product_categories()
        create_products()
        create_customers()
        create_warehouses()
        
        print("=" * 50)
        print("🎉 Data seeding completed successfully!")
        print()
        print("Summary:")
        print(f"- Users: {User.objects.count()}")
        print(f"- Departments: {Department.objects.count()}")
        print(f"- Employees: {Employee.objects.count()}")
        print(f"- Product Categories: {Category.objects.count()}")
        print(f"- Products: {Product.objects.count()}")
        print(f"- Customers: {Customer.objects.count()}")
        print(f"- Warehouse Locations: {Warehouse.objects.count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
