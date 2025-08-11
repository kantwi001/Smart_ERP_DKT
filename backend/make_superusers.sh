#!/bin/bash

echo "🚀 Making Collins Arku and Edmond Sekyere superusers..."
echo "=" * 80

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "✅ Found virtual environment, activating..."
    source venv/bin/activate
    
    # Run the Django shell script
    echo "✅ Running Django shell script..."
    python manage.py shell < make_superusers_simple.py
    
    # Deactivate virtual environment
    deactivate
    echo "✅ Virtual environment deactivated"
else
    echo "⚠️  No virtual environment found, trying with python3..."
    python3 manage.py shell < make_superusers_simple.py
fi

echo "🎉 Superuser update process complete!"
