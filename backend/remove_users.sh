#!/bin/bash

echo "🗑️  Removing sample users from ERP system..."
echo "⚠️  WARNING: This will permanently delete users and all their related data!"
echo "================================================================================"

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Confirmation prompt
read -p "Are you sure you want to delete sample users? (y/yes/n/no): " confirm

if [[ "$confirm" != "yes" && "$confirm" != "y" && "$confirm" != "Y" && "$confirm" != "YES" ]]; then
    echo "❌ User deletion cancelled."
    exit 0
fi

echo "✅ Proceeding with user deletion..."

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "✅ Found virtual environment, activating..."
    source venv/bin/activate
    
    # Run the Django shell script
    echo "✅ Running user deletion script..."
    python manage.py shell < remove_users.py
    
    # Deactivate virtual environment
    deactivate
    echo "✅ Virtual environment deactivated"
else
    echo "⚠️  No virtual environment found, trying with python3..."
    python3 manage.py shell < remove_users.py
fi

echo "🎉 User deletion process complete!"
echo "📋 Please verify the results above and check your ERP system."
echo "================================================================================"
