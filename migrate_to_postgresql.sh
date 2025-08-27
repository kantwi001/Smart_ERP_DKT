#!/bin/bash

# Migrate ERP System from SQLite to PostgreSQL
echo "🔄 Migrating ERP System to PostgreSQL..."

cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Backup existing SQLite data
echo "📦 Backing up existing SQLite data..."
python manage.py dumpdata --natural-foreign --natural-primary > backup_data.json

# Install PostgreSQL dependencies
echo "📥 Installing PostgreSQL dependencies..."
source venv/bin/activate
pip install psycopg2-binary

# Run PostgreSQL setup
echo "🐘 Setting up PostgreSQL database..."
chmod +x ../setup_postgresql.sh
../setup_postgresql.sh

# Update Django settings to use PostgreSQL
echo "⚙️ Updating Django settings..."
# Settings are already updated via the proposed change

# Create new database schema
echo "🏗️ Creating database schema..."
python manage.py migrate

# Load backed up data
echo "📤 Loading existing data into PostgreSQL..."
python manage.py loaddata backup_data.json

# Create superuser if needed
echo "👤 Creating superuser..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: admin/admin123')
else:
    print('Admin user already exists')
"

# Test database connection
echo "🧪 Testing database connection..."
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT COUNT(*) FROM auth_user')
user_count = cursor.fetchone()[0]
print(f'✅ Database connected! Users in database: {user_count}')
"

echo "🎉 Migration to PostgreSQL completed!"
echo "📊 Database: erp_system@192.168.2.185:5432"
echo "🔐 User: erpuser / erppassword"
echo "🚀 Both mobile apps and webapp now use the same centralized database"
