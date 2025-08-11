#!/usr/bin/env python3

import os
import sys
import subprocess

def run_employee_sync():
    """Run the Employee record synchronization command"""
    print("🔄 Starting Employee Record Synchronization...")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    
    if not os.path.exists(backend_dir):
        print("❌ Backend directory not found!")
        return False
    
    os.chdir(backend_dir)
    
    # Check if manage.py exists
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found in backend directory!")
        return False
    
    print(f"✅ Changed to backend directory: {backend_dir}")
    
    # Try to run the sync command
    try:
        # Try python3 first
        result = subprocess.run([
            'python3', 'manage.py', 'sync_employee_records', '--fix-departments'
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Command executed successfully!")
            print("📄 Output:")
            print(result.stdout)
            if result.stderr:
                print("⚠️ Warnings:")
                print(result.stderr)
            return True
        else:
            print("❌ Command failed with python3, trying python...")
            # Try python as fallback
            result = subprocess.run([
                'python', 'manage.py', 'sync_employee_records', '--fix-departments'
            ], capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                print("✅ Command executed successfully with python!")
                print("📄 Output:")
                print(result.stdout)
                if result.stderr:
                    print("⚠️ Warnings:")
                    print(result.stderr)
                return True
            else:
                print("❌ Command failed with both python3 and python")
                print("Error output:", result.stderr)
                return False
                
    except subprocess.TimeoutExpired:
        print("❌ Command timed out after 60 seconds")
        return False
    except FileNotFoundError as e:
        print(f"❌ Python not found: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = run_employee_sync()
    if success:
        print("\n🎉 Employee record synchronization completed!")
        print("📋 Next steps:")
        print("  1. Refresh your Employee Dashboard in the browser")
        print("  2. Check if 'undefined undefined' is now showing proper names")
        print("  3. Verify department information is displaying correctly")
    else:
        print("\n❌ Synchronization failed. Please check the errors above.")
    
    sys.exit(0 if success else 1)
