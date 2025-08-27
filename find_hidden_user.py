#!/usr/bin/env python3
"""
Find the hidden user with test@slaystudio.co.uk email (ID: 13)
"""
import sqlite3
import os

def find_hidden_user():
    """Find user ID 13 with test@slaystudio.co.uk email"""
    db_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find user ID 13
        cursor.execute("SELECT * FROM auth_user WHERE id = 13;")
        user_13 = cursor.fetchone()
        
        if user_13:
            print("=== FOUND HIDDEN USER (ID: 13) ===")
            columns = [desc[0] for desc in cursor.description]
            for i, value in enumerate(user_13):
                print(f"{columns[i]}: {value}")
            print("-" * 50)
        
        # Find user with test@slaystudio.co.uk email
        cursor.execute("SELECT * FROM auth_user WHERE email = 'test@slaystudio.co.uk';")
        email_user = cursor.fetchone()
        
        if email_user:
            print("=== USER WITH test@slaystudio.co.uk EMAIL ===")
            columns = [desc[0] for desc in cursor.description]
            for i, value in enumerate(email_user):
                print(f"{columns[i]}: {value}")
            print("-" * 50)
        
        # Show all users to compare
        cursor.execute("SELECT id, email, username, first_name, last_name, is_active FROM auth_user ORDER BY id;")
        all_users = cursor.fetchall()
        
        print("=== ALL USERS IN DATABASE ===")
        print(f"Total users: {len(all_users)}")
        for user in all_users:
            user_id, email, username, first_name, last_name, is_active = user
            status = "Active" if is_active else "Inactive"
            print(f"ID: {user_id} | Email: {email} | Name: {first_name} {last_name} | Status: {status}")
        
        # Check why user isn't showing in frontend
        print("\n=== DIAGNOSIS ===")
        if user_13 and not user_13[10]:  # is_active field
            print("🔍 User ID 13 is INACTIVE - that's why it's not showing in frontend!")
            print("💡 Solution: Reactivate the user or delete it to free up the email")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    find_hidden_user()
