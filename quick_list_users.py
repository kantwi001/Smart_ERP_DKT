#!/usr/bin/env python3
import sqlite3
import os

# Path to the SQLite database
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

print("=" * 80)
print("ERP SYSTEM - ALL USERS")
print("=" * 80)

if not os.path.exists(db_path):
    print(f"Database not found at: {db_path}")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Query all users
    cursor.execute("""
        SELECT 
            id, username, email, first_name, last_name, 
            is_superuser, is_staff, is_active, role, department_id
        FROM users_user 
        ORDER BY id
    """)
    
    users = cursor.fetchall()
    
    # Get departments
    cursor.execute("SELECT id, name FROM hr_department")
    departments = dict(cursor.fetchall())
    
    print(f"Total Users: {len(users)}")
    print("-" * 80)
    
    for user in users:
        user_id, username, email, first_name, last_name, is_superuser, is_staff, is_active, role, dept_id = user
        
        full_name = f"{first_name} {last_name}".strip() or "N/A"
        dept_name = departments.get(dept_id, 'N/A') if dept_id else 'N/A'
        
        print(f"{user_id:2d}. {username:15s} | {full_name:20s} | {email or 'N/A':25s}")
        print(f"    Role: {role or 'N/A':15s} | Dept: {dept_name:15s} | Super: {'Yes' if is_superuser else 'No':3s} | Active: {'Yes' if is_active else 'No'}")
        print()
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")

print("=" * 80)
