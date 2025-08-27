from rest_framework import serializers
from .models import (
    Currency, ChartOfAccounts, JournalEntry, JournalBatch, Budget, BudgetLine,
    FixedAsset, ExpenseCategory, ExpenseReport, ExpenseItem, RecurringTransaction,
    LegacyAccount, LegacyTransaction
)

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'

class ChartOfAccountsSerializer(serializers.ModelSerializer):
    current_balance = serializers.ReadOnlyField()
    parent_account_name = serializers.CharField(source='parent_account.account_name', read_only=True)
    
    class Meta:
        model = ChartOfAccounts
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    account_code = serializers.CharField(source='account.account_code', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = '__all__'

class JournalBatchSerializer(serializers.ModelSerializer):
    entries = JournalEntrySerializer(many=True, read_only=True)
    is_balanced = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = JournalBatch
        fields = '__all__'

class BudgetLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    account_code = serializers.CharField(source='account.account_code', read_only=True)
    variance_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = BudgetLine
        fields = '__all__'

class BudgetSerializer(serializers.ModelSerializer):
    budget_lines = BudgetLineSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    
    class Meta:
        model = Budget
        fields = '__all__'

class FixedAssetSerializer(serializers.ModelSerializer):
    net_book_value = serializers.ReadOnlyField()
    annual_depreciation = serializers.ReadOnlyField()
    asset_account_name = serializers.CharField(source='asset_account.account_name', read_only=True)
    depreciation_account_name = serializers.CharField(source='depreciation_account.account_name', read_only=True)
    
    class Meta:
        model = FixedAsset
        fields = '__all__'

class ExpenseCategorySerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.account_name', read_only=True)
    
    class Meta:
        model = ExpenseCategory
        fields = '__all__'

class ExpenseItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    
    class Meta:
        model = ExpenseItem
        fields = '__all__'

class ExpenseReportSerializer(serializers.ModelSerializer):
    expense_items = ExpenseItemSerializer(many=True, read_only=True)
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    
    class Meta:
        model = ExpenseReport
        fields = '__all__'

class RecurringTransactionSerializer(serializers.ModelSerializer):
    debit_account_name = serializers.CharField(source='debit_account.account_name', read_only=True)
    credit_account_name = serializers.CharField(source='credit_account.account_name', read_only=True)
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    
    class Meta:
        model = RecurringTransaction
        fields = '__all__'

# Legacy serializers for backward compatibility
class LegacyAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegacyAccount
        fields = '__all__'

class LegacyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegacyTransaction
        fields = '__all__'
