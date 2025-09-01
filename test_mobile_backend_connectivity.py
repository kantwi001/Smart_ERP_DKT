#!/usr/bin/env python3

"""
Mobile Backend Connectivity Test Script
Tests the Fly.dev backend connectivity and API endpoints
to verify mobile app can reach the backend successfully.
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://backend-shy-sun-4450.fly.dev"
API_BASE_URL = f"{BACKEND_URL}/api"
TEST_CREDENTIALS = {
    "username": "arkucollins@gmail.com",
    "password": "admin123"
}

def print_header(title):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")

def print_result(test_name, success, message="", data=None):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if message:
        print(f"    {message}")
    if data and isinstance(data, dict):
        for key, value in data.items():
            print(f"    {key}: {value}")
    print()

def test_basic_connectivity():
    """Test basic connectivity to backend"""
    print_header("Basic Connectivity Tests")
    
    try:
        # Test main backend URL
        response = requests.get(BACKEND_URL, timeout=10)
        print_result(
            "Backend URL Reachable", 
            True, 
            f"Status: {response.status_code}",
            {"URL": BACKEND_URL, "Response Time": f"{response.elapsed.total_seconds():.2f}s"}
        )
    except requests.exceptions.RequestException as e:
        print_result("Backend URL Reachable", False, f"Error: {str(e)}")
        return False
    
    try:
        # Test API base URL
        response = requests.get(f"{API_BASE_URL}/", timeout=10)
        print_result(
            "API Base URL Reachable", 
            response.status_code in [200, 404],  # 404 is OK if no root API endpoint
            f"Status: {response.status_code}",
            {"URL": f"{API_BASE_URL}/", "Response Time": f"{response.elapsed.total_seconds():.2f}s"}
        )
    except requests.exceptions.RequestException as e:
        print_result("API Base URL Reachable", False, f"Error: {str(e)}")
        return False
    
    return True

def test_ssl_certificate():
    """Test SSL certificate validity"""
    print_header("SSL Certificate Tests")
    
    try:
        response = requests.get(BACKEND_URL, timeout=10, verify=True)
        print_result(
            "SSL Certificate Valid", 
            True, 
            "Certificate verification successful"
        )
    except requests.exceptions.SSLError as e:
        print_result("SSL Certificate Valid", False, f"SSL Error: {str(e)}")
        return False
    except requests.exceptions.RequestException as e:
        print_result("SSL Certificate Valid", False, f"Request Error: {str(e)}")
        return False
    
    return True

def test_authentication_endpoints():
    """Test authentication-related endpoints"""
    print_header("Authentication Endpoint Tests")
    
    # Test login endpoint exists
    try:
        login_url = f"{API_BASE_URL}/auth/login/"
        response = requests.post(
            login_url, 
            json={"username": "test", "password": "test"}, 
            timeout=10
        )
        
        # We expect 400 or 401 for invalid credentials, not 404
        endpoint_exists = response.status_code != 404
        print_result(
            "Login Endpoint Exists", 
            endpoint_exists,
            f"Status: {response.status_code}",
            {"URL": login_url}
        )
        
        if not endpoint_exists:
            return False
            
    except requests.exceptions.RequestException as e:
        print_result("Login Endpoint Exists", False, f"Error: {str(e)}")
        return False
    
    # Test actual login with valid credentials
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login/",
            json=TEST_CREDENTIALS,
            timeout=10
        )
        
        login_success = response.status_code == 200
        if login_success:
            try:
                data = response.json()
                has_token = 'access' in data or 'token' in data
                print_result(
                    "Login with Valid Credentials", 
                    has_token,
                    f"Status: {response.status_code}",
                    {"Token Present": has_token}
                )
                return data if has_token else None
            except json.JSONDecodeError:
                print_result("Login with Valid Credentials", False, "Invalid JSON response")
                return None
        else:
            print_result(
                "Login with Valid Credentials", 
                False,
                f"Status: {response.status_code}, Response: {response.text[:200]}"
            )
            return None
            
    except requests.exceptions.RequestException as e:
        print_result("Login with Valid Credentials", False, f"Error: {str(e)}")
        return None

def test_authenticated_endpoints(auth_data):
    """Test endpoints that require authentication"""
    print_header("Authenticated Endpoint Tests")
    
    if not auth_data:
        print_result("Authenticated Endpoints", False, "No authentication token available")
        return False
    
    # Extract token
    token = auth_data.get('access') or auth_data.get('token')
    if not token:
        print_result("Authenticated Endpoints", False, "No token found in auth response")
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test user profile endpoint
    try:
        response = requests.get(
            f"{API_BASE_URL}/auth/user/",
            headers=headers,
            timeout=10
        )
        
        profile_success = response.status_code == 200
        if profile_success:
            try:
                user_data = response.json()
                print_result(
                    "User Profile Endpoint", 
                    True,
                    f"Status: {response.status_code}",
                    {
                        "Username": user_data.get('username', 'N/A'),
                        "Email": user_data.get('email', 'N/A'),
                        "Is Staff": user_data.get('is_staff', 'N/A')
                    }
                )
            except json.JSONDecodeError:
                print_result("User Profile Endpoint", False, "Invalid JSON response")
        else:
            print_result(
                "User Profile Endpoint", 
                False,
                f"Status: {response.status_code}, Response: {response.text[:200]}"
            )
            
    except requests.exceptions.RequestException as e:
        print_result("User Profile Endpoint", False, f"Error: {str(e)}")
        return False
    
    return True

def test_cors_headers():
    """Test CORS headers for mobile app compatibility"""
    print_header("CORS Headers Tests")
    
    try:
        # Test preflight request
        response = requests.options(
            f"{API_BASE_URL}/auth/login/",
            headers={
                "Origin": "capacitor://localhost",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=10
        )
        
        cors_enabled = (
            response.status_code in [200, 204] and
            'Access-Control-Allow-Origin' in response.headers
        )
        
        print_result(
            "CORS Headers Present", 
            cors_enabled,
            f"Status: {response.status_code}",
            {
                "Access-Control-Allow-Origin": response.headers.get('Access-Control-Allow-Origin', 'Missing'),
                "Access-Control-Allow-Methods": response.headers.get('Access-Control-Allow-Methods', 'Missing')
            }
        )
        
    except requests.exceptions.RequestException as e:
        print_result("CORS Headers Present", False, f"Error: {str(e)}")
        return False
    
    return True

def test_mobile_specific_endpoints():
    """Test mobile-specific functionality"""
    print_header("Mobile-Specific Tests")
    
    # Test with mobile user agent
    mobile_headers = {
        "User-Agent": "SmartERPMobile/1.0 (Mobile; Capacitor)"
    }
    
    try:
        response = requests.get(
            f"{API_BASE_URL}/",
            headers=mobile_headers,
            timeout=10
        )
        
        print_result(
            "Mobile User Agent Accepted", 
            response.status_code != 403,
            f"Status: {response.status_code}"
        )
        
    except requests.exceptions.RequestException as e:
        print_result("Mobile User Agent Accepted", False, f"Error: {str(e)}")
        return False
    
    return True

def main():
    """Run all connectivity tests"""
    print_header(f"Mobile Backend Connectivity Test - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Testing backend: {BACKEND_URL}")
    print(f"API base URL: {API_BASE_URL}")
    print(f"Test credentials: {TEST_CREDENTIALS['username']}")
    
    all_tests_passed = True
    
    # Run tests in sequence
    tests = [
        ("Basic Connectivity", test_basic_connectivity),
        ("SSL Certificate", test_ssl_certificate),
        ("CORS Headers", test_cors_headers),
        ("Mobile Specific", test_mobile_specific_endpoints),
    ]
    
    auth_data = None
    for test_name, test_func in tests:
        try:
            if test_name == "Authentication":
                auth_data = test_func()
                if not auth_data:
                    all_tests_passed = False
            else:
                result = test_func()
                if not result:
                    all_tests_passed = False
        except Exception as e:
            print_result(test_name, False, f"Unexpected error: {str(e)}")
            all_tests_passed = False
    
    # Test authentication separately to capture auth data
    auth_data = test_authentication_endpoints()
    if not auth_data:
        all_tests_passed = False
    
    # Test authenticated endpoints if we have auth data
    if auth_data:
        result = test_authenticated_endpoints(auth_data)
        if not result:
            all_tests_passed = False
    
    # Final summary
    print_header("Test Summary")
    if all_tests_passed:
        print("🎉 All tests passed! Mobile app should be able to connect to the backend.")
        print("\nNext steps:")
        print("1. Install the updated APK on your mobile device")
        print("2. Test login with credentials: arkucollins@gmail.com / admin123")
        print("3. Verify user role detection and app functionality")
    else:
        print("❌ Some tests failed. Please review the results above.")
        print("\nTroubleshooting:")
        print("1. Verify the backend is running and accessible")
        print("2. Check network connectivity from your location")
        print("3. Ensure the Fly.dev app is deployed and healthy")
        print("4. Review backend logs for any errors")
    
    return 0 if all_tests_passed else 1

if __name__ == "__main__":
    sys.exit(main())
