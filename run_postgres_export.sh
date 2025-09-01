#!/bin/bash

echo "📊 Running PostgreSQL Database Export"
echo "===================================="

# Navigate to project directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Make export script executable
chmod +x export_postgres_data.sh

# Run the export
./export_postgres_data.sh

echo ""
echo "🔍 Checking export results..."
if [ -d "exports" ]; then
    cd exports
    echo ""
    echo "📁 Export Directory Contents:"
    ls -la
    echo ""
    echo "📦 Available Downloads:"
    for file in *.tar.gz *.sql; do
        if [ -f "$file" ]; then
            echo "   • $file ($(du -h "$file" | cut -f1))"
        fi
    done
    echo ""
    echo "📍 Full Path to Downloads:"
    echo "   $(pwd)"
    cd ..
else
    echo "❌ Export directory not found"
fi

echo ""
echo "✅ PostgreSQL export completed!"
echo "Files are ready for download in the exports/ directory."
