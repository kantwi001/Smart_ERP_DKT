#!/bin/bash

echo "🔄 Restarting ERP System Servers..."

# Kill existing processes
echo "🛑 Stopping existing servers..."
pkill -f "python manage.py runserver"
pkill -f "npm start"
pkill -f "react-scripts start"

# Wait for processes to stop
sleep 3

# Start backend server
echo "🚀 Starting Django backend server on port 2025..."
cd backend
source venv/bin/activate
python manage.py runserver 2025 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Start frontend server
echo "🚀 Starting React frontend server on port 2026..."
cd ../frontend
PORT=2026 npm start &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

echo "✅ Both servers are starting up..."
echo "Backend: http://localhost:2025"
echo "Frontend: http://localhost:2026"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers later, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"
