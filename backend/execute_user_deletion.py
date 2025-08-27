#!/usr/bin/env python
"""
Direct execution script to delete users from the database immediately
"""
import os
import sys
import sqlite3

# Direct SQLite database access
db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'

def delete_users_directly():
    """Delete users directly from SQLite database"""
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return
    
    print("=" * 80)
    print("DIRECT DATABASE USER DELETION")
    print("=" * 80)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Show all users first
        print("\n🔍 Current users in database:")
        cursor.execute("SELECT id, username, email, first_name, last_name FROM auth_user")
        users = cursor.fetchall()
        
        for user in users:
            print(f"  ID: {user[0]} | Username: {user[1]} | Email: {user[2]} | Name: {user[3]} {user[4]}")
        
        # Delete users matching criteria
        users_to_delete = []
        
        # Find users by various criteria
        criteria = [
            ("username LIKE '%antwi%'", "username containing 'antwi'"),
            ("username LIKE '%kwadwo%'", "username containing 'kwadwo'"),
            ("username LIKE '%kay%'", "username containing 'kay'"),
            ("email LIKE '%kwadwo%'", "email containing 'kwadwo'"),
            ("email LIKE '%antwi%'", "email containing 'antwi'"),
            ("first_name LIKE '%Kwadwo%'", "first name containing 'Kwadwo'"),
            ("first_name LIKE '%Kay%'", "first name containing 'Kay'"),
            ("last_name LIKE '%Antwi%'", "last name containing 'Antwi'"),
            ("first_name LIKE '%Amankwa%'", "first name containing 'Amankwa'"),
        ]
        
        for condition, description in criteria:
            cursor.execute(f"SELECT id, username, email, first_name, last_name FROM auth_user WHERE {condition}")
            matching_users = cursor.fetchall()
            
            for user in matching_users:
                if user[0] not in [u[0] for u in users_to_delete]:  # Avoid duplicates
                    users_to_delete.append(user)
                    print(f"🎯 Found user to delete ({description}): {user[1]} ({user[2]}) - {user[3]} {user[4]}")
        
        if not users_to_delete:
            print("✅ No matching users found to delete.")
            return
        
        print(f"\n🗑️ Deleting {len(users_to_delete)} users...")
        
        # Delete users and related data
        for user in users_to_delete:
            user_id = user[0]
            username = user[1]
            email = user[2]
            
            print(f"🗑️ Deleting user: {username} ({email})")
            
            # Delete from related tables first (to avoid foreign key constraints)
            related_tables = [
                'hr_employee',
                'sales_sale', 
                'inventory_inventoryitem',
                'django_admin_log',
                'auth_user_groups',
                'auth_user_user_permissions'
            ]
            
            for table in related_tables:
                try:
                    cursor.execute(f"DELETE FROM {table} WHERE user_id = ?", (user_id,))
                    deleted_count = cursor.rowcount
                    if deleted_count > 0:
                        print(f"  - Deleted {deleted_count} records from {table}")
                except sqlite3.OperationalError as e:
                    # Table might not exist or column might be named differently
                    pass
            
            # Delete the user
            cursor.execute("DELETE FROM auth_user WHERE id = ?", (user_id,))
            print(f"  ✅ Deleted user: {username}")
        
        # Commit changes
        conn.commit()
        print(f"\n✅ Successfully deleted {len(users_to_delete)} users and their related data")
        
        # Show remaining users
        print("\n" + "=" * 80)
        print("REMAINING USERS:")
        print("=" * 80)
        
        cursor.execute("SELECT id, username, email, first_name, last_name FROM auth_user")
        remaining_users = cursor.fetchall()
        
        if remaining_users:
            for user in remaining_users:
                print(f"👤 ID: {user[0]} | {user[1]} ({user[2]}) - {user[3]} {user[4]}")
        else:
            print("No users remaining in the system.")
        
        print(f"\nTotal remaining users: {len(remaining_users)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    delete_users_directly()
