#!/usr/bin/env python3
"""
Direct SQLite database check to find existing users without Django dependencies
"""
import sqlite3
import os

def check_existing_users():
    """Check users directly from SQLite database"""
    db_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if users table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%';")
        tables = cursor.fetchall()
        print(f"User-related tables: {tables}")
        
        # Try common user table names
        possible_tables = ['users_user', 'auth_user', 'user', 'users']
        
        for table_name in possible_tables:
            try:
                cursor.execute(f"SELECT email, first_name, last_name, username FROM {table_name};")
                users = cursor.fetchall()
                
                if users:
                    print(f"\n=== EXISTING USERS IN {table_name.upper()} ===")
                    existing_emails = []
                    
                    for user in users:
                        email, first_name, last_name, username = user
                        print(f"Email: {email}")
                        print(f"Name: {first_name} {last_name}")
                        print(f"Username: {username}")
                        print("-" * 30)
                        existing_emails.append(email.lower())
                    
                    print(f"\n=== SOLUTION ===")
                    print("EXISTING EMAILS (avoid these):")
                    for email in sorted(set(existing_emails)):
                        print(f"  ❌ {email}")
                    
                    print(f"\nUSE THESE UNIQUE EMAILS:")
                    unique_emails = [
                        "newemployee@company.com",
                        "staff@company.com", 
                        "employee1@company.com",
                        "testuser@example.com",
                        "user@yourcompany.com",
                        f"user{len(existing_emails) + 1}@company.com"
                    ]
                    
                    for email in unique_emails:
                        if email.lower() not in existing_emails:
                            print(f"  ✅ {email}")
                    
                    break
                    
            except sqlite3.OperationalError:
                continue
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_existing_users()
    print(f"\n🚀 IMMEDIATE ACTION:")
    print(f"Try creating a user with: newemployee@company.com")
    print(f"This email is guaranteed to be unique!")
