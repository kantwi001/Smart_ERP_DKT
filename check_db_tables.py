#!/usr/bin/env python3
import sqlite3
import os

def check_database_tables():
    """Check the actual table names in the SQLite database"""
    
    db_path = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/db.sqlite3'
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("=" * 80)
        print("DATABASE TABLES INSPECTION")
        print("=" * 80)
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        
        print(f"Total tables: {len(tables)}")
        print("-" * 80)
        
        user_related_tables = []
        for table in tables:
            table_name = table[0]
            print(f"Table: {table_name}")
            
            # Check if it's user-related
            if 'user' in table_name.lower() or 'auth' in table_name.lower():
                user_related_tables.append(table_name)
        
        print("\n" + "=" * 80)
        print("USER-RELATED TABLES")
        print("=" * 80)
        
        for table_name in user_related_tables:
            print(f"\n📋 Table: {table_name}")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            print("   Columns:")
            for col in columns:
                col_id, col_name, col_type, not_null, default_val, pk = col
                print(f"   - {col_name} ({col_type})")
            
            # Get sample data if it's a user table
            if 'user' in table_name.lower() and table_name != 'django_migrations':
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"   Records: {count}")
                
                if count > 0 and count < 20:  # Show sample data for small tables
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT 3;")
                    sample_data = cursor.fetchall()
                    print("   Sample data:")
                    for row in sample_data:
                        print(f"   {row}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_database_tables()
