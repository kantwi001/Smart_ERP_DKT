#!/usr/bin/env python3
import os
import sys

# Change to backend directory and add to path
backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from sales.models import Customer, Sale
from pos.models import POSSession, Sale as POSSale
from procurement.models import Vendor, ProcurementRequest
from accounting.models import Transaction, Account
from reporting.models import *
from transactions.models import *
from notifications.models import *

def clear_all_data():
    """Clear all transactions, analytics, customers, and vendors except users"""
    
    print("🗑️  Starting data cleanup...")
    
    # Clear POS data
    pos_sessions_count = POSSession.objects.count()
    pos_sales_count = POSSale.objects.count()
    POSSession.objects.all().delete()
    POSSale.objects.all().delete()
    print(f"✅ Cleared {pos_sessions_count} POS sessions and {pos_sales_count} POS sales")
    
    # Clear Sales data
    sales_count = Sale.objects.count()
    customers_count = Customer.objects.count()
    Sale.objects.all().delete()
    Customer.objects.all().delete()
    print(f"✅ Cleared {sales_count} sales and {customers_count} customers")
    
    # Clear Procurement data
    vendors_count = Vendor.objects.count()
    procurement_count = ProcurementRequest.objects.count()
    Vendor.objects.all().delete()
    ProcurementRequest.objects.all().delete()
    print(f"✅ Cleared {vendors_count} vendors and {procurement_count} procurement requests")
    
    # Clear Accounting transactions
    transactions_count = Transaction.objects.count()
    Transaction.objects.all().delete()
    print(f"✅ Cleared {transactions_count} accounting transactions")
    
    # Clear Notifications
    try:
        from notifications.models import Notification
        notifications_count = Notification.objects.count()
        Notification.objects.all().delete()
        print(f"✅ Cleared {notifications_count} notifications")
    except:
        print("⚠️  Notifications model not found, skipping...")
    
    # Clear Reporting data
    try:
        from reporting.models import Report
        reports_count = Report.objects.count()
        Report.objects.all().delete()
        print(f"✅ Cleared {reports_count} reports")
    except:
        print("⚠️  Reports model not found, skipping...")
    
    # Clear Transactions module data
    try:
        from transactions.models import TransactionRecord
        transaction_records_count = TransactionRecord.objects.count()
        TransactionRecord.objects.all().delete()
        print(f"✅ Cleared {transaction_records_count} transaction records")
    except:
        print("⚠️  Transaction records model not found, skipping...")
    
    # Clear Workflows
    try:
        from workflows.models import Workflow, WorkflowInstance
        workflows_count = Workflow.objects.count()
        workflow_instances_count = WorkflowInstance.objects.count()
        WorkflowInstance.objects.all().delete()
        Workflow.objects.all().delete()
        print(f"✅ Cleared {workflows_count} workflows and {workflow_instances_count} workflow instances")
    except:
        print("⚠️  Workflow models not found, skipping...")
    
    # Clear Surveys
    try:
        from surveys.models import Survey, SurveyResponse
        surveys_count = Survey.objects.count()
        responses_count = SurveyResponse.objects.count()
        SurveyResponse.objects.all().delete()
        Survey.objects.all().delete()
        print(f"✅ Cleared {surveys_count} surveys and {responses_count} survey responses")
    except:
        print("⚠️  Survey models not found, skipping...")
    
    # Clear Route Planning
    try:
        from route_planning.models import Route, RouteStop
        routes_count = Route.objects.count()
        stops_count = RouteStop.objects.count()
        RouteStop.objects.all().delete()
        Route.objects.all().delete()
        print(f"✅ Cleared {routes_count} routes and {stops_count} route stops")
    except:
        print("⚠️  Route planning models not found, skipping...")
    
    # Clear Manufacturing data
    try:
        from manufacturing.models import WorkOrder
        work_orders_count = WorkOrder.objects.count()
        WorkOrder.objects.all().delete()
        print(f"✅ Cleared {work_orders_count} work orders")
    except:
        print("⚠️  Manufacturing models not found, skipping...")
    
    # Clear Purchasing data
    try:
        from purchasing.models import PurchaseOrder
        purchase_orders_count = PurchaseOrder.objects.count()
        PurchaseOrder.objects.all().delete()
        print(f"✅ Cleared {purchase_orders_count} purchase orders")
    except:
        print("⚠️  Purchasing models not found, skipping...")
    
    # Clear Warehouse data
    try:
        from warehouse.models import WarehouseLocation, StockMovement
        locations_count = WarehouseLocation.objects.count()
        movements_count = StockMovement.objects.count()
        StockMovement.objects.all().delete()
        WarehouseLocation.objects.all().delete()
        print(f"✅ Cleared {locations_count} warehouse locations and {movements_count} stock movements")
    except:
        print("⚠️  Warehouse models not found, skipping...")
    
    print("\n🎉 Data cleanup completed successfully!")
    print("✅ Preserved: Users, Inventory (Products/Categories)")
    print("🗑️  Cleared: All transactions, customers, vendors, analytics, and business data")

if __name__ == "__main__":
    confirm = input("⚠️  This will permanently delete all business data except users and inventory. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_all_data()
    else:
        print("❌ Operation cancelled.")
