#!/bin/bash

echo "📱 Starting Smart ERP Mobile App on Port 2026"
echo "=============================================="

# Kill any existing process on port 2026
lsof -ti:2026 | xargs kill -9 2>/dev/null || true

# Start backend if not running
if ! curl -s http://localhost:2025/api/ > /dev/null 2>&1; then
    echo "Starting backend server..."
    cd backend
    python manage.py runserver 0.0.0.0:2025 &
    echo "Backend started on port 2025"
    cd ..
    sleep 3
fi

# Start mobile frontend
cd frontend
cp .env.mobile .env
npm run start:mobile
