#!/bin/bash

# ERP System Server Startup Script
echo "🚀 Starting ERP System Servers..."

# Function to kill existing processes on ports
cleanup_ports() {
    echo "🧹 Cleaning up existing processes..."
    
    # Kill any process using port 2025 (backend)
    if lsof -ti:2025 > /dev/null 2>&1; then
        echo "Killing process on port 2025 (backend)..."
        kill -9 $(lsof -ti:2025) 2>/dev/null || true
    fi
    
    # Kill any process using port 2026 (frontend)
    if lsof -ti:2026 > /dev/null 2>&1; then
        echo "Killing process on port 2026 (frontend)..."
        kill -9 $(lsof -ti:2026) 2>/dev/null || true
    fi
    
    sleep 2
}

# Function to start backend server
start_backend() {
    echo "🔧 Starting Django Backend Server..."
    cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start Django server on all interfaces (0.0.0.0) for mobile access
    python manage.py runserver 0.0.0.0:2025 &
    BACKEND_PID=$!
    
    echo "✅ Backend server started (PID: $BACKEND_PID) on http://0.0.0.0:2025"
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting React Frontend Server..."
    cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend
    
    # Set port and start React server
    PORT=2026 npm start &
    FRONTEND_PID=$!
    
    echo "✅ Frontend server started (PID: $FRONTEND_PID) on http://localhost:2026"
}

# Function to wait for servers to be ready
wait_for_servers() {
    echo "⏳ Waiting for servers to be ready..."
    
    # Wait for backend
    echo "Checking backend server..."
    for i in {1..30}; do
        if curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
            echo "✅ Backend server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Backend server failed to start"
            exit 1
        fi
        sleep 2
    done
    
    # Wait for frontend
    echo "Checking frontend server..."
    for i in {1..30}; do
        if curl -s http://localhost:2026 > /dev/null 2>&1; then
            echo "✅ Frontend server is ready!"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "❌ Frontend server failed to start"
            exit 1
        fi
        sleep 2
    done
}

# Main execution
main() {
    cleanup_ports
    start_backend
    sleep 3
    start_frontend
    wait_for_servers
    
    echo ""
    echo "🎉 ERP System is now running!"
    echo "📱 Web App: http://localhost:2026"
    echo "🔧 Backend API: http://localhost:2025/api/"
    echo "📱 Mobile Access: http://192.168.2.126:2025/api/ (for physical devices)"
    echo ""
    echo "💡 To stop servers: Press Ctrl+C or run 'pkill -f \"runserver|npm start\"'"
    echo ""
    echo "🔍 Server Status:"
    echo "Backend PID: $BACKEND_PID"
    echo "Frontend PID: $FRONTEND_PID"
    
    # Keep script running to monitor servers
    wait
}

# Handle Ctrl+C gracefully
trap 'echo "🛑 Shutting down servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Run main function
main
