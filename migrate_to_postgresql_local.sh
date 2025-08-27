#!/bin/bash

# ERP System PostgreSQL Migration Script (Local)
echo "🔄 Starting PostgreSQL migration for ERP System..."

# Detect Python executable
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python not found. Please install Python 3"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Check for virtual environment and activate if exists
if [ -d "presentation_env" ]; then
    echo "🔧 Activating virtual environment..."
    source presentation_env/bin/activate
elif [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
else
    echo "🔧 Creating virtual environment..."
    $PYTHON_CMD -m venv presentation_env
    source presentation_env/bin/activate
fi

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install django djangorestframework psycopg2-binary django-cors-headers djangorestframework-simplejwt

# Change to backend directory
cd backend

# Temporarily revert to SQLite for backup
echo "🔧 Temporarily reverting to SQLite for backup..."
cp config/settings.py config/settings.py.backup

# Create temporary SQLite settings
cat > config/settings_sqlite.py << 'EOF'
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-your-secret-key-here'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'users',
    'inventory',
    'hr',
    'sales',
    'accounting',
    'purchasing',
    'manufacturing',
    'pos',
    'reporting',
    'procurement',
    'warehouse',
    'surveys',
    'route_planning',
    'transactions',
    'notifications',
    'workflows',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
EOF

# Fix SQLite database by running migrations first
echo "🔧 Fixing SQLite database with migrations..."
DJANGO_SETTINGS_MODULE=config.settings_sqlite $PYTHON_CMD manage.py makemigrations
DJANGO_SETTINGS_MODULE=config.settings_sqlite $PYTHON_CMD manage.py migrate

# Backup SQLite data using temporary settings
echo "📦 Backing up SQLite data..."
DJANGO_SETTINGS_MODULE=config.settings_sqlite $PYTHON_CMD manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 4 > ../data_backup.json

if [ $? -eq 0 ]; then
    echo "✅ SQLite data backed up successfully"
else
    echo "⚠️ SQLite backup had issues, but continuing with migration..."
    # Create empty backup file to continue
    echo "[]" > ../data_backup.json
fi

# Restore original settings
rm config/settings_sqlite.py
mv config/settings.py.backup config/settings.py

# Set up PostgreSQL locally
echo "🐘 Setting up PostgreSQL database..."
chmod +x ../setup_postgresql_local.sh
../setup_postgresql_local.sh

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Test database connection
echo "🔍 Testing database connection..."
PGPASSWORD=erppassword psql -h localhost -U erpuser -d erp_system -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Cannot connect to PostgreSQL database"
    echo "Please ensure PostgreSQL is running: brew services start postgresql@14"
    exit 1
fi

echo "✅ Database connection successful"

# Create migrations
echo "🔧 Creating fresh migrations..."
$PYTHON_CMD manage.py makemigrations

# Run migrations
echo "🚀 Running migrations..."
$PYTHON_CMD manage.py migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi

# Load backed up data
echo "📥 Loading backed up data..."
$PYTHON_CMD manage.py loaddata ../data_backup.json

if [ $? -eq 0 ]; then
    echo "✅ Data loaded successfully"
else
    echo "⚠️ Some data may not have loaded properly - this is normal for initial setup"
fi

# Create superuser if needed
echo "👤 Creating superuser..."
$PYTHON_CMD manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='arkucollins@gmail.com').exists():
    User.objects.create_superuser(
        email='arkucollins@gmail.com',
        password='admin123',
        first_name='Collins',
        last_name='Arku'
    )
    print("Superuser created successfully")
else:
    print("Superuser already exists")
EOF

# Test final connection
echo "🔍 Final database test..."
$PYTHON_CMD manage.py dbshell << EOF
\dt
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL migration completed successfully!"
    echo ""
    echo "Database Details:"
    echo "- Host: localhost:5432"
    echo "- Database: erp_system"
    echo "- User: erpuser"
    echo "- Password: erppassword"
    echo ""
    echo "Login Credentials:"
    echo "- Email: arkucollins@gmail.com"
    echo "- Password: admin123"
    echo ""
    echo "Virtual environment is active. To deactivate: deactivate"
else
    echo "❌ Migration verification failed"
fi
