#!/bin/bash

# 🎪 ERP System Demo Startup Script
# This script starts both backend and frontend servers for demo purposes

echo "🚀 Starting ERP System Demo Environment..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the erp-system root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ All prerequisites found"

# Start backend server
echo ""
echo "🐍 Starting Django Backend Server..."
echo "------------------------------------"

cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Please run: python -m venv venv"
    echo "   Then: source venv/bin/activate && pip install -r requirements.txt"
fi

# Check if Django is installed
if ! python -c "import django" 2>/dev/null; then
    echo "❌ Django not found. Please install requirements: pip install -r requirements.txt"
    exit 1
fi

# Run migrations if needed
echo "🔄 Running database migrations..."
python manage.py migrate --verbosity=0

# Start backend server in background
echo "🚀 Starting backend server on http://localhost:2025..."
python manage.py runserver 0.0.0.0:2025 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo ""
echo "⚛️  Starting React Frontend Server..."
echo "------------------------------------"

cd ../frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
echo "🚀 Starting frontend server on http://localhost:3000..."
npm start &
FRONTEND_PID=$!

# Wait for servers to start
echo ""
echo "⏳ Waiting for servers to start..."
sleep 5

# Check if servers are running
echo ""
echo "🔍 Checking server status..."

# Check backend
if curl -s http://localhost:2025/admin/ >/dev/null; then
    echo "✅ Backend server is running on http://localhost:2025"
else
    echo "❌ Backend server failed to start"
fi

# Check frontend (this might take longer)
sleep 5
if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ Frontend server is running on http://localhost:3000"
else
    echo "⏳ Frontend server is still starting... (this may take a minute)"
fi

echo ""
echo "🎪 ERP SYSTEM DEMO READY!"
echo "========================="
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:2025"
echo "👨‍💼 Admin:     http://localhost:2025/admin"
echo ""
echo "📖 Demo Script: See DEMO_WALKTHROUGH.md for presentation guide"
echo ""
echo "🛑 To stop servers: Press Ctrl+C or run: pkill -f 'manage.py runserver' && pkill -f 'npm start'"
echo ""
echo "🎯 Demo Credentials:"
echo "   Username: admin"
echo "   Password: (use the superuser password you created)"
echo ""
echo "Happy demoing! 🚀"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped. Goodbye!"
}

# Set trap to cleanup on script exit
trap cleanup EXIT

# Keep script running
echo "💡 Press Ctrl+C to stop all servers and exit"
wait
