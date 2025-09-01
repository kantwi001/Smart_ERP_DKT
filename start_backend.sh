#!/bin/bash

# Start Backend Server for ERP System
echo "🚀 Starting ERP Backend Server..."

# Navigate to project directory
cd /Users/kwadwoantwi/CascadeProjects/erp-system

# Kill any existing processes on ports 2025 and 2026
echo "Cleaning up existing processes..."
lsof -ti:2025 | xargs kill -9 2>/dev/null
lsof -ti:2026 | xargs kill -9 2>/dev/null
sleep 2

# Start Backend Server
echo "Starting Django backend server on port 2025..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "requirements_installed.flag" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch requirements_installed.flag
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if needed (non-interactive)
echo "Setting up admin user..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: admin/admin123')
else:
    print('Admin user already exists')
"

# Check for Python command availability
if command -v python3 &> /dev/null; then
    echo "Using python3 command"
    python3 manage.py runserver 0.0.0.0:2025
elif command -v python &> /dev/null; then
    echo "Using python command"
    python manage.py runserver 0.0.0.0:2025
else
    echo "Error: Neither python nor python3 command found"
    echo "Please install Python or check your PATH"
    exit 1
fi
