#!/bin/bash

# Finance Module Setup Script
# This script handles all the necessary steps to get the Finance module running

echo "🚀 Starting Finance Module Setup..."
echo "=================================="

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

echo "📊 Step 1: Creating and running database migrations..."
python manage.py makemigrations accounting
python manage.py migrate

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed"
    exit 1
fi

echo ""
echo "📈 Step 2: Initializing sample finance data..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system
python initialize_finance_data.py

if [ $? -eq 0 ]; then
    echo "✅ Sample finance data initialized successfully"
else
    echo "❌ Sample data initialization failed"
    exit 1
fi

echo ""
echo "🔧 Step 3: Starting backend server..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Kill any existing Django server on port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start Django server in background
nohup python manage.py runserver 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for server to start
sleep 3

# Check if backend server is running
if curl -s http://localhost:8000/api/ > /dev/null; then
    echo "✅ Backend server started successfully on port 8000 (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

echo ""
echo "⚛️  Step 4: Starting frontend server..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Kill any existing React server on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start React server in background
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

# Check if frontend server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server started successfully on port 3000 (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
echo "🎉 Finance Module Setup Complete!"
echo "================================="
echo "✅ Backend server: http://localhost:8000"
echo "✅ Frontend app: http://localhost:3000"
echo "✅ Finance Dashboard: http://localhost:3000/finance"
echo ""
echo "📋 Server Process IDs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend log: backend.log"
echo "   Frontend log: frontend.log"
echo ""
echo "🔧 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎯 Ready for testing! Navigate to http://localhost:3000/finance"
