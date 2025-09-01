#!/bin/bash

echo "🔧 Installing psycopg2 for PostgreSQL connectivity"
echo "==============================================="

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Install psycopg2-binary (easier to install than psycopg2)
echo "🐘 Installing psycopg2-binary..."
pip install psycopg2-binary

# Verify installation
echo ""
echo "✅ Verifying psycopg2 installation..."
python -c "import psycopg2; print(f'✅ psycopg2 version: {psycopg2.__version__}')"

# Test PostgreSQL connection
echo ""
echo "🔍 Testing PostgreSQL connection..."
python -c "
import psycopg2
try:
    conn = psycopg2.connect(
        host='localhost',
        port='5432',
        database='erp_system',
        user='erpuser',
        password='erppassword'
    )
    print('✅ PostgreSQL connection successful!')
    conn.close()
except Exception as e:
    print(f'❌ PostgreSQL connection failed: {e}')
"

echo ""
echo "🎉 psycopg2 installation completed!"
echo "📋 Next steps:"
echo "   1. Restart the backend server"
echo "   2. Django will now use PostgreSQL instead of SQLite"
echo "   3. Test Android app connectivity"
