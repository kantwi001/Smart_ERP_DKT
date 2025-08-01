#!/usr/bin/env python3
"""
🔍 ERP System Health Check & Status Script
Comprehensive system verification for demo readiness
"""

import requests
import json
import sys
import time
from datetime import datetime

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header():
    print(f"\n{Colors.PURPLE}{Colors.BOLD}🚀 ERP SYSTEM HEALTH CHECK{Colors.END}")
    print(f"{Colors.CYAN}{'='*50}{Colors.END}")
    print(f"{Colors.WHITE}Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.END}\n")

def check_backend():
    """Check Django backend server status"""
    print(f"{Colors.BLUE}🔧 Checking Backend Server...{Colors.END}")
    
    try:
        # Check admin interface
        response = requests.get('http://localhost:2025/admin/', timeout=5)
        if response.status_code == 200:
            print(f"  {Colors.GREEN}✅ Django Admin: ONLINE{Colors.END}")
        else:
            print(f"  {Colors.RED}❌ Django Admin: ERROR (Status: {response.status_code}){Colors.END}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"  {Colors.RED}❌ Django Backend: OFFLINE{Colors.END}")
        print(f"  {Colors.YELLOW}   Error: {str(e)}{Colors.END}")
        return False
    
    # Check API endpoints
    endpoints = [
        '/inventory/products/',
        '/sales/',
        '/hr/employees/',
        '/accounting/invoices/',
        '/pos/transactions/'
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f'http://localhost:2025{endpoint}', timeout=3)
            if response.status_code in [200, 401]:  # 401 is expected without auth
                print(f"  {Colors.GREEN}✅ API {endpoint}: ACCESSIBLE{Colors.END}")
            else:
                print(f"  {Colors.YELLOW}⚠️  API {endpoint}: STATUS {response.status_code}{Colors.END}")
        except:
            print(f"  {Colors.RED}❌ API {endpoint}: UNREACHABLE{Colors.END}")
    
    return True

def check_frontend():
    """Check React frontend server status"""
    print(f"\n{Colors.BLUE}⚛️  Checking Frontend Server...{Colors.END}")
    
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print(f"  {Colors.GREEN}✅ React Frontend: ONLINE{Colors.END}")
            
            # Check if it's the React app (look for React-specific content)
            if 'react' in response.text.lower() or 'root' in response.text:
                print(f"  {Colors.GREEN}✅ React App: LOADED{Colors.END}")
            else:
                print(f"  {Colors.YELLOW}⚠️  React App: UNEXPECTED CONTENT{Colors.END}")
            
            return True
        else:
            print(f"  {Colors.RED}❌ Frontend: ERROR (Status: {response.status_code}){Colors.END}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"  {Colors.RED}❌ React Frontend: OFFLINE{Colors.END}")
        print(f"  {Colors.YELLOW}   Error: {str(e)}{Colors.END}")
        return False

def check_database():
    """Check database connectivity through Django admin"""
    print(f"\n{Colors.BLUE}🗄️  Checking Database Connectivity...{Colors.END}")
    
    try:
        # Try to access an endpoint that requires database
        response = requests.get('http://localhost:2025/admin/auth/user/', timeout=5)
        if response.status_code in [200, 302, 401]:  # These indicate DB is accessible
            print(f"  {Colors.GREEN}✅ Database: CONNECTED{Colors.END}")
            return True
        else:
            print(f"  {Colors.YELLOW}⚠️  Database: STATUS {response.status_code}{Colors.END}")
            return False
    except:
        print(f"  {Colors.RED}❌ Database: CONNECTION FAILED{Colors.END}")
        return False

def check_critical_features():
    """Check critical ERP features"""
    print(f"\n{Colors.BLUE}🎯 Checking Critical Features...{Colors.END}")
    
    features = [
        ("Inventory Management", "http://localhost:3000/inventory"),
        ("Sales Dashboard", "http://localhost:3000/sales"),
        ("Accounting Module", "http://localhost:3000/accounting"),
        ("HR Dashboard", "http://localhost:3000/hr"),
        ("POS System", "http://localhost:3000/pos"),
        ("Manufacturing", "http://localhost:3000/manufacturing"),
        ("Procurement", "http://localhost:3000/procurement"),
        ("Customers", "http://localhost:3000/customers"),
        ("Reporting", "http://localhost:3000/reporting")
    ]
    
    accessible_count = 0
    for feature_name, url in features:
        try:
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                print(f"  {Colors.GREEN}✅ {feature_name}: ACCESSIBLE{Colors.END}")
                accessible_count += 1
            else:
                print(f"  {Colors.YELLOW}⚠️  {feature_name}: STATUS {response.status_code}{Colors.END}")
        except:
            print(f"  {Colors.RED}❌ {feature_name}: UNREACHABLE{Colors.END}")
    
    print(f"\n  {Colors.CYAN}📊 Feature Accessibility: {accessible_count}/{len(features)} modules{Colors.END}")
    return accessible_count >= len(features) * 0.8  # 80% success rate

def check_demo_readiness():
    """Check if system is ready for demo"""
    print(f"\n{Colors.BLUE}🎪 Demo Readiness Check...{Colors.END}")
    
    checks = []
    
    # Check if both servers are running
    backend_ok = check_backend_simple()
    frontend_ok = check_frontend_simple()
    
    checks.append(("Backend Server", backend_ok))
    checks.append(("Frontend Server", frontend_ok))
    
    # Check critical pages
    critical_pages = [
        ("Main Dashboard", "http://localhost:3000/"),
        ("Inventory Dashboard", "http://localhost:3000/inventory"),
        ("Sales Dashboard", "http://localhost:3000/sales"),
        ("Accounting Dashboard", "http://localhost:3000/accounting")
    ]
    
    for page_name, url in critical_pages:
        try:
            response = requests.get(url, timeout=3)
            page_ok = response.status_code == 200
            checks.append((page_name, page_ok))
        except:
            checks.append((page_name, False))
    
    # Display results
    passed = sum(1 for _, status in checks if status)
    total = len(checks)
    
    for check_name, status in checks:
        status_icon = f"{Colors.GREEN}✅" if status else f"{Colors.RED}❌"
        print(f"  {status_icon} {check_name}{Colors.END}")
    
    success_rate = (passed / total) * 100
    
    if success_rate >= 90:
        print(f"\n  {Colors.GREEN}{Colors.BOLD}🎉 DEMO READY! ({success_rate:.0f}% checks passed){Colors.END}")
        return True
    elif success_rate >= 70:
        print(f"\n  {Colors.YELLOW}{Colors.BOLD}⚠️  MOSTLY READY ({success_rate:.0f}% checks passed){Colors.END}")
        return False
    else:
        print(f"\n  {Colors.RED}{Colors.BOLD}❌ NOT READY ({success_rate:.0f}% checks passed){Colors.END}")
        return False

def check_backend_simple():
    """Simple backend check"""
    try:
        response = requests.get('http://localhost:2025/admin/', timeout=3)
        return response.status_code == 200
    except:
        return False

def check_frontend_simple():
    """Simple frontend check"""
    try:
        response = requests.get('http://localhost:3000', timeout=3)
        return response.status_code == 200
    except:
        return False

def print_recommendations():
    """Print recommendations for fixing issues"""
    print(f"\n{Colors.BLUE}💡 Troubleshooting Recommendations:{Colors.END}")
    print(f"  {Colors.WHITE}• Backend Issues: Run 'python manage.py runserver 0.0.0.0:2025' in backend/")
    print(f"  {Colors.WHITE}• Frontend Issues: Run 'npm start' in frontend/")
    print(f"  {Colors.WHITE}• Database Issues: Run 'python manage.py migrate'")
    print(f"  {Colors.WHITE}• Quick Start: Use './start_demo.sh' from project root")
    print(f"  {Colors.WHITE}• Port Conflicts: Check if ports 2025 and 3000 are available{Colors.END}")

def print_demo_info():
    """Print demo information"""
    print(f"\n{Colors.PURPLE}{Colors.BOLD}🎪 DEMO INFORMATION{Colors.END}")
    print(f"{Colors.CYAN}{'='*30}{Colors.END}")
    print(f"{Colors.WHITE}Frontend URL: http://localhost:3000")
    print(f"Backend URL:  http://localhost:2025")
    print(f"Admin Panel:  http://localhost:2025/admin")
    print(f"Demo Script:  DEMO_WALKTHROUGH.md")
    print(f"Testing Guide: TESTING_GUIDE.md{Colors.END}")

def main():
    """Main health check function"""
    print_header()
    
    # Run all checks
    backend_status = check_backend()
    frontend_status = check_frontend()
    database_status = check_database()
    features_status = check_critical_features()
    demo_ready = check_demo_readiness()
    
    # Overall status
    print(f"\n{Colors.PURPLE}{Colors.BOLD}📋 OVERALL SYSTEM STATUS{Colors.END}")
    print(f"{Colors.CYAN}{'='*40}{Colors.END}")
    
    if all([backend_status, frontend_status, database_status, features_status]):
        print(f"{Colors.GREEN}{Colors.BOLD}🎉 SYSTEM STATUS: EXCELLENT{Colors.END}")
        print(f"{Colors.GREEN}   All components are running perfectly!{Colors.END}")
    elif backend_status and frontend_status:
        print(f"{Colors.YELLOW}{Colors.BOLD}⚠️  SYSTEM STATUS: GOOD{Colors.END}")
        print(f"{Colors.YELLOW}   Core components running, minor issues detected{Colors.END}")
    else:
        print(f"{Colors.RED}{Colors.BOLD}❌ SYSTEM STATUS: NEEDS ATTENTION{Colors.END}")
        print(f"{Colors.RED}   Critical components not running properly{Colors.END}")
        print_recommendations()
    
    print_demo_info()
    
    # Exit code for scripting
    return 0 if demo_ready else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
