#!/usr/bin/env python3
import sqlite3
import os

# Path to the SQLite database (relative to backend directory)
db_path = 'db.sqlite3'

print("=" * 100)
print("ERP SYSTEM - COMPLETE USER DIRECTORY")
print("=" * 100)

if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # First, check what tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Available tables:", [table[0] for table in tables])
    
    # Try different possible user table names
    user_table = None
    possible_names = ['auth_user', 'users_user', 'user', 'auth_users']
    
    for table_name in possible_names:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            user_table = table_name
            print(f"Found user table: {user_table}")
            break
        except sqlite3.OperationalError:
            continue
    
    if not user_table:
        print("❌ Could not find user table")
        exit(1)
    
    # Query all users with additional details
    cursor.execute(f"""
        SELECT 
            u.id, u.username, u.email, u.first_name, u.last_name, 
            u.is_superuser, u.is_staff, u.is_active, 
            CASE WHEN EXISTS(SELECT 1 FROM pragma_table_info('{user_table}') WHERE name='role') 
                 THEN u.role ELSE NULL END as role,
            CASE WHEN EXISTS(SELECT 1 FROM pragma_table_info('{user_table}') WHERE name='department_id') 
                 THEN u.department_id ELSE NULL END as department_id,
            CASE WHEN EXISTS(SELECT 1 FROM pragma_table_info('{user_table}') WHERE name='phone') 
                 THEN u.phone ELSE NULL END as phone,
            u.date_joined, u.last_login,
            CASE WHEN EXISTS(SELECT 1 FROM pragma_table_info('{user_table}') WHERE name='assigned_warehouse_id') 
                 THEN u.assigned_warehouse_id ELSE NULL END as assigned_warehouse_id
        FROM {user_table} u
        ORDER BY u.id
    """)
    
    users = cursor.fetchall()
    
    # Get departments if table exists
    departments = {}
    try:
        cursor.execute("SELECT id, name FROM hr_department")
        departments = dict(cursor.fetchall())
    except sqlite3.OperationalError:
        print("No hr_department table found")
    
    # Get warehouses if table exists
    warehouses = {}
    try:
        cursor.execute("SELECT id, name FROM warehouse_warehouse")
        warehouses = dict(cursor.fetchall())
    except sqlite3.OperationalError:
        print("No warehouse_warehouse table found")
    
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
    
    # Summary by role (if role column exists)
    if any(user[8] for user in users):  # Check if any user has a role
        print("\n📈 USERS BY ROLE:")
        cursor.execute(f"""
            SELECT role, COUNT(*) as count 
            FROM {user_table} 
            WHERE role IS NOT NULL 
            GROUP BY role 
            ORDER BY count DESC
        """)
        role_stats = cursor.fetchall()
        
        for role, count in role_stats:
            print(f"   {role}: {count} users")
    
    # Summary by department (if departments exist)
    if departments:
        print("\n🏢 USERS BY DEPARTMENT:")
        cursor.execute(f"""
            SELECT d.name, COUNT(u.id) as count 
            FROM hr_department d
            LEFT JOIN {user_table} u ON d.id = u.department_id
            GROUP BY d.id, d.name
            ORDER BY count DESC
        """)
        dept_stats = cursor.fetchall()
        
        for dept, count in dept_stats:
            print(f"   {dept}: {count} users")
    
    # Active vs Inactive
    cursor.execute(f"SELECT is_active, COUNT(*) FROM {user_table} GROUP BY is_active")
    activity_stats = cursor.fetchall()
    
    print("\n📊 USER ACTIVITY STATUS:")
    for is_active, count in activity_stats:
        status = "Active" if is_active else "Inactive"
        print(f"   {status}: {count} users")
    
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")

print("=" * 100)
