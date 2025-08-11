#!/usr/bin/env python3
import sqlite3
import os

def make_superusers():
    """Make Collins Arku and Edmond Sekyere superusers using direct SQLite access"""
    
    db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("MAKING COLLINS ARKU AND EDMOND SEKYERE SUPERUSERS")
        print("=" * 80)
        
        # Target users to make superusers
        target_users = ['Collins Arku', 'Edmond Sekyere']
        
        for target_name in target_users:
            print(f"\n🔍 Searching for user: {target_name}")
            
            name_parts = target_name.split()
            first_name = name_parts[0]
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            # Try to find user by first and last name
            cursor.execute("""
                SELECT id, username, first_name, last_name, email, is_superuser, is_staff, role
                FROM users_user 
                WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)
            """, (first_name, last_name))
            
            user = cursor.fetchone()
            
            if not user:
                # Try to find by username containing first name
                cursor.execute("""
                    SELECT id, username, first_name, last_name, email, is_superuser, is_staff, role
                    FROM users_user 
                    WHERE LOWER(username) LIKE LOWER(?)
                """, (f'%{first_name.lower()}%',))
                
                user = cursor.fetchone()
            
            if not user:
                print(f"❌ User '{target_name}' not found in the system")
                continue
            
            user_id, username, fname, lname, email, is_superuser, is_staff, role = user
            
            print(f"✅ Found user: {username} ({fname} {lname})")
            print(f"   Current status:")
            print(f"   - Is Superuser: {'Yes' if is_superuser else 'No'}")
            print(f"   - Is Staff: {'Yes' if is_staff else 'No'}")
            print(f"   - Role: {role or 'N/A'}")
            
            # Update user to superuser
            if not is_superuser:
                cursor.execute("""
                    UPDATE users_user 
                    SET is_superuser = 1, is_staff = 1, role = 'superadmin'
                    WHERE id = ?
                """, (user_id,))
                
                print(f"🚀 {username} ({fname} {lname}) is now a SUPERUSER!")
            else:
                print(f"ℹ️  {username} is already a superuser")
            
            print("-" * 50)
        
        # Commit changes
        conn.commit()
        
        # List all current superusers
        print("\n" + "=" * 80)
        print("CURRENT SUPERUSERS IN THE SYSTEM")
        print("=" * 80)
        
        cursor.execute("""
            SELECT id, username, first_name, last_name, email, role, is_active
            FROM users_user 
            WHERE is_superuser = 1
            ORDER BY id
        """)
        
        superusers = cursor.fetchall()
        
        if superusers:
            print(f"Total Superusers: {len(superusers)}")
            print("-" * 80)
            
            for user in superusers:
                uid, username, fname, lname, email, role, is_active = user
                full_name = f"{fname or ''} {lname or ''}".strip() or "N/A"
                status = "Active" if is_active else "Inactive"
                
                print(f"ID: {uid}")
                print(f"Username: {username}")
                print(f"Name: {full_name}")
                print(f"Email: {email or 'N/A'}")
                print(f"Role: {role or 'N/A'}")
                print(f"Status: {status}")
                print("-" * 40)
        else:
            print("No superusers found in the system.")
        
        conn.close()
        
        print("\n✅ SUPERUSER UPDATE COMPLETE!")
        print("=" * 80)
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    make_superusers()
