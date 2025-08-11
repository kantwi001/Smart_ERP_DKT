#!/bin/bash

# Employee Record Synchronization Script
echo "🔄 Employee Record Synchronization Script"
echo "=========================================="

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: manage.py not found. Make sure you're in the correct directory."
    exit 1
fi

# Try to find Python
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Error: Python not found. Please install Python or add it to your PATH."
    exit 1
fi

echo "✅ Using Python command: $PYTHON_CMD"

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
fi

# Run the synchronization command
echo "🚀 Running Employee record synchronization..."
$PYTHON_CMD manage.py sync_employee_records --fix-departments

echo "✅ Synchronization completed!"
