#!/bin/bash

echo "🗑️ Deleting Kwadwo Amankwa-Adusei Antwi and Kay Jay from ERP system..."
echo "================================================================================"

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
    echo "✅ Virtual environment activated"
    
    # Run the deletion script
    python delete_specific_users.py
    
    echo "✅ User deletion complete"
    deactivate
else
    echo "❌ Virtual environment not found. Please ensure venv exists in backend directory."
    echo "Run: python -m venv venv"
    exit 1
fi
