#!/bin/bash

echo "📊 Exporting PostgreSQL Database Data"
echo "===================================="

# Database connection details
DB_NAME="erp_system"
DB_USER="erpuser"
DB_PASSWORD="erppassword"
DB_HOST="localhost"
DB_PORT="5432"

# Create exports directory
mkdir -p exports
cd exports

# Get timestamp for file naming
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🔧 Step 1: Creating full database dump..."
# Full database dump (structure + data)
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > erp_system_full_${TIMESTAMP}.sql

echo "📋 Step 2: Exporting individual tables as CSV..."
# Export key tables as CSV for easy viewing
TABLES=(
    "auth_user"
    "hr_employee" 
    "hr_department"
    "inventory_product"
    "inventory_warehouse"
    "sales_customer"
    "sales_salesorder"
    "accounting_account"
    "accounting_transaction"
)

for table in "${TABLES[@]}"; do
    echo "Exporting $table..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\COPY $table TO '${table}_${TIMESTAMP}.csv' WITH CSV HEADER;" 2>/dev/null || echo "Table $table not found, skipping..."
done

echo "📊 Step 3: Creating data summary report..."
# Create a summary report
cat > data_summary_${TIMESTAMP}.txt << EOF
ERP System Database Export Summary
Generated: $(date)
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT

Table Row Counts:
EOF

# Add table counts to summary
for table in "${TABLES[@]}"; do
    COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
    echo "$table: $COUNT rows" >> data_summary_${TIMESTAMP}.txt
done

echo "🗜️ Step 4: Creating compressed archive..."
# Create compressed archive of all exports
tar -czf erp_system_export_${TIMESTAMP}.tar.gz *.sql *.csv *.txt

echo ""
echo "✅ DATABASE EXPORT COMPLETE!"
echo "=========================="
echo ""
echo "📁 Export Location: $(pwd)"
echo ""
echo "📦 Files Created:"
echo "   • erp_system_full_${TIMESTAMP}.sql (Complete database dump)"
echo "   • Individual CSV files for each table"
echo "   • data_summary_${TIMESTAMP}.txt (Summary report)"
echo "   • erp_system_export_${TIMESTAMP}.tar.gz (Compressed archive)"
echo ""
echo "📊 File Sizes:"
ls -lh erp_system_export_${TIMESTAMP}.tar.gz 2>/dev/null || echo "Archive creation failed"
ls -lh erp_system_full_${TIMESTAMP}.sql 2>/dev/null || echo "SQL dump creation failed"
echo ""
echo "🔽 Download Options:"
echo "1. Download compressed archive: erp_system_export_${TIMESTAMP}.tar.gz"
echo "2. Download SQL dump only: erp_system_full_${TIMESTAMP}.sql"
echo "3. Download individual CSV files for specific tables"
echo ""
echo "💾 To restore database elsewhere:"
echo "   psql -h [host] -U [user] -d [database] < erp_system_full_${TIMESTAMP}.sql"
echo ""
echo "📋 Database Connection Info:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

cd ..
