#!/usr/bin/env python3
import os
import subprocess
import sys

print("🚀 Executing Finance Module Setup Steps...")
print("=" * 50)

# Check for virtual environments
venv_paths = [
    '/Users/kwadwoantwi/CascadeProjects/erp-system/backend/venv/bin/python',
    '/Users/kwadwoantwi/CascadeProjects/erp-system/presentation_env/bin/python',
    '/Users/kwadwoantwi/CascadeProjects/erp-system/venv/bin/python'
]

python_cmd = None
for venv_path in venv_paths:
    if os.path.exists(venv_path):
        python_cmd = venv_path
        print(f"✅ Found virtual environment: {venv_path}")
        break

if not python_cmd:
    print("❌ No virtual environment found. Using system python3...")
    python_cmd = 'python3'

# Change to backend directory
backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
os.chdir(backend_dir)

# Step 1: Create and run migrations
print("\n📊 Step 1: Creating database migrations...")
try:
    result = subprocess.run([python_cmd, 'manage.py', 'makemigrations', 'accounting'], 
                          capture_output=True, text=True, cwd=backend_dir)
    if result.returncode == 0:
        print("✅ Migrations created successfully")
        if result.stdout.strip():
            print(result.stdout)
    else:
        print("❌ Migration creation failed:")
        print(result.stderr)
except Exception as e:
    print(f"❌ Error creating migrations: {e}")

print("\n📊 Applying database migrations...")
try:
    result = subprocess.run([python_cmd, 'manage.py', 'migrate'], 
                          capture_output=True, text=True, cwd=backend_dir)
    if result.returncode == 0:
        print("✅ Migrations applied successfully")
        if result.stdout.strip():
            print(result.stdout)
    else:
        print("❌ Migration failed:")
        print(result.stderr)
except Exception as e:
    print(f"❌ Error applying migrations: {e}")

# Step 2: Initialize sample data
print("\n📈 Step 2: Initializing sample finance data...")
project_root = '/Users/kwadwoantwi/CascadeProjects/erp-system'
try:
    result = subprocess.run([python_cmd, 'initialize_finance_data.py'], 
                          capture_output=True, text=True, cwd=project_root)
    if result.returncode == 0:
        print("✅ Sample data initialized successfully")
        if result.stdout.strip():
            print(result.stdout)
    else:
        print("❌ Sample data initialization failed:")
        print(result.stderr)
except Exception as e:
    print(f"❌ Error initializing sample data: {e}")

print("\n🎉 Setup steps completed!")
print("\n🚀 To start the servers:")
print(f"Backend: cd backend && {python_cmd} manage.py runserver 8000")
print("Frontend: cd frontend && npm start")
print("\n🎯 Then navigate to: http://localhost:3000/finance")
