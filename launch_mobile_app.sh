#!/bin/bash

echo "🚀 Launching Smart ERP Mobile App"
echo "================================="

# Start backend server
echo "Starting backend server..."
cd backend
python manage.py runserver 0.0.0.0:2025 &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Launch mobile app (if on device/emulator)
echo "Backend running on http://localhost:2025"
echo "Mobile app should connect automatically"

# Keep script running
echo "Press Ctrl+C to stop backend server"
wait $BACKEND_PID
