#!/bin/bash

# PostgreSQL Database Setup for ERP System
echo "🐘 Setting up PostgreSQL Database for ERP System..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install postgresql
        brew services start postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Ubuntu/Debian
        sudo apt update
        sudo apt install postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
else
    echo "✅ PostgreSQL is already installed"
fi

# Create database and user
echo "Creating database and user..."
sudo -u postgres psql << EOF
-- Create database
DROP DATABASE IF EXISTS erp_system;
CREATE DATABASE erp_system;

-- Create user
DROP USER IF EXISTS erpuser;
CREATE USER erpuser WITH PASSWORD 'erppassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE erp_system TO erpuser;
ALTER USER erpuser CREATEDB;

-- Connect to database and grant schema privileges
\c erp_system
GRANT ALL ON SCHEMA public TO erpuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erpuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erpuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO erpuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO erpuser;

\q
EOF

# Test connection
echo "Testing database connection..."
PGPASSWORD=erppassword psql -h 192.168.2.185 -U erpuser -d erp_system -c "SELECT version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo "Database: erp_system"
    echo "User: erpuser"
    echo "Host: 192.168.2.185:5432"
else
    echo "❌ Database connection test failed"
    echo "Trying localhost connection..."
    PGPASSWORD=erppassword psql -h localhost -U erpuser -d erp_system -c "SELECT version();"
fi

echo "🔧 Next steps:"
echo "1. Apply the Django settings changes"
echo "2. Run: python manage.py migrate"
echo "3. Run: python manage.py createsuperuser"
