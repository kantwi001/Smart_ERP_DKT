from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal
import uuid

User = get_user_model()

class Currency(models.Model):
    """Multi-currency support"""
    code = models.CharField(max_length=3, unique=True)  # USD, EUR, GBP, etc.
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=5)
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=4, default=1.0000)
    is_base_currency = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class ChartOfAccounts(models.Model):
    """Chart of Accounts - Account structure"""
    ACCOUNT_TYPES = [
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('REVENUE', 'Revenue'),
        ('EXPENSE', 'Expense'),
        ('COST_OF_GOODS_SOLD', 'Cost of Goods Sold'),
    ]
    
    ACCOUNT_SUBTYPES = [
        # Assets
        ('CURRENT_ASSET', 'Current Asset'),
        ('FIXED_ASSET', 'Fixed Asset'),
        ('INTANGIBLE_ASSET', 'Intangible Asset'),
        ('INVENTORY', 'Inventory'),
        ('ACCOUNTS_RECEIVABLE', 'Accounts Receivable'),
        ('CASH', 'Cash and Cash Equivalents'),
        
        # Liabilities
        ('CURRENT_LIABILITY', 'Current Liability'),
        ('LONG_TERM_LIABILITY', 'Long-term Liability'),
        ('ACCOUNTS_PAYABLE', 'Accounts Payable'),
        
        # Equity
        ('RETAINED_EARNINGS', 'Retained Earnings'),
        ('CAPITAL', 'Capital'),
        
        # Revenue
        ('OPERATING_REVENUE', 'Operating Revenue'),
        ('OTHER_REVENUE', 'Other Revenue'),
        
        # Expenses
        ('OPERATING_EXPENSE', 'Operating Expense'),
        ('ADMINISTRATIVE_EXPENSE', 'Administrative Expense'),
        ('SELLING_EXPENSE', 'Selling Expense'),
        ('FINANCIAL_EXPENSE', 'Financial Expense'),
    ]

    account_code = models.CharField(max_length=20, unique=True)
    account_name = models.CharField(max_length=200)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    account_subtype = models.CharField(max_length=30, choices=ACCOUNT_SUBTYPES)
    parent_account = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    allow_manual_entries = models.BooleanField(default=True)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['account_code']

    def __str__(self):
        return f"{self.account_code} - {self.account_name}"

    @property
    def current_balance(self):
        """Calculate current balance from journal entries"""
        from django.db.models import Sum
        debits = self.journal_entries.filter(entry_type='DEBIT').aggregate(total=Sum('amount'))['total'] or 0
        credits = self.journal_entries.filter(entry_type='CREDIT').aggregate(total=Sum('amount'))['total'] or 0
        
        if self.account_type in ['ASSET', 'EXPENSE', 'COST_OF_GOODS_SOLD']:
            return debits - credits
        else:  # LIABILITY, EQUITY, REVENUE
            return credits - debits

class JournalEntry(models.Model):
    """Journal Entries for double-entry bookkeeping"""
    ENTRY_TYPES = [
        ('DEBIT', 'Debit'),
        ('CREDIT', 'Credit'),
    ]
    
    SOURCE_TYPES = [
        ('MANUAL', 'Manual Entry'),
        ('SALES', 'Sales Transaction'),
        ('PURCHASE', 'Purchase Transaction'),
        ('PAYMENT', 'Payment'),
        ('RECEIPT', 'Receipt'),
        ('ADJUSTMENT', 'Adjustment'),
        ('DEPRECIATION', 'Depreciation'),
        ('ACCRUAL', 'Accrual'),
        ('REVERSAL', 'Reversal'),
    ]

    entry_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    transaction_date = models.DateField()
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='journal_entries')
    entry_type = models.CharField(max_length=6, choices=ENTRY_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    exchange_rate = models.DecimalField(max_digits=10, decimal_places=4, default=1.0000)
    base_amount = models.DecimalField(max_digits=15, decimal_places=2)  # Amount in base currency
    description = models.TextField()
    reference_number = models.CharField(max_length=50, blank=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES, default='MANUAL')
    source_id = models.CharField(max_length=50, blank=True)  # ID from source system
    journal_batch = models.ForeignKey('JournalBatch', on_delete=models.CASCADE, related_name='entries')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    class Meta:
        ordering = ['-transaction_date', '-created_at']

    def __str__(self):
        return f"{self.transaction_date} - {self.account.account_code} - {self.entry_type} {self.amount}"

class JournalBatch(models.Model):
    """Batch of journal entries for transaction integrity"""
    BATCH_STATUS = [
        ('DRAFT', 'Draft'),
        ('POSTED', 'Posted'),
        ('REVERSED', 'Reversed'),
    ]

    batch_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    batch_number = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    transaction_date = models.DateField()
    status = models.CharField(max_length=10, choices=BATCH_STATUS, default='DRAFT')
    total_debits = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_credits = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='posted_batches')

    def __str__(self):
        return f"{self.batch_number} - {self.description}"

    @property
    def is_balanced(self):
        """Check if debits equal credits"""
        return abs(self.total_debits - self.total_credits) < 0.01

class Budget(models.Model):
    """Budget management for accounts and organizational units"""
    BUDGET_TYPES = [
        ('ANNUAL', 'Annual Budget'),
        ('QUARTERLY', 'Quarterly Budget'),
        ('MONTHLY', 'Monthly Budget'),
        ('PROJECT', 'Project Budget'),
    ]
    
    BUDGET_STATUS = [
        ('DRAFT', 'Draft'),
        ('APPROVED', 'Approved'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
    ]

    budget_name = models.CharField(max_length=200)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPES)
    fiscal_year = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=BUDGET_STATUS, default='DRAFT')
    total_budget_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    department = models.ForeignKey('hr.Department', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_budgets')
    approved_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.budget_name} - {self.fiscal_year}"

class BudgetLine(models.Model):
    """Budget line items for specific accounts"""
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name='budget_lines')
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE)
    budgeted_amount = models.DecimalField(max_digits=15, decimal_places=2)
    actual_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    variance = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['budget', 'account']

    def __str__(self):
        return f"{self.budget.budget_name} - {self.account.account_name}"

    @property
    def variance_percentage(self):
        """Calculate variance percentage"""
        if self.budgeted_amount == 0:
            return 0
        return ((self.actual_amount - self.budgeted_amount) / self.budgeted_amount) * 100

class FixedAsset(models.Model):
    """Fixed Assets management"""
    ASSET_STATUS = [
        ('ACTIVE', 'Active'),
        ('DISPOSED', 'Disposed'),
        ('RETIRED', 'Retired'),
        ('UNDER_CONSTRUCTION', 'Under Construction'),
    ]
    
    DEPRECIATION_METHODS = [
        ('STRAIGHT_LINE', 'Straight Line'),
        ('DECLINING_BALANCE', 'Declining Balance'),
        ('UNITS_OF_PRODUCTION', 'Units of Production'),
        ('SUM_OF_YEARS', 'Sum of Years Digits'),
    ]

    asset_code = models.CharField(max_length=50, unique=True)
    asset_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    asset_category = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True)
    purchase_date = models.DateField()
    purchase_cost = models.DecimalField(max_digits=15, decimal_places=2)
    salvage_value = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    useful_life_years = models.IntegerField()
    depreciation_method = models.CharField(max_length=20, choices=DEPRECIATION_METHODS, default='STRAIGHT_LINE')
    accumulated_depreciation = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=ASSET_STATUS, default='ACTIVE')
    asset_account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='fixed_assets')
    depreciation_account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='depreciation_entries')
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.asset_code} - {self.asset_name}"

    @property
    def net_book_value(self):
        """Calculate net book value"""
        return self.purchase_cost - self.accumulated_depreciation

    @property
    def annual_depreciation(self):
        """Calculate annual depreciation amount"""
        if self.depreciation_method == 'STRAIGHT_LINE':
            return (self.purchase_cost - self.salvage_value) / self.useful_life_years
        return 0  # Other methods would need more complex calculations

class ExpenseCategory(models.Model):
    """Expense categories for expense management"""
    category_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE)
    requires_receipt = models.BooleanField(default=True)
    daily_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.category_name

class ExpenseReport(models.Model):
    """Expense reports for travel and expense management"""
    REPORT_STATUS = [
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PAID', 'Paid'),
    ]

    report_number = models.CharField(max_length=50, unique=True)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expense_reports')
    report_date = models.DateField()
    description = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    status = models.CharField(max_length=10, choices=REPORT_STATUS, default='DRAFT')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_expenses')
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.report_number} - {self.employee.get_full_name()}"

class ExpenseItem(models.Model):
    """Individual expense items within expense reports"""
    expense_report = models.ForeignKey(ExpenseReport, on_delete=models.CASCADE, related_name='expense_items')
    expense_date = models.DateField()
    category = models.ForeignKey(ExpenseCategory, on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    receipt_attached = models.BooleanField(default=False)
    receipt_file = models.FileField(upload_to='expense_receipts/', null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.expense_date} - {self.category.category_name} - {self.amount}"

class RecurringTransaction(models.Model):
    """Recurring transactions for automated journal entries"""
    FREQUENCY_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
        ('QUARTERLY', 'Quarterly'),
        ('ANNUALLY', 'Annually'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('COMPLETED', 'Completed'),
    ]

    transaction_name = models.CharField(max_length=200)
    description = models.TextField()
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_run_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    debit_account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='recurring_debits')
    credit_account = models.ForeignKey(ChartOfAccounts, on_delete=models.CASCADE, related_name='recurring_credits')
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.transaction_name} - {self.frequency}"

# Legacy models for backward compatibility
class LegacyAccount(models.Model):
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

class LegacyTransaction(models.Model):
    account = models.ForeignKey(LegacyAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
    transaction_type = models.CharField(max_length=20, choices=[('credit','Credit'),('debit','Debit')])
