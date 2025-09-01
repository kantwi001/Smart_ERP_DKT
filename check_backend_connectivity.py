#!/usr/bin/env python3

import requests
import subprocess
import time
import os

def check_backend_connectivity():
    """Check if backend server is running and accessible"""
    
    print("🔍 Checking Backend Server Connectivity")
    print("=" * 50)
    
    backend_urls = [
        'http://localhost:2025',
        'http://127.0.0.1:2025',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ]
    
    # Test each URL
    for url in backend_urls:
        print(f"\n📡 Testing {url}...")
        try:
            response = requests.get(f"{url}/api/users/", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend accessible at {url}")
                print(f"   Status: {response.status_code}")
                return url
            else:
                print(f"⚠️  Backend responded with status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection refused - server not running on {url}")
        except requests.exceptions.Timeout:
            print(f"⏰ Timeout - server not responding on {url}")
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"\n🔍 Checking if Django server process is running...")
    try:
        # Check for Django processes
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        django_processes = [line for line in result.stdout.split('\n') if 'manage.py' in line and 'runserver' in line]
        
        if django_processes:
            print("✅ Found Django server processes:")
            for process in django_processes:
                print(f"   {process.strip()}")
        else:
            print("❌ No Django server processes found")
            print("\n🚀 To start the backend server:")
            print("   cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend")
            print("   python manage.py runserver 0.0.0.0:2025")
            
    except Exception as e:
        print(f"❌ Error checking processes: {str(e)}")
    
    # Check if virtual environment is activated
    print(f"\n🐍 Checking Python environment...")
    python_path = subprocess.run(['which', 'python'], capture_output=True, text=True)
    print(f"Python path: {python_path.stdout.strip()}")
    
    if 'presentation_env' in python_path.stdout:
        print("✅ Virtual environment is activated")
    else:
        print("⚠️  Virtual environment may not be activated")
        print("   Activate with: source /Users/kwadwoantwi/CascadeProjects/erp-system/presentation_env/bin/activate")
    
    # Check database connectivity
    print(f"\n🗄️  Checking database connectivity...")
    try:
        os.chdir('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')
        result = subprocess.run(['python', 'manage.py', 'check', '--database', 'default'], 
                              capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Database connection successful")
        else:
            print(f"❌ Database check failed:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error checking database: {str(e)}")
    
    print(f"\n📋 Quick Start Commands:")
    print("=" * 30)
    print("1. Activate virtual environment:")
    print("   source /Users/kwadwoantwi/CascadeProjects/erp-system/presentation_env/bin/activate")
    print("\n2. Start backend server:")
    print("   cd /Users/kwadwoantwi/CascadeProjects/erp-system/backend")
    print("   python manage.py runserver 0.0.0.0:2025")
    print("\n3. Start frontend (in new terminal):")
    print("   cd /Users/kwadwoantwi/CascadeProjects/erp-system/frontend")
    print("   PORT=3000 npm start")
    
    return None

if __name__ == '__main__':
    check_backend_connectivity()
