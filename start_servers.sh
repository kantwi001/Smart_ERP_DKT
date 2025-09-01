#!/bin/bash

echo "🚀 Starting ERP System Servers"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill any existing processes on our ports
echo -e "${BLUE}📋 Step 1: Cleaning up existing processes${NC}"
lsof -ti:2025 | xargs kill -9 2>/dev/null || true
lsof -ti:2026 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned up existing processes${NC}"

echo ""
echo -e "${BLUE}📋 Step 2: Starting Backend Server (Django)${NC}"
cd backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
    echo -e "${GREEN}✅ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠️  No virtual environment found, using system Python${NC}"
fi

# Start Django server in background
echo "Starting Django server on port 2025..."
python manage.py runserver 0.0.0.0:2025 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

cd ..

echo ""
echo -e "${BLUE}📋 Step 3: Starting Frontend Server (React)${NC}"
cd frontend

# Ensure .env file has correct port
echo "PORT=2026" > .env
echo "REACT_APP_API_BASE=http://localhost:2025/api" >> .env

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

# Start React server in background
echo "Starting React server on port 2026..."
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..

echo ""
echo -e "${BLUE}📋 Step 4: Waiting for servers to start${NC}"
sleep 10

echo ""
echo -e "${BLUE}📋 Step 5: Testing server connectivity${NC}"

# Test backend
echo -e "${YELLOW}Testing backend (localhost:2025)...${NC}"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2025 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "000" ]; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend not responding (HTTP $BACKEND_STATUS)${NC}"
fi

# Test frontend
echo -e "${YELLOW}Testing frontend (localhost:2026)...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2026 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "000" ]; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend not responding (HTTP $FRONTEND_STATUS)${NC}"
fi

echo ""
echo -e "${BLUE}📋 Server Status Summary${NC}"
echo "========================"
echo -e "Backend (Django):  http://localhost:2025 - $([ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "000" ] && echo "✅ Running" || echo "❌ Failed")"
echo -e "Frontend (React):  http://localhost:2026 - $([ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "000" ] && echo "✅ Running" || echo "❌ Failed")"

echo ""
echo -e "${BLUE}📋 Process Information${NC}"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo -e "${BLUE}📋 Log Files${NC}"
echo "Backend logs: backend.log"
echo "Frontend logs: frontend.log"

echo ""
echo -e "${BLUE}📋 To stop servers:${NC}"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo "Or run: pkill -f 'manage.py runserver' && pkill -f 'react-scripts'"

echo ""
echo -e "${GREEN}🎉 Servers started! Access your ERP system at:${NC}"
echo -e "${GREEN}   Frontend: http://localhost:2026${NC}"
echo -e "${GREEN}   Backend API: http://localhost:2025/api${NC}"
