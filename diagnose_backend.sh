#!/bin/bash

echo "🔍 ERP Backend Server Diagnostic Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check current directory
echo -e "${BLUE}1. Checking current directory...${NC}"
pwd

# Check if we're in the right project directory
if [[ ! -f "start_servers.sh" ]]; then
    echo -e "${RED}❌ Not in the correct project directory!${NC}"
    echo "Please run: cd /Users/kwadwoantwi/CascadeProjects/erp-system"
    exit 1
else
    echo -e "${GREEN}✅ In correct project directory${NC}"
fi

# Check backend directory exists
echo -e "${BLUE}2. Checking backend directory...${NC}"
if [[ ! -d "backend" ]]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Backend directory exists${NC}"
fi

# Check Django manage.py exists
echo -e "${BLUE}3. Checking Django setup...${NC}"
if [[ ! -f "backend/manage.py" ]]; then
    echo -e "${RED}❌ Django manage.py not found!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Django manage.py found${NC}"
fi

# Check virtual environment
echo -e "${BLUE}4. Checking virtual environment...${NC}"
if [[ ! -d "backend/venv" ]]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found, creating...${NC}"
    cd backend
    python3 -m venv venv
    cd ..
else
    echo -e "${GREEN}✅ Virtual environment exists${NC}"
fi

# Check what's running on port 2025
echo -e "${BLUE}5. Checking port 2025...${NC}"
PORT_CHECK=$(lsof -i :2025 2>/dev/null)
if [[ -z "$PORT_CHECK" ]]; then
    echo -e "${GREEN}✅ Port 2025 is free${NC}"
else
    echo -e "${YELLOW}⚠️  Port 2025 is in use:${NC}"
    echo "$PORT_CHECK"
    echo -e "${YELLOW}Killing processes on port 2025...${NC}"
    lsof -ti:2025 | xargs kill -9 2>/dev/null
    sleep 2
fi

# Check Python version
echo -e "${BLUE}6. Checking Python...${NC}"
cd backend
source venv/bin/activate 2>/dev/null
PYTHON_VERSION=$(python --version 2>&1)
echo "Python version: $PYTHON_VERSION"

# Check Django installation
echo -e "${BLUE}7. Checking Django installation...${NC}"
DJANGO_CHECK=$(python -c "import django; print(django.get_version())" 2>&1)
if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Django installed: $DJANGO_CHECK${NC}"
else
    echo -e "${YELLOW}⚠️  Installing Django and dependencies...${NC}"
    pip install -r requirements.txt
fi

# Try to start Django server
echo -e "${BLUE}8. Attempting to start Django server...${NC}"
echo -e "${YELLOW}Starting Django development server...${NC}"
echo -e "${YELLOW}If successful, you'll see 'Starting development server at http://0.0.0.0:2025/'${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop the server when you're done testing${NC}"
echo ""

# Run Django server
python manage.py runserver 0.0.0.0:2025
