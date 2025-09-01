#!/bin/bash

echo "🚀 Starting ERP System Webapp Servers"
echo "====================================="

# Set error handling
set -e

# Navigate to project root
cd /Users/kwadwoantwi/CascadeProjects/erp-system

echo "🔧 Step 1: Starting Backend Server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start Django development server in background
echo "Starting Django backend server on http://127.0.0.1:8000..."
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

echo "✅ Backend server started (PID: $BACKEND_PID)"

# Navigate to frontend
cd ../frontend

echo "🔧 Step 2: Starting Frontend Server..."

# Install/update npm dependencies
echo "Installing frontend dependencies..."
npm install

# Start React development server in background
echo "Starting React frontend server on http://localhost:3000..."
npm start &
FRONTEND_PID=$!

echo "✅ Frontend server started (PID: $FRONTEND_PID)"

# Wait a moment for servers to start
sleep 5

echo ""
echo "🎉 ERP System Webapp is now running!"
echo "=================================="
echo ""
echo "🌐 Frontend (React): http://localhost:3000"
echo "🔧 Backend (Django): http://127.0.0.1:8000"
echo "📊 Admin Panel: http://127.0.0.1:8000/admin"
echo ""
echo "📋 Server Process IDs:"
echo "   • Backend PID: $BACKEND_PID"
echo "   • Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📱 Mobile App Backend URL: http://127.0.0.1:8000/api"
echo ""
echo "✅ Both servers are running and ready for development!"

# Keep script running to monitor servers
echo "Press Ctrl+C to stop both servers..."
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for user interrupt
while true; do
    sleep 1
done
