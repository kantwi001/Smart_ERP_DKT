#!/usr/bin/env python3

import os
import sys
import psycopg2
from psycopg2 import OperationalError
import subprocess

def check_postgres_service():
    """Check if PostgreSQL service is running"""
    print("🔍 Checking PostgreSQL service status...")
    
    try:
        # Check if PostgreSQL is running on macOS
        result = subprocess.run(['brew', 'services', 'list'], capture_output=True, text=True)
        if 'postgresql' in result.stdout:
            if 'started' in result.stdout:
                print("✅ PostgreSQL service is running")
                return True
            else:
                print("❌ PostgreSQL service is not running")
                return False
    except:
        pass
    
    # Alternative check using ps
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        if 'postgres' in result.stdout:
            print("✅ PostgreSQL process found")
            return True
        else:
            print("❌ PostgreSQL process not found")
            return False
    except:
        print("❌ Could not check PostgreSQL status")
        return False

def test_database_connection():
    """Test connection to PostgreSQL database"""
    print("\n🔍 Testing PostgreSQL database connection...")
    
    # Database configuration from settings.py
    db_config = {
        'host': 'localhost',
        'port': '5432',
        'database': 'erp_system',
        'user': 'erpuser',
        'password': 'erppassword'
    }
    
    try:
        # Test connection
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        
        # Test query
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ PostgreSQL connection successful!")
        print(f"📊 Database: {db_config['database']}")
        print(f"👤 User: {db_config['user']}")
        print(f"🔗 Host: {db_config['host']}:{db_config['port']}")
        print(f"📝 Version: {version[0]}")
        
        # Check if tables exist
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📋 Found {len(tables)} tables in database:")
        for table in tables[:10]:  # Show first 10 tables
            print(f"   - {table[0]}")
        if len(tables) > 10:
            print(f"   ... and {len(tables) - 10} more tables")
        
        cursor.close()
        conn.close()
        return True
        
    except OperationalError as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def check_django_database():
    """Check Django database configuration"""
    print("\n🔍 Checking Django database setup...")
    
    # Change to backend directory
    backend_dir = "/Users/kwadwoantwi/CascadeProjects/erp-system/backend"
    os.chdir(backend_dir)
    
    try:
        # Check migrations
        result = subprocess.run([
            'python', 'manage.py', 'showmigrations', '--plan'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Django can connect to database")
            
            # Count applied migrations
            applied = result.stdout.count('[X]')
            unapplied = result.stdout.count('[ ]')
            
            print(f"📊 Migrations: {applied} applied, {unapplied} unapplied")
            
            if unapplied > 0:
                print("⚠️  There are unapplied migrations")
                return False
            else:
                print("✅ All migrations are applied")
                return True
        else:
            print(f"❌ Django database check failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Django check error: {e}")
        return False

def start_postgres_if_needed():
    """Start PostgreSQL if it's not running"""
    print("\n🚀 Starting PostgreSQL service...")
    
    try:
        # Try to start PostgreSQL using brew
        result = subprocess.run(['brew', 'services', 'start', 'postgresql'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ PostgreSQL service started")
            return True
        else:
            print(f"❌ Failed to start PostgreSQL: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error starting PostgreSQL: {e}")
        return False

def main():
    print("🐘 PostgreSQL Database Connectivity Check")
    print("=" * 50)
    
    # Check if PostgreSQL is running
    postgres_running = check_postgres_service()
    
    if not postgres_running:
        print("\n🔧 Attempting to start PostgreSQL...")
        if start_postgres_if_needed():
            import time
            time.sleep(3)  # Wait for service to start
            postgres_running = check_postgres_service()
    
    if not postgres_running:
        print("\n❌ PostgreSQL is not running. Please start it manually:")
        print("   brew services start postgresql")
        print("   or")
        print("   pg_ctl -D /usr/local/var/postgres start")
        return False
    
    # Test database connection
    db_connected = test_database_connection()
    
    if not db_connected:
        print("\n🔧 Database connection failed. Possible fixes:")
        print("1. Create database and user:")
        print("   createdb erp_system")
        print("   createuser erpuser")
        print("   psql -c \"ALTER USER erpuser WITH PASSWORD 'erppassword';\"")
        print("   psql -c \"GRANT ALL PRIVILEGES ON DATABASE erp_system TO erpuser;\"")
        print("\n2. Check PostgreSQL configuration")
        return False
    
    # Check Django setup
    django_ok = check_django_database()
    
    if not django_ok:
        print("\n🔧 Django database issues detected. Run migrations:")
        print("   cd backend")
        print("   python manage.py makemigrations")
        print("   python manage.py migrate")
        return False
    
    print("\n🎉 PostgreSQL database is properly configured and connected!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
