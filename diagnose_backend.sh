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

# Backend Diagnostic Script
echo "🔍 Diagnosing Backend Server Issues..."

# Navigate to backend directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

echo "📍 Current directory: $(pwd)"

# Check Python version
echo "🐍 Python version:"
python3 --version

# Check if virtual environment exists
echo "📦 Virtual environment status:"
if [ -d "venv" ]; then
    echo "✅ Virtual environment exists"
    
    # Activate virtual environment
    source venv/bin/activate
    echo "✅ Virtual environment activated"
    
    # Check Django installation
    echo "🔧 Checking Django installation:"
    python -c "import django; print(f'Django version: {django.get_version()}')" 2>/dev/null || echo "❌ Django not installed"
    
    # Check if requirements are installed
    echo "📋 Checking requirements:"
    pip list | grep -E "(Django|djangorestframework)" || echo "❌ Required packages missing"
    
else
    echo "❌ Virtual environment not found"
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing requirements..."
    pip install -r requirements.txt
fi

# Check database
echo "🗄️ Database status:"
if [ -f "db.sqlite3" ]; then
    echo "✅ Database file exists"
else
    echo "❌ Database file missing - running migrations"
    python manage.py migrate
fi

# Check for migration issues
echo "🔄 Checking migrations:"
python manage.py showmigrations 2>/dev/null || echo "❌ Migration issues detected"

# Test Django settings
echo "⚙️ Testing Django settings:"
python manage.py check 2>/dev/null && echo "✅ Django settings OK" || echo "❌ Django settings issues"

# Try to start server with verbose output
echo "🚀 Attempting to start server..."
echo "If this fails, check the error messages below:"
python manage.py runserver 0.0.0.0:2025 --verbosity=2
