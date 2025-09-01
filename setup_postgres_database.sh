#!/bin/bash

echo "🐘 Setting up PostgreSQL Database for ERP System"
echo "==============================================="

# Step 1: Install PostgreSQL if not installed
echo "1️⃣ Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    brew install postgresql
else
    echo "✅ PostgreSQL is installed"
fi

# Step 2: Start PostgreSQL service
echo ""
echo "2️⃣ Starting PostgreSQL service..."
brew services start postgresql
sleep 3

# Step 3: Create database and user
echo ""
echo "3️⃣ Creating database and user..."

# Create database
echo "📊 Creating database 'erp_system'..."
createdb erp_system 2>/dev/null && echo "✅ Database created" || echo "ℹ️  Database already exists"

# Create user
echo "👤 Creating user 'erpuser'..."
createuser erpuser 2>/dev/null && echo "✅ User created" || echo "ℹ️  User already exists"

# Set password and permissions
echo "🔐 Setting up user permissions..."
psql -c "ALTER USER erpuser WITH PASSWORD 'erppassword';" 2>/dev/null
psql -c "GRANT ALL PRIVILEGES ON DATABASE erp_system TO erpuser;" 2>/dev/null
psql -d erp_system -c "GRANT ALL ON SCHEMA public TO erpuser;" 2>/dev/null

echo "✅ Database setup completed"

# Step 4: Test connection
echo ""
echo "4️⃣ Testing database connection..."
if psql -h localhost -U erpuser -d erp_system -c "SELECT version();" 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "🔧 Trying to fix permissions..."
    
    # Fix common permission issues
    psql -d postgres -c "ALTER USER erpuser CREATEDB;" 2>/dev/null
    psql -d erp_system -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erpuser;" 2>/dev/null
    psql -d erp_system -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erpuser;" 2>/dev/null
    
    # Test again
    if psql -h localhost -U erpuser -d erp_system -c "SELECT version();" 2>/dev/null; then
        echo "✅ Database connection fixed"
    else
        echo "❌ Still having connection issues"
        exit 1
    fi
fi

# Step 5: Remove SQLite database to force PostgreSQL usage
echo ""
echo "5️⃣ Switching from SQLite to PostgreSQL..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

if [ -f "db.sqlite3" ]; then
    echo "🗑️  Backing up and removing SQLite database..."
    mv db.sqlite3 db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ SQLite database backed up and removed"
fi

echo ""
echo "🎉 PostgreSQL database setup completed!"
echo "📊 Database: erp_system"
echo "👤 User: erpuser"
echo "🔐 Password: erppassword"
echo "🔗 Host: localhost:5432"
echo ""
echo "Next steps:"
echo "1. Run migrations: python manage.py migrate"
echo "2. Create superuser: python manage.py createsuperuser"
echo "3. Start backend: python manage.py runserver 0.0.0.0:2025"
