#!/bin/bash

echo "🌐 Starting Smart ERP Web App (Desktop UI) - Port 3000"
echo "====================================================="

# Kill existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend if needed
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start web frontend with desktop UI
cd frontend
cp .env.web .env
echo "🖥️  Starting desktop interface with sidebar navigation..."
echo "🔗 Access at: http://localhost:3000"
REACT_APP_MOBILE_MODE=false npm start
