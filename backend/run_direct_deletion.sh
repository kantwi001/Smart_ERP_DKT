#!/bin/bash

echo "🗑️ EXECUTING DIRECT USER DELETION FROM DATABASE"
echo "================================================================================"

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

echo "🚀 Running direct SQLite deletion script..."
python3 execute_user_deletion.py

echo "✅ Direct deletion complete. Check output above for results."
