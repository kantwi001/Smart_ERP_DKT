#!/bin/bash

echo "🚀 Starting Mobile App Data Synchronization..."
echo "=============================================="

# Navigate to project directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Make sure backend is running
echo "📡 Checking backend server..."
if ! curl -s http://localhost:8000/admin/ > /dev/null; then
    echo "⚠️  Backend server not running. Starting backend..."
    cd backend
    python manage.py runserver 8000 &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
    sleep 5
    cd ..
else
    echo "✅ Backend server is running"
fi

# Run the sync script
echo "🔄 Running mobile app data sync..."
python sync_mobile_app_data.py

# Check if sync was successful
if [ $? -eq 0 ]; then
    echo "✅ Mobile app data sync completed successfully!"
    echo "🎯 Your Sales Dashboard now has access to all mobile app data"
    echo ""
    echo "📊 Next steps:"
    echo "1. Start the frontend: cd frontend && npm start"
    echo "2. Open Sales Dashboard in browser"
    echo "3. All customer and product data from mobile app is now available"
else
    echo "❌ Sync failed. Please check the error messages above."
fi

echo "=============================================="
