#!/bin/bash

echo "🌐 Starting Smart ERP Web App on Port 3000"
echo "==========================================="

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start backend if not running
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start web frontend
cd frontend
cp .env.web .env
npm run start:web
