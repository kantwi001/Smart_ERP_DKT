#!/bin/bash
echo "🖥️ Starting Backend Server"
echo "=========================="

cd backend

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "❌ Virtual environment not found. Run setup_mobile_testing_environment.sh first"
    exit 1
fi

# Start server
echo "🚀 Starting Django server on 0.0.0.0:2025..."
python manage.py runserver 0.0.0.0:2025
