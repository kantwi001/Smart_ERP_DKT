#!/usr/bin/env python3
"""
Debug user creation by adding detailed logging to backend view
"""
import sqlite3
import os

def debug_user_creation():
    """Add debug logging to user creation view"""
    db_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find the correct user table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%user%';")
        tables = cursor.fetchall()
        print(f"User tables found: {[t[0] for t in tables]}")
        
        # Check auth_user table (Django default user model)
        try:
            cursor.execute("SELECT id, email, username, first_name, last_name FROM auth_user;")
            users = cursor.fetchall()
            
            print(f"\n=== ALL USERS IN DATABASE ===")
            print(f"Total users: {len(users)}")
            
            if users:
                existing_emails = []
                for user in users:
                    user_id, email, username, first_name, last_name = user
                    print(f"ID: {user_id}")
                    print(f"Email: '{email}' (length: {len(email)})")
                    print(f"Username: '{username}'")
                    print(f"Name: {first_name} {last_name}")
                    print("-" * 40)
                    existing_emails.append(email.lower().strip())
                
                # Test specific email
                test_emails = ["newemployee@company.com", "staff@company.com", "testuser@example.com"]
                
                print(f"\n=== EMAIL CONFLICT TEST ===")
                for test_email in test_emails:
                    cursor.execute("SELECT * FROM auth_user WHERE email = ?", (test_email,))
                    exact_match = cursor.fetchone()
                    
                    cursor.execute("SELECT * FROM auth_user WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))", (test_email,))
                    case_insensitive_match = cursor.fetchone()
                    
                    print(f"Testing email: '{test_email}'")
                    print(f"  Exact match: {exact_match is not None}")
                    print(f"  Case-insensitive match: {case_insensitive_match is not None}")
                    
                    if case_insensitive_match:
                        print(f"  Conflicting email in DB: '{case_insensitive_match[1]}'")
                    else:
                        print(f"  ✅ {test_email} is SAFE to use!")
                    print()
                
        except sqlite3.OperationalError as e:
            print(f"Error querying auth_user: {e}")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    debug_user_creation()
