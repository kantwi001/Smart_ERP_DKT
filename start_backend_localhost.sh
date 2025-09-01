#!/bin/bash

echo "🚀 Starting Backend Server for iOS Simulator"
echo "============================================="

# Navigate to backend
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Kill existing processes on port 2025
echo "🔧 Killing existing processes on port 2025..."
lsof -ti:2025 | xargs kill -9 2>/dev/null || true

# Check for Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python."
    exit 1
fi

echo "🐍 Using Python: $PYTHON_CMD"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
elif [ -d "../venv" ]; then
    echo "🔧 Activating virtual environment..."
    source ../venv/bin/activate
fi

# Install Django if missing
if ! $PYTHON_CMD -c "import django" 2>/dev/null; then
    echo "📦 Installing Django..."
    pip install django djangorestframework django-cors-headers
fi

# Start Django server on localhost for iOS Simulator
echo "🚀 Starting Django server on localhost:2025..."
$PYTHON_CMD manage.py runserver localhost:2025
