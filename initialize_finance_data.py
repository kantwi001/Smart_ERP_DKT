#!/usr/bin/env python3
"""
Finance Module Data Initialization Script
Creates comprehensive sample data for all finance modules including:
- Currencies
- Chart of Accounts
- Journal Entries
- Budgets
- Fixed Assets
- Expense Categories & Reports
- Recurring Transactions
"""

import os
import sys
import django
from decimal import Decimal
from datetime import datetime, date, timedelta
import random

# Setup Django environment
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounting.models import (
    Currency, ChartOfAccounts, JournalEntry, JournalBatch, Budget, BudgetLine,
    FixedAsset, ExpenseCategory, ExpenseReport, ExpenseItem, RecurringTransaction
)
from hr.models import Department

User = get_user_model()

def create_currencies():
    """Create multi-currency support"""
    print("Creating currencies...")
    
    currencies_data = [
        {'code': 'USD', 'name': 'US Dollar', 'symbol': '$', 'exchange_rate': Decimal('1.0000'), 'is_base_currency': True},
        {'code': 'SLL', 'name': 'Sierra Leonean Leone', 'symbol': 'Le', 'exchange_rate': Decimal('20000.0000')},
        {'code': 'GHS', 'name': 'Ghanaian Cedi', 'symbol': '₵', 'exchange_rate': Decimal('12.5000')},
        {'code': 'LRD', 'name': 'Liberian Dollar', 'symbol': 'L$', 'exchange_rate': Decimal('190.0000')},
        {'code': 'EUR', 'name': 'Euro', 'symbol': '€', 'exchange_rate': Decimal('0.9200')},
        {'code': 'GBP', 'name': 'British Pound', 'symbol': '£', 'exchange_rate': Decimal('0.8100')},
    ]
    
    for curr_data in currencies_data:
        currency, created = Currency.objects.get_or_create(
            code=curr_data['code'],
            defaults=curr_data
        )
        if created:
            print(f"✓ Created currency: {currency.code} - {currency.name}")

def create_chart_of_accounts():
    """Create comprehensive chart of accounts"""
    print("Creating chart of accounts...")
    
    # Get base currency
    base_currency = Currency.objects.get(is_base_currency=True)
    admin_user = User.objects.filter(is_superuser=True).first()
    
    accounts_data = [
        # ASSETS
        {'code': '1000', 'name': 'Cash and Cash Equivalents', 'type': 'ASSET', 'subtype': 'CASH'},
        {'code': '1010', 'name': 'Petty Cash', 'type': 'ASSET', 'subtype': 'CASH'},
        {'code': '1020', 'name': 'Bank Account - USD', 'type': 'ASSET', 'subtype': 'CASH'},
        {'code': '1021', 'name': 'Bank Account - SLL', 'type': 'ASSET', 'subtype': 'CASH'},
        {'code': '1100', 'name': 'Accounts Receivable', 'type': 'ASSET', 'subtype': 'ACCOUNTS_RECEIVABLE'},
        {'code': '1200', 'name': 'Inventory', 'type': 'ASSET', 'subtype': 'INVENTORY'},
        {'code': '1300', 'name': 'Prepaid Expenses', 'type': 'ASSET', 'subtype': 'CURRENT_ASSET'},
        {'code': '1400', 'name': 'Office Equipment', 'type': 'ASSET', 'subtype': 'FIXED_ASSET'},
        {'code': '1410', 'name': 'Computer Equipment', 'type': 'ASSET', 'subtype': 'FIXED_ASSET'},
        {'code': '1420', 'name': 'Vehicles', 'type': 'ASSET', 'subtype': 'FIXED_ASSET'},
        {'code': '1500', 'name': 'Accumulated Depreciation - Equipment', 'type': 'ASSET', 'subtype': 'FIXED_ASSET'},
        
        # LIABILITIES
        {'code': '2000', 'name': 'Accounts Payable', 'type': 'LIABILITY', 'subtype': 'ACCOUNTS_PAYABLE'},
        {'code': '2100', 'name': 'Accrued Expenses', 'type': 'LIABILITY', 'subtype': 'CURRENT_LIABILITY'},
        {'code': '2200', 'name': 'Payroll Liabilities', 'type': 'LIABILITY', 'subtype': 'CURRENT_LIABILITY'},
        {'code': '2300', 'name': 'Tax Payable', 'type': 'LIABILITY', 'subtype': 'CURRENT_LIABILITY'},
        {'code': '2400', 'name': 'Long-term Debt', 'type': 'LIABILITY', 'subtype': 'LONG_TERM_LIABILITY'},
        
        # EQUITY
        {'code': '3000', 'name': 'Owner\'s Capital', 'type': 'EQUITY', 'subtype': 'CAPITAL'},
        {'code': '3100', 'name': 'Retained Earnings', 'type': 'EQUITY', 'subtype': 'RETAINED_EARNINGS'},
        
        # REVENUE
        {'code': '4000', 'name': 'Sales Revenue', 'type': 'REVENUE', 'subtype': 'OPERATING_REVENUE'},
        {'code': '4100', 'name': 'Service Revenue', 'type': 'REVENUE', 'subtype': 'OPERATING_REVENUE'},
        {'code': '4200', 'name': 'Other Revenue', 'type': 'REVENUE', 'subtype': 'OTHER_REVENUE'},
        {'code': '4300', 'name': 'Interest Income', 'type': 'REVENUE', 'subtype': 'OTHER_REVENUE'},
        
        # EXPENSES
        {'code': '5000', 'name': 'Cost of Goods Sold', 'type': 'COST_OF_GOODS_SOLD', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6000', 'name': 'Salaries and Wages', 'type': 'EXPENSE', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6100', 'name': 'Employee Benefits', 'type': 'EXPENSE', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6200', 'name': 'Rent Expense', 'type': 'EXPENSE', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6300', 'name': 'Utilities', 'type': 'EXPENSE', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6400', 'name': 'Office Supplies', 'type': 'EXPENSE', 'subtype': 'ADMINISTRATIVE_EXPENSE'},
        {'code': '6500', 'name': 'Marketing and Advertising', 'type': 'EXPENSE', 'subtype': 'SELLING_EXPENSE'},
        {'code': '6600', 'name': 'Travel and Entertainment', 'type': 'EXPENSE', 'subtype': 'ADMINISTRATIVE_EXPENSE'},
        {'code': '6700', 'name': 'Professional Services', 'type': 'EXPENSE', 'subtype': 'ADMINISTRATIVE_EXPENSE'},
        {'code': '6800', 'name': 'Depreciation Expense', 'type': 'EXPENSE', 'subtype': 'OPERATING_EXPENSE'},
        {'code': '6900', 'name': 'Interest Expense', 'type': 'EXPENSE', 'subtype': 'FINANCIAL_EXPENSE'},
    ]
    
    for acc_data in accounts_data:
        account, created = ChartOfAccounts.objects.get_or_create(
            account_code=acc_data['code'],
            defaults={
                'account_name': acc_data['name'],
                'account_type': acc_data['type'],
                'account_subtype': acc_data['subtype'],
                'currency': base_currency,
                'created_by': admin_user,
                'is_active': True,
                'allow_manual_entries': True
            }
        )
        if created:
            print(f"✓ Created account: {account.account_code} - {account.account_name}")

def create_journal_entries():
    """Create sample journal entries"""
    print("Creating journal entries...")
    
    admin_user = User.objects.filter(is_superuser=True).first()
    base_currency = Currency.objects.get(is_base_currency=True)
    
    # Get some accounts
    cash_account = ChartOfAccounts.objects.get(account_code='1000')
    sales_account = ChartOfAccounts.objects.get(account_code='4000')
    ar_account = ChartOfAccounts.objects.get(account_code='1100')
    expense_account = ChartOfAccounts.objects.get(account_code='6000')
    ap_account = ChartOfAccounts.objects.get(account_code='2000')
    
    # Create journal batches with entries
    journal_entries = [
        {
            'description': 'Initial Cash Investment',
            'date': date.today() - timedelta(days=30),
            'entries': [
                {'account': cash_account, 'type': 'DEBIT', 'amount': Decimal('50000.00')},
                {'account': ChartOfAccounts.objects.get(account_code='3000'), 'type': 'CREDIT', 'amount': Decimal('50000.00')},
            ]
        },
        {
            'description': 'Sales Revenue - Cash',
            'date': date.today() - timedelta(days=25),
            'entries': [
                {'account': cash_account, 'type': 'DEBIT', 'amount': Decimal('15000.00')},
                {'account': sales_account, 'type': 'CREDIT', 'amount': Decimal('15000.00')},
            ]
        },
        {
            'description': 'Sales Revenue - Credit',
            'date': date.today() - timedelta(days=20),
            'entries': [
                {'account': ar_account, 'type': 'DEBIT', 'amount': Decimal('25000.00')},
                {'account': sales_account, 'type': 'CREDIT', 'amount': Decimal('25000.00')},
            ]
        },
        {
            'description': 'Salary Payment',
            'date': date.today() - timedelta(days=15),
            'entries': [
                {'account': expense_account, 'type': 'DEBIT', 'amount': Decimal('8000.00')},
                {'account': cash_account, 'type': 'CREDIT', 'amount': Decimal('8000.00')},
            ]
        },
        {
            'description': 'Office Supplies Purchase',
            'date': date.today() - timedelta(days=10),
            'entries': [
                {'account': ChartOfAccounts.objects.get(account_code='6400'), 'type': 'DEBIT', 'amount': Decimal('1200.00')},
                {'account': ap_account, 'type': 'CREDIT', 'amount': Decimal('1200.00')},
            ]
        }
    ]
    
    for batch_data in journal_entries:
        # Create batch
        batch = JournalBatch.objects.create(
            batch_number=f"JB-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            description=batch_data['description'],
            transaction_date=batch_data['date'],
            status='POSTED',
            created_by=admin_user,
            posted_by=admin_user,
            posted_at=datetime.now()
        )
        
        total_debits = Decimal('0.00')
        total_credits = Decimal('0.00')
        
        # Create entries
        for entry_data in batch_data['entries']:
            entry = JournalEntry.objects.create(
                transaction_date=batch_data['date'],
                account=entry_data['account'],
                entry_type=entry_data['type'],
                amount=entry_data['amount'],
                currency=base_currency,
                base_amount=entry_data['amount'],
                description=batch_data['description'],
                source_type='MANUAL',
                journal_batch=batch,
                created_by=admin_user
            )
            
            if entry_data['type'] == 'DEBIT':
                total_debits += entry_data['amount']
            else:
                total_credits += entry_data['amount']
        
        # Update batch totals
        batch.total_debits = total_debits
        batch.total_credits = total_credits
        batch.save()
        
        print(f"✓ Created journal batch: {batch.batch_number}")

def create_budgets():
    """Create sample budgets"""
    print("Creating budgets...")
    
    admin_user = User.objects.filter(is_superuser=True).first()
    base_currency = Currency.objects.get(is_base_currency=True)
    
    # Get or create departments
    hr_dept, _ = Department.objects.get_or_create(name='HR', defaults={'description': 'Human Resources'})
    sales_dept, _ = Department.objects.get_or_create(name='Sales', defaults={'description': 'Sales Department'})
    
    # Create annual budget
    budget = Budget.objects.create(
        budget_name='Annual Budget 2024',
        budget_type='ANNUAL',
        fiscal_year=2024,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31),
        status='ACTIVE',
        currency=base_currency,
        department=hr_dept,
        created_by=admin_user,
        approved_by=admin_user,
        approved_at=datetime.now()
    )
    
    # Create budget lines
    budget_lines_data = [
        {'account_code': '6000', 'budgeted_amount': Decimal('120000.00')},  # Salaries
        {'account_code': '6100', 'budgeted_amount': Decimal('24000.00')},   # Benefits
        {'account_code': '6200', 'budgeted_amount': Decimal('36000.00')},   # Rent
        {'account_code': '6300', 'budgeted_amount': Decimal('12000.00')},   # Utilities
        {'account_code': '6400', 'budgeted_amount': Decimal('6000.00')},    # Office Supplies
        {'account_code': '6500', 'budgeted_amount': Decimal('18000.00')},   # Marketing
        {'account_code': '6600', 'budgeted_amount': Decimal('15000.00')},   # Travel
        {'account_code': '6700', 'budgeted_amount': Decimal('9000.00')},    # Professional Services
    ]
    
    total_budget = Decimal('0.00')
    for line_data in budget_lines_data:
        account = ChartOfAccounts.objects.get(account_code=line_data['account_code'])
        BudgetLine.objects.create(
            budget=budget,
            account=account,
            budgeted_amount=line_data['budgeted_amount'],
            actual_amount=line_data['budgeted_amount'] * Decimal(str(random.uniform(0.7, 1.2))),  # Random actual
            notes=f'Budget allocation for {account.account_name}'
        )
        total_budget += line_data['budgeted_amount']
    
    budget.total_budget_amount = total_budget
    budget.save()
    
    print(f"✓ Created budget: {budget.budget_name} with {budget.budget_lines.count()} line items")

def create_fixed_assets():
    """Create sample fixed assets"""
    print("Creating fixed assets...")
    
    admin_user = User.objects.filter(is_superuser=True).first()
    base_currency = Currency.objects.get(is_base_currency=True)
    
    # Get asset accounts
    equipment_account = ChartOfAccounts.objects.get(account_code='1400')
    computer_account = ChartOfAccounts.objects.get(account_code='1410')
    vehicle_account = ChartOfAccounts.objects.get(account_code='1420')
    depreciation_account = ChartOfAccounts.objects.get(account_code='1500')
    
    assets_data = [
        {
            'code': 'COMP-001',
            'name': 'Dell Laptop - Finance Dept',
            'category': 'Computer Equipment',
            'cost': Decimal('1200.00'),
            'salvage': Decimal('200.00'),
            'life': 3,
            'account': computer_account,
            'location': 'Finance Department'
        },
        {
            'code': 'COMP-002',
            'name': 'HP Desktop - HR Dept',
            'category': 'Computer Equipment',
            'cost': Decimal('800.00'),
            'salvage': Decimal('100.00'),
            'life': 4,
            'account': computer_account,
            'location': 'HR Department'
        },
        {
            'code': 'VEH-001',
            'name': 'Toyota Corolla - Company Car',
            'category': 'Vehicle',
            'cost': Decimal('25000.00'),
            'salvage': Decimal('5000.00'),
            'life': 5,
            'account': vehicle_account,
            'location': 'Main Office'
        },
        {
            'code': 'FURN-001',
            'name': 'Conference Table',
            'category': 'Office Furniture',
            'cost': Decimal('2500.00'),
            'salvage': Decimal('250.00'),
            'life': 10,
            'account': equipment_account,
            'location': 'Conference Room'
        },
        {
            'code': 'EQUIP-001',
            'name': 'Printer - HP LaserJet',
            'category': 'Office Equipment',
            'cost': Decimal('600.00'),
            'salvage': Decimal('50.00'),
            'life': 5,
            'account': equipment_account,
            'location': 'Main Office'
        }
    ]
    
    for asset_data in assets_data:
        # Calculate accumulated depreciation (assume 1 year of depreciation)
        annual_depreciation = (asset_data['cost'] - asset_data['salvage']) / asset_data['life']
        accumulated_dep = annual_depreciation  # 1 year
        
        asset = FixedAsset.objects.create(
            asset_code=asset_data['code'],
            asset_name=asset_data['name'],
            description=f"{asset_data['category']} purchased for business use",
            asset_category=asset_data['category'],
            location=asset_data['location'],
            purchase_date=date.today() - timedelta(days=365),  # 1 year ago
            purchase_cost=asset_data['cost'],
            salvage_value=asset_data['salvage'],
            useful_life_years=asset_data['life'],
            depreciation_method='STRAIGHT_LINE',
            accumulated_depreciation=accumulated_dep,
            status='ACTIVE',
            asset_account=asset_data['account'],
            depreciation_account=depreciation_account,
            currency=base_currency,
            created_by=admin_user
        )
        
        print(f"✓ Created asset: {asset.asset_code} - {asset.asset_name}")

def create_expense_categories():
    """Create expense categories"""
    print("Creating expense categories...")
    
    # Get expense accounts
    travel_account = ChartOfAccounts.objects.get(account_code='6600')
    supplies_account = ChartOfAccounts.objects.get(account_code='6400')
    professional_account = ChartOfAccounts.objects.get(account_code='6700')
    
    categories_data = [
        {
            'name': 'Travel - Airfare',
            'account': travel_account,
            'requires_receipt': True,
            'daily_limit': Decimal('500.00'),
            'monthly_limit': Decimal('2000.00')
        },
        {
            'name': 'Travel - Accommodation',
            'account': travel_account,
            'requires_receipt': True,
            'daily_limit': Decimal('200.00'),
            'monthly_limit': Decimal('1500.00')
        },
        {
            'name': 'Travel - Meals',
            'account': travel_account,
            'requires_receipt': True,
            'daily_limit': Decimal('75.00'),
            'monthly_limit': Decimal('500.00')
        },
        {
            'name': 'Office Supplies',
            'account': supplies_account,
            'requires_receipt': True,
            'monthly_limit': Decimal('300.00')
        },
        {
            'name': 'Training and Development',
            'account': professional_account,
            'requires_receipt': True,
            'monthly_limit': Decimal('1000.00')
        }
    ]
    
    for cat_data in categories_data:
        category, created = ExpenseCategory.objects.get_or_create(
            category_name=cat_data['name'],
            defaults={
                'account': cat_data['account'],
                'requires_receipt': cat_data['requires_receipt'],
                'daily_limit': cat_data.get('daily_limit'),
                'monthly_limit': cat_data.get('monthly_limit'),
                'is_active': True
            }
        )
        if created:
            print(f"✓ Created expense category: {category.category_name}")

def create_expense_reports():
    """Create sample expense reports"""
    print("Creating expense reports...")
    
    base_currency = Currency.objects.get(is_base_currency=True)
    users = User.objects.filter(is_active=True)[:3]  # Get first 3 active users
    categories = list(ExpenseCategory.objects.all())
    
    for i, user in enumerate(users):
        # Create expense report
        report = ExpenseReport.objects.create(
            report_number=f"EXP-{datetime.now().strftime('%Y%m')}-{1000 + i}",
            employee=user,
            report_date=date.today() - timedelta(days=random.randint(1, 30)),
            description=f"Business expenses for {user.get_full_name() or user.username}",
            currency=base_currency,
            status=random.choice(['DRAFT', 'SUBMITTED', 'APPROVED']),
            submitted_at=datetime.now() - timedelta(days=random.randint(1, 10)) if random.choice([True, False]) else None
        )
        
        # Create expense items
        total_amount = Decimal('0.00')
        for j in range(random.randint(2, 5)):
            category = random.choice(categories)
            amount = Decimal(str(random.uniform(50, 500)))
            
            ExpenseItem.objects.create(
                expense_report=report,
                expense_date=report.report_date - timedelta(days=random.randint(0, 5)),
                category=category,
                description=f"Business expense - {category.category_name}",
                amount=amount,
                currency=base_currency,
                receipt_attached=random.choice([True, False]),
                notes=f"Sample expense item for {category.category_name}"
            )
            total_amount += amount
        
        report.total_amount = total_amount
        report.save()
        
        print(f"✓ Created expense report: {report.report_number} for {user.username}")

def create_recurring_transactions():
    """Create sample recurring transactions"""
    print("Creating recurring transactions...")
    
    admin_user = User.objects.filter(is_superuser=True).first()
    base_currency = Currency.objects.get(is_base_currency=True)
    
    # Get accounts
    rent_expense = ChartOfAccounts.objects.get(account_code='6200')
    utilities_expense = ChartOfAccounts.objects.get(account_code='6300')
    cash_account = ChartOfAccounts.objects.get(account_code='1000')
    ap_account = ChartOfAccounts.objects.get(account_code='2000')
    
    recurring_data = [
        {
            'name': 'Monthly Rent Payment',
            'frequency': 'MONTHLY',
            'debit_account': rent_expense,
            'credit_account': cash_account,
            'amount': Decimal('3000.00')
        },
        {
            'name': 'Monthly Utilities',
            'frequency': 'MONTHLY',
            'debit_account': utilities_expense,
            'credit_account': ap_account,
            'amount': Decimal('800.00')
        },
        {
            'name': 'Quarterly Insurance',
            'frequency': 'QUARTERLY',
            'debit_account': ChartOfAccounts.objects.get(account_code='1300'),  # Prepaid
            'credit_account': cash_account,
            'amount': Decimal('1500.00')
        }
    ]
    
    for rec_data in recurring_data:
        transaction = RecurringTransaction.objects.create(
            transaction_name=rec_data['name'],
            description=f"Automated {rec_data['name'].lower()}",
            frequency=rec_data['frequency'],
            start_date=date.today(),
            next_run_date=date.today() + timedelta(days=30),  # Next month
            status='ACTIVE',
            debit_account=rec_data['debit_account'],
            credit_account=rec_data['credit_account'],
            amount=rec_data['amount'],
            currency=base_currency,
            created_by=admin_user
        )
        
        print(f"✓ Created recurring transaction: {transaction.transaction_name}")

def main():
    """Main function to initialize all finance data"""
    print("🚀 Starting Finance Module Data Initialization...")
    print("=" * 60)
    
    try:
        # Create all sample data
        create_currencies()
        print()
        
        create_chart_of_accounts()
        print()
        
        create_journal_entries()
        print()
        
        create_budgets()
        print()
        
        create_fixed_assets()
        print()
        
        create_expense_categories()
        print()
        
        create_expense_reports()
        print()
        
        create_recurring_transactions()
        print()
        
        print("=" * 60)
        print("✅ Finance Module Data Initialization Complete!")
        print()
        print("📊 Summary:")
        print(f"   • Currencies: {Currency.objects.count()}")
        print(f"   • Chart of Accounts: {ChartOfAccounts.objects.count()}")
        print(f"   • Journal Batches: {JournalBatch.objects.count()}")
        print(f"   • Journal Entries: {JournalEntry.objects.count()}")
        print(f"   • Budgets: {Budget.objects.count()}")
        print(f"   • Budget Lines: {BudgetLine.objects.count()}")
        print(f"   • Fixed Assets: {FixedAsset.objects.count()}")
        print(f"   • Expense Categories: {ExpenseCategory.objects.count()}")
        print(f"   • Expense Reports: {ExpenseReport.objects.count()}")
        print(f"   • Expense Items: {ExpenseItem.objects.count()}")
        print(f"   • Recurring Transactions: {RecurringTransaction.objects.count()}")
        print()
        print("🎯 You can now:")
        print("   1. Access the Finance Dashboard at /finance")
        print("   2. View Chart of Accounts with balances")
        print("   3. Review Journal Entries and Trial Balance")
        print("   4. Manage Budgets and view variance reports")
        print("   5. Track Fixed Assets and depreciation")
        print("   6. Process Expense Reports")
        print("   7. Monitor Recurring Transactions")
        print()
        print("🔧 Next Steps:")
        print("   1. Run database migrations: python manage.py makemigrations")
        print("   2. Apply migrations: python manage.py migrate")
        print("   3. Start the backend server: python manage.py runserver 8000")
        print("   4. Start the frontend: npm start")
        print("   5. Navigate to Finance module in the ERP system")
        
    except Exception as e:
        print(f"❌ Error during initialization: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
