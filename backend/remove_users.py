# Django shell script to remove sample users from all users and transactions
# Run with: python manage.py shell < remove_users.py

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.db import transaction
from sales.models import Sale
from inventory.models import InventoryItem

User = get_user_model()

print("=" * 80)
print("REMOVING SAMPLE USERS")
print("=" * 80)

# Users to remove
target_usernames = ['sample_user1', 'sample_user2', 'test_user']

# Show all users first
print("\n🔍 All users before deletion:")
all_users = User.objects.all().order_by('id')
for u in all_users:
    print(f"   {u.id}: {u.username} ({u.first_name} {u.last_name}) - {u.email}")

print(f"\nTotal users before: {all_users.count()}")

# Find and remove each target user
with transaction.atomic():
    for username in target_usernames:
        print(f"\n🔍 Searching for user: {username}")
        
        try:
            user = User.objects.get(username__iexact=username)
            print(f"✅ Found user: {user.username} ({user.first_name} {user.last_name})")
            
            # Show user details before deletion
            print(f"   - ID: {user.id}")
            print(f"   - Email: {user.email}")
            print(f"   - Is Superuser: {user.is_superuser}")
            print(f"   - Is Staff: {user.is_staff}")
            print(f"   - Is Active: {user.is_active}")
            print(f"   - Date Joined: {user.date_joined}")
            
            # Check for related records before deletion
            print(f"   📋 Checking related records for {user.username}...")
            
            # Check Employee records
            try:
                from hr.models import Employee
                employee = Employee.objects.filter(user=user).first()
                if employee:
                    print(f"   - Employee record found: {employee.employee_id}")
                else:
                    print(f"   - No employee record found")
            except Exception as e:
                print(f"   - Error checking employee records: {e}")
            
            # Check Sales records
            try:
                sales = Sale.objects.filter(user=user).count()
                print(f"   - Sales records: {sales}")
            except Exception as e:
                print(f"   - Error checking sales records: {e}")
            
            # Check Inventory transfers
            try:
                from inventory.models import InventoryTransfer
                transfers = InventoryTransfer.objects.filter(
                    Q(requested_by=user) | Q(approved_by=user)
                ).count()
                print(f"   - Inventory transfers: {transfers}")
            except Exception as e:
                print(f"   - Error checking inventory transfers: {e}")
            
            # Check Leave requests
            try:
                from hr.models import LeaveRequest
                leave_requests = LeaveRequest.objects.filter(employee__user=user).count()
                print(f"   - Leave requests: {leave_requests}")
            except Exception as e:
                print(f"   - Error checking leave requests: {e}")
            
            # Check Procurement requests
            try:
                from procurement.models import ProcurementRequest
                proc_requests = ProcurementRequest.objects.filter(
                    Q(requester=user) | Q(hod_approver=user) | Q(cd_approver=user) |
                    Q(procurement_manager=user) | Q(procurement_officer=user) |
                    Q(finance_manager=user) | Q(finance_officer=user)
                ).count()
                print(f"   - Procurement requests: {proc_requests}")
            except Exception as e:
                print(f"   - Error checking procurement requests: {e}")
            
            # Check POS transactions
            try:
                from pos.models import Sale as POSSale
                pos_sales = POSSale.objects.filter(cashier=user).count()
                print(f"   - POS transactions: {pos_sales}")
            except Exception as e:
                print(f"   - Error checking POS transactions: {e}")
            
            # Check Customer records
            try:
                from sales.models import Customer
                customers = Customer.objects.filter(created_by=user).count()
                print(f"   - Customer records: {customers}")
            except Exception as e:
                print(f"   - Error checking customer records: {e}")
            
            # Check Notifications
            try:
                from notifications.models import Notification
                notifications = Notification.objects.filter(user=user).count()
                print(f"   - Notifications: {notifications}")
            except Exception as e:
                print(f"   - Error checking notifications: {e}")
            
            # Check Workflow approvals
            try:
                from workflows.models import WorkflowApproval
                approvals = WorkflowApproval.objects.filter(approver=user).count()
                print(f"   - Workflow approvals: {approvals}")
            except Exception as e:
                print(f"   - Error checking workflow approvals: {e}")
            
            print(f"\n🗑️  Deleting user: {user.username}")
            
            # Delete the user (this will cascade to related records)
            user_info = f"{user.username} ({user.first_name} {user.last_name})"
            user.delete()
            
            print(f"✅ Successfully deleted user: {user_info}")
            
        except User.DoesNotExist:
            print(f"❌ User '{username}' not found in the system")
        except Exception as e:
            print(f"❌ Error deleting user '{username}': {e}")
        
        print("-" * 50)

# Show remaining users
print("\n" + "=" * 80)
print("REMAINING USERS AFTER DELETION")
print("=" * 80)

remaining_users = User.objects.all().order_by('id')
print(f"Total users after deletion: {remaining_users.count()}")

if remaining_users.exists():
    print("\nRemaining users:")
    for user in remaining_users:
        status = []
        if user.is_superuser:
            status.append("SUPERUSER")
        if user.is_staff:
            status.append("STAFF")
        if not user.is_active:
            status.append("INACTIVE")
        status_str = " | ".join(status) if status else "Regular User"
        
        print(f"• {user.username} ({user.first_name} {user.last_name}) - {status_str}")
else:
    print("No users remaining in the system.")

print("\n✅ USER DELETION COMPLETE!")
print("=" * 80)
