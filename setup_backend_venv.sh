#!/bin/bash

echo "Setting up ERP Backend Virtual Environment..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install Django and core dependencies
echo "Installing Django and dependencies..."
pip install django==4.2.7 djangorestframework django-cors-headers psycopg2-binary pillow

# Install additional requirements if file exists
if [ -f "requirements.txt" ]; then
    echo "Installing from requirements.txt..."
    pip install -r requirements.txt
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser
echo "Creating admin user..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created: admin/admin123')
else:
    print('Admin user already exists')
"

echo "Setup complete! To start the server, run:"
echo "cd backend && source venv/bin/activate && python manage.py runserver 2025"
