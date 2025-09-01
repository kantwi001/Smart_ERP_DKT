#!/bin/bash

echo "📱 Starting Smart ERP Mobile App (Card UI) - Port 2026"
echo "====================================================="

# Kill existing processes on port 2026
lsof -ti:2026 | xargs kill -9 2>/dev/null || true

# Start backend if needed
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start mobile frontend with card UI
cd frontend
cp .env.mobile .env
echo "📱 Starting mobile interface with card-based navigation..."
echo "🔗 Access at: http://localhost:2026"
REACT_APP_MOBILE_MODE=true npm start
