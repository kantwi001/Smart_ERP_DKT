#!/usr/bin/env python3
import sqlite3
import os
from datetime import datetime

def list_all_users():
    """List all users in the ERP system from SQLite database"""
    
    # Path to the SQLite database
    db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'
    
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("=" * 100)
        print("ERP SYSTEM - ALL USERS")
        print("=" * 100)
        
        # Query all users from the users_user table
        cursor.execute("""
            SELECT 
                id, username, email, first_name, last_name, 
                is_superuser, is_staff, is_active, date_joined, last_login,
                role, department_id
            FROM users_user 
            ORDER BY id
        """)
        
        users = cursor.fetchall()
        
        if not users:
            print("No users found in the system.")
            return
        
        print(f"Total Users: {len(users)}")
        print("-" * 100)
        
        # Get departments for reference
        cursor.execute("SELECT id, name FROM hr_department")
        departments = dict(cursor.fetchall())
        
        for user in users:
            user_id, username, email, first_name, last_name, is_superuser, is_staff, is_active, date_joined, last_login, role, dept_id = user
            
            print(f"ID: {user_id}")
            print(f"Username: {username}")
            print(f"Email: {email or 'N/A'}")
            print(f"Full Name: {first_name} {last_name}".strip() or 'N/A')
            print(f"Role: {role or 'N/A'}")
            print(f"Department: {departments.get(dept_id, 'N/A') if dept_id else 'N/A'}")
            print(f"Is Superuser: {'Yes' if is_superuser else 'No'}")
            print(f"Is Staff: {'Yes' if is_staff else 'No'}")
            print(f"Is Active: {'Yes' if is_active else 'No'}")
            print(f"Date Joined: {date_joined}")
            print(f"Last Login: {last_login or 'Never'}")
            
            # Check for employee profile
            cursor.execute("SELECT employee_id, position, phone FROM hr_employee WHERE user_id = ?", (user_id,))
            employee = cursor.fetchone()
            if employee:
                emp_id, position, phone = employee
                print(f"Employee ID: {emp_id}")
                print(f"Position: {position or 'N/A'}")
                print(f"Phone: {phone or 'N/A'}")
            else:
                print("Employee Profile: Not created")
            
            print("-" * 100)
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_all_users()
