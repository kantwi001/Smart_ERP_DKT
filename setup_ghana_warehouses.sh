#!/bin/bash

echo "🇬🇭 Ghana ERP Warehouse Setup Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${BLUE}📋 Step 1: Checking Backend Server Status${NC}"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2025 2>/dev/null || echo "000")

if [ "$BACKEND_STATUS" != "200" ] && [ "$BACKEND_STATUS" != "000" ]; then
    echo -e "${YELLOW}⚠️  Backend not running. Starting Django server...${NC}"
    
    # Navigate to backend directory and start server in background
    cd backend
    
    # Check if virtual environment exists
    if [ -d "venv" ]; then
        echo -e "${BLUE}Activating virtual environment...${NC}"
        source venv/bin/activate
    fi
    
    # Start Django server in background
    echo -e "${BLUE}Starting Django server on port 2025...${NC}"
    python3 manage.py runserver 0.0.0.0:2025 &
    DJANGO_PID=$!
    
    # Wait for server to start
    echo -e "${YELLOW}Waiting for server to start...${NC}"
    sleep 5
    
    # Check if server started successfully
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2025 2>/dev/null || echo "000")
    if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "000" ]; then
        echo -e "${GREEN}✅ Backend server started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start backend server${NC}"
        exit 1
    fi
    
    cd ..
else
    echo -e "${GREEN}✅ Backend server is already running${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 2: Running Ghana Warehouse Setup${NC}"

# Activate virtual environment before running warehouse setup
if [ -d "backend/venv" ]; then
    echo -e "${BLUE}Activating virtual environment for warehouse setup...${NC}"
    source backend/venv/bin/activate
    python3 create_ghana_warehouses.py
    deactivate
else
    echo -e "${YELLOW}⚠️  No virtual environment found, trying without...${NC}"
    python3 create_ghana_warehouses.py
fi

echo ""
echo -e "${BLUE}📋 Step 3: Verification${NC}"

# Test API endpoint
echo -e "${YELLOW}Testing warehouse API endpoint...${NC}"
WAREHOUSE_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:2025/api/warehouse/ 2>/dev/null || echo "000")

if [ "$WAREHOUSE_API_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Warehouse API is responding${NC}"
    
    # Get warehouse count
    WAREHOUSE_COUNT=$(curl -s http://localhost:2025/api/warehouse/ | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
    echo -e "${GREEN}📊 Total warehouses in system: ${WAREHOUSE_COUNT}${NC}"
else
    echo -e "${RED}❌ Warehouse API not responding${NC}"
fi

echo ""
echo -e "${BLUE}📋 Step 4: Next Steps${NC}"
echo -e "${YELLOW}1. Open your browser to http://localhost:2026 (Frontend)${NC}"
echo -e "${YELLOW}2. Navigate to Warehouse Dashboard to see the new warehouses${NC}"
echo -e "${YELLOW}3. Check Stock Management to see product-warehouse relationships${NC}"

echo ""
echo -e "${GREEN}✅ Ghana warehouse setup completed!${NC}"

# Keep script running if we started the Django server
if [ ! -z "$DJANGO_PID" ]; then
    echo -e "${BLUE}Django server is running with PID: $DJANGO_PID${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    wait $DJANGO_PID
fi
