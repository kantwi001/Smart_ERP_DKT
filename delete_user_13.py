#!/usr/bin/env python3
"""
Delete user ID 13 to free up test@slaystudio.co.uk email
"""
import sqlite3
import os

def delete_user_13():
    """Delete user ID 13 from database"""
    db_path = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # First, show the user we're about to delete
        cursor.execute("SELECT id, email, username, first_name, last_name FROM auth_user WHERE id = 13;")
        user_to_delete = cursor.fetchone()
        
        if user_to_delete:
            user_id, email, username, first_name, last_name = user_to_delete
            print(f"=== DELETING USER ===")
            print(f"ID: {user_id}")
            print(f"Email: {email}")
            print(f"Username: {username}")
            print(f"Name: {first_name} {last_name}")
            print("-" * 30)
            
            # Delete the user
            cursor.execute("DELETE FROM auth_user WHERE id = 13;")
            conn.commit()
            
            print("✅ User ID 13 deleted successfully!")
            print(f"✅ Email {email} is now available for new user creation")
            
            # Verify deletion
            cursor.execute("SELECT * FROM auth_user WHERE id = 13;")
            verify = cursor.fetchone()
            if not verify:
                print("✅ Deletion confirmed - user no longer exists")
            else:
                print("❌ Error: User still exists after deletion")
                
        else:
            print("❌ User ID 13 not found")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    delete_user_13()
    print("\n🚀 NEXT STEP:")
    print("Try creating a user with test@slaystudio.co.uk - it should work now!")
