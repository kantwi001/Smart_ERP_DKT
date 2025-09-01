#!/bin/bash

echo "🚀 Starting Backend with PostgreSQL Database"
echo "============================================"

# Get current network IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi

echo "📱 Network IP: $LOCAL_IP"
echo "🌐 Backend will be accessible at: http://$LOCAL_IP:2025"

# Step 1: Check and start PostgreSQL
echo ""
echo "1️⃣ Checking PostgreSQL database..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🔧 Starting PostgreSQL service..."
    brew services start postgresql
    sleep 3
fi

# Verify PostgreSQL is running
if pgrep -x "postgres" > /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

# Step 2: Navigate to backend and setup environment
echo ""
echo "2️⃣ Setting up backend environment..."
cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
fi

# Step 3: Check database connection
echo ""
echo "3️⃣ Verifying database connection..."
python -c "
import psycopg2
try:
    conn = psycopg2.connect(
        host='localhost',
        port='5432',
        database='erp_system',
        user='erpuser',
        password='erppassword'
    )
    print('✅ Database connection successful')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed"
    echo "🔧 Creating database and user..."
    
    # Create database and user if they don't exist
    createdb erp_system 2>/dev/null || echo "Database already exists"
    createuser erpuser 2>/dev/null || echo "User already exists"
    psql -c "ALTER USER erpuser WITH PASSWORD 'erppassword';" 2>/dev/null
    psql -c "GRANT ALL PRIVILEGES ON DATABASE erp_system TO erpuser;" 2>/dev/null
    
    echo "✅ Database setup completed"
fi

# Step 4: Install dependencies if needed
echo ""
echo "4️⃣ Installing Python dependencies..."
if [ ! -f "requirements_installed.flag" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
    pip install psycopg2-binary  # Ensure PostgreSQL adapter is installed
    touch requirements_installed.flag
fi

# Step 5: Run migrations
echo ""
echo "5️⃣ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Step 6: Create superuser if needed
echo ""
echo "6️⃣ Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='arkucollins').exists():
    User.objects.create_superuser('arkucollins', 'arkucollins@gmail.com', 'admin123')
    print('✅ Superuser created: arkucollins')
else:
    print('✅ Superuser already exists: arkucollins')
"

# Step 7: Kill existing backend processes
echo ""
echo "7️⃣ Stopping existing backend processes..."
lsof -ti:2025 | xargs kill -9 2>/dev/null || true
echo "✅ Cleared port 2025"

# Step 8: Start Django server
echo ""
echo "8️⃣ Starting Django server with PostgreSQL..."
echo "🌐 Backend accessible at:"
echo "   - Web: http://localhost:2025"
echo "   - iOS: http://localhost:2025"
echo "   - Android: http://$LOCAL_IP:2025"
echo ""
echo "📱 Mobile apps can now connect to the backend!"
echo "🔧 Press Ctrl+C to stop the server"
echo ""

# Start the server on all interfaces
python manage.py runserver 0.0.0.0:2025
