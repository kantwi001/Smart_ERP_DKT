#!/bin/bash

echo "🔄 Restarting Frontend on Port 3000 (Desktop Mode)"

# Navigate to frontend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend

# Stop any running frontend processes
echo "🛑 Stopping existing frontend processes..."
pkill -f "react-scripts start" || true
pkill -f "npm start" || true
pkill -f "PORT=3000" || true

# Wait for processes to stop
sleep 3

# Ensure correct environment for desktop mode
echo "🌐 Setting up desktop environment..."
cp .env.web .env

echo "✅ Environment configuration:"
cat .env

echo ""
echo "🚀 Starting frontend on port 3000..."
echo "   - URL: http://localhost:3000"
echo "   - Mode: Desktop (Sidebar Navigation)"
echo "   - Fixed: Port-based desktop mode detection"
echo ""

# Start with explicit environment variables
REACT_APP_MOBILE_MODE=false PORT=3000 npm start
