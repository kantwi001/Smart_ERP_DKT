#!/bin/bash

# PostgreSQL Database Setup for ERP System (macOS Local)
echo "🐘 Setting up PostgreSQL Database locally for ERP System..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL via Homebrew..."
    brew install postgresql@14
    brew services start postgresql@14
    
    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"
    
    sleep 5
else
    echo "✅ PostgreSQL is already installed"
    # Start PostgreSQL service
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
fi

# Wait for PostgreSQL to start
echo "⏳ Waiting for PostgreSQL to start..."
sleep 3

# Create database and user using current user (no sudo needed on macOS)
echo "Creating database and user..."
createdb erp_system 2>/dev/null || echo "Database may already exist"

psql -d postgres << EOF
-- Create user if not exists
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'erpuser') THEN
      CREATE USER erpuser WITH PASSWORD 'erppassword';
   END IF;
END
\$\$;

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
PGPASSWORD=erppassword psql -h localhost -U erpuser -d erp_system -c "SELECT version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
    echo "Database: erp_system"
    echo "User: erpuser"
    echo "Host: localhost:5432"
else
    echo "❌ Database connection test failed"
fi

echo "🔧 PostgreSQL is now running locally on localhost:5432"
