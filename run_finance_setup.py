#!/usr/bin/env python3
"""
Finance Module Setup Script
Executes all necessary steps to get the Finance module running
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def run_command(command, cwd=None, description=""):
    """Run a command and return success status"""
    print(f"🔧 {description}")
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            return True
        else:
            print(f"❌ {description} - Failed")
            print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - Timeout")
        return False
    except Exception as e:
        print(f"❌ {description} - Error: {e}")
        return False

def check_server(url, name):
    """Check if server is running"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"✅ {name} is running")
            return True
    except:
        pass
    print(f"❌ {name} is not responding")
    return False

def main():
    print("🚀 Starting Finance Module Setup...")
    print("=" * 50)
    
    # Project paths
    project_root = Path("/Users/kwadwoantwi/CascadeProjects/erp-system")
    backend_path = project_root / "backend"
    frontend_path = project_root / "frontend"
    
    # Step 1: Database migrations
    print("\n📊 Step 1: Running database migrations...")
    os.chdir(backend_path)
    
    if not run_command("python manage.py makemigrations accounting", 
                      cwd=backend_path, description="Creating migrations"):
        return False
        
    if not run_command("python manage.py migrate", 
                      cwd=backend_path, description="Applying migrations"):
        return False
    
    # Step 2: Initialize sample data
    print("\n📈 Step 2: Initializing sample finance data...")
    os.chdir(project_root)
    
    if not run_command("python initialize_finance_data.py", 
                      cwd=project_root, description="Loading sample data"):
        return False
    
    # Step 3: Kill existing servers
    print("\n🔧 Step 3: Cleaning up existing servers...")
    run_command("lsof -ti:8000 | xargs kill -9", description="Stopping backend server")
    run_command("lsof -ti:3000 | xargs kill -9", description="Stopping frontend server")
    time.sleep(2)
    
    # Step 4: Start backend server
    print("\n🔧 Step 4: Starting backend server...")
    os.chdir(backend_path)
    
    # Start backend in background
    backend_process = subprocess.Popen(
        ["python", "manage.py", "runserver", "8000"],
        cwd=backend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for backend to start
    print("⏳ Waiting for backend server to start...")
    for i in range(10):
        time.sleep(1)
        if check_server("http://localhost:8000/api/", "Backend server"):
            break
    else:
        print("❌ Backend server failed to start")
        return False
    
    # Step 5: Start frontend server
    print("\n⚛️  Step 5: Starting frontend server...")
    os.chdir(frontend_path)
    
    # Check if node_modules exists
    if not (frontend_path / "node_modules").exists():
        print("📦 Installing frontend dependencies...")
        if not run_command("npm install", cwd=frontend_path, 
                          description="Installing dependencies"):
            return False
    
    # Start frontend in background
    frontend_process = subprocess.Popen(
        ["npm", "start"],
        cwd=frontend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "BROWSER": "none"}  # Prevent auto-opening browser
    )
    
    # Wait for frontend to start
    print("⏳ Waiting for frontend server to start...")
    for i in range(30):  # Frontend takes longer to start
        time.sleep(1)
        try:
            response = requests.get("http://localhost:3000", timeout=2)
            if response.status_code == 200:
                print("✅ Frontend server is running")
                break
        except:
            continue
    else:
        print("❌ Frontend server failed to start")
        return False
    
    # Success message
    print("\n🎉 Finance Module Setup Complete!")
    print("=" * 50)
    print("✅ Backend server: http://localhost:8000")
    print("✅ Frontend app: http://localhost:3000")
    print("✅ Finance Dashboard: http://localhost:3000/finance")
    print(f"✅ Backend PID: {backend_process.pid}")
    print(f"✅ Frontend PID: {frontend_process.pid}")
    print("\n🎯 Ready for testing! Navigate to http://localhost:3000/finance")
    print("\n🔧 To stop servers:")
    print(f"   kill {backend_process.pid} {frontend_process.pid}")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✅ Setup completed successfully!")
