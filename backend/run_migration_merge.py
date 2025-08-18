#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    # Change to the backend directory
    backend_dir = '/Users/kwadwoantwi/CascadeProjects/erp-system/backend'
    os.chdir(backend_dir)
    
    # Set Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    try:
        # Run makemigrations --merge to resolve conflicts
        print("Running makemigrations --merge...")
        result = subprocess.run([sys.executable, 'manage.py', 'makemigrations', '--merge'], 
                              capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            # Run migrate to apply all migrations
            print("\nRunning migrate...")
            result = subprocess.run([sys.executable, 'manage.py', 'migrate'], 
                                  capture_output=True, text=True)
            print(result.stdout)
            if result.stderr:
                print("STDERR:", result.stderr)
            
            if result.returncode == 0:
                print("\n✅ Migration merge and apply completed successfully!")
            else:
                print("\n❌ Migration apply failed")
        else:
            print("\n❌ Migration merge failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
