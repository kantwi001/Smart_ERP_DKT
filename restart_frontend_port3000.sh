#!/bin/bash

echo "🔄 Restarting Frontend on Port 3000"

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Stop any running frontend processes
echo "🛑 Stopping existing frontend processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true
pkill -f "PORT=3000" || true

# Wait a moment for processes to stop
sleep 2

# Ensure correct environment for desktop mode
echo "🌐 Setting up desktop environment..."
cp .env.web .env

# Start frontend on port 3000 with desktop mode
echo "🚀 Starting frontend on port 3000 (Desktop Mode)..."
echo "   - URL: http://localhost:3000"
echo "   - Mode: Desktop (Sidebar Navigation)"
echo "   - Environment: REACT_APP_MOBILE_MODE=false"
echo ""

# Start with explicit environment variables
REACT_APP_MOBILE_MODE=false PORT=3000 npm start
