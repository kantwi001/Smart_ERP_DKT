#!/usr/bin/env python3
import sqlite3
import os

# Path to the SQLite database
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

print("=" * 100)
print("ERP SYSTEM - COMPLETE USER DIRECTORY")
print("=" * 100)

if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Query all users with additional details
    cursor.execute("""
        SELECT 
            u.id, u.username, u.email, u.first_name, u.last_name, 
            u.is_superuser, u.is_staff, u.is_active, u.role, u.department_id,
            u.phone, u.date_joined, u.last_login, u.assigned_warehouse_id
        FROM users_user u
        ORDER BY u.id
    """)
    
    users = cursor.fetchall()
    
    # Get departments
    cursor.execute("SELECT id, name FROM hr_department")
    departments = dict(cursor.fetchall())
    
    # Get warehouses
    cursor.execute("SELECT id, name FROM warehouse_warehouse")
    warehouses = dict(cursor.fetchall())
    
    print(f"📊 TOTAL USERS: {len(users)}")
    print(f"📊 TOTAL DEPARTMENTS: {len(departments)}")
    print(f"📊 TOTAL WAREHOUSES: {len(warehouses)}")
    print("=" * 100)
    
    # Display users in detailed format
    for user in users:
        (user_id, username, email, first_name, last_name, is_superuser, 
         is_staff, is_active, role, dept_id, phone, date_joined, 
         last_login, warehouse_id) = user
        
        full_name = f"{first_name} {last_name}".strip() or "N/A"
        dept_name = departments.get(dept_id, 'Unassigned') if dept_id else 'Unassigned'
        warehouse_name = warehouses.get(warehouse_id, 'Unassigned') if warehouse_id else 'Unassigned'
        
        # Status indicators
        status = "🟢 Active" if is_active else "🔴 Inactive"
        admin_status = "👑 SuperUser" if is_superuser else ("👤 Staff" if is_staff else "👥 User")
        
        print(f"🆔 USER #{user_id:02d}")
        print(f"   👤 Name: {full_name}")
        print(f"   📧 Email: {email or 'Not provided'}")
        print(f"   🔑 Username: {username}")
        print(f"   📱 Phone: {phone or 'Not provided'}")
        print(f"   💼 Role: {role or 'Not assigned'}")
        print(f"   🏢 Department: {dept_name}")
        print(f"   🏭 Warehouse: {warehouse_name}")
        print(f"   📊 Status: {status}")
        print(f"   🔐 Access: {admin_status}")
        print(f"   📅 Joined: {date_joined or 'Unknown'}")
        print(f"   🕐 Last Login: {last_login or 'Never'}")
        print("-" * 100)
    
    # Summary by role
    print("\n📈 USERS BY ROLE:")
    cursor.execute("""
        SELECT role, COUNT(*) as count 
        FROM users_user 
        WHERE role IS NOT NULL 
        GROUP BY role 
        ORDER BY count DESC
    """)
    role_stats = cursor.fetchall()
    
    for role, count in role_stats:
        print(f"   {role}: {count} users")
    
    # Summary by department
    print("\n🏢 USERS BY DEPARTMENT:")
    cursor.execute("""
        SELECT d.name, COUNT(u.id) as count 
        FROM hr_department d
        LEFT JOIN users_user u ON d.id = u.department_id
        GROUP BY d.id, d.name
        ORDER BY count DESC
    """)
    dept_stats = cursor.fetchall()
    
    for dept, count in dept_stats:
        print(f"   {dept}: {count} users")
    
    # Active vs Inactive
    cursor.execute("SELECT is_active, COUNT(*) FROM users_user GROUP BY is_active")
    activity_stats = cursor.fetchall()
    
    print("\n📊 USER ACTIVITY STATUS:")
    for is_active, count in activity_stats:
        status = "Active" if is_active else "Inactive"
        print(f"   {status}: {count} users")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")

print("=" * 100)
