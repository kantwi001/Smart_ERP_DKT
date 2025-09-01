#!/bin/bash

echo "🖥️ Starting Backend Server for Mobile Apps"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "\033[0;34m[INFO]\033[0m $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Check if port 2025 is in use
if lsof -Pi :2025 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port 2025 is already in use!"
    print_status "Stopping existing processes..."
    
    # Kill processes using port 2025
    pkill -f "runserver.*2025" 2>/dev/null || true
    lsof -ti:2025 | xargs kill -9 2>/dev/null || true
    
    sleep 2
    
    if lsof -Pi :2025 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_error "Could not free port 2025. Please manually stop the process:"
        lsof -i :2025
        exit 1
    fi
    
    print_success "Port 2025 cleared"
fi

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
    print_success "Virtual environment activated"
fi

# Get local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo ""
print_success "🌐 Backend will be accessible at:"
echo "   Local: http://localhost:2025"
echo "   Mobile: http://$LOCAL_IP:2025"
echo ""
echo "📱 Mobile apps configured to connect to: http://$LOCAL_IP:2025"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

# Start Django server
python manage.py runserver 0.0.0.0:2025
