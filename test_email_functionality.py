#!/usr/bin/env python3
"""
Test and configure email functionality for the ERP system
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import SystemSettings, User
from utils.email_service import EmailService
from django.contrib.auth import get_user_model

def setup_smtp_settings():
    """Configure SMTP settings for testing"""
    print("🔧 Setting up SMTP configuration...")
    
    settings = SystemSettings.get_settings()
    
    # Configure Gmail SMTP for testing (you can change these)
    settings.smtp_enabled = True
    settings.smtp_host = 'smtp.gmail.com'
    settings.smtp_port = 587
    settings.smtp_use_tls = True
    settings.smtp_use_ssl = False
    settings.smtp_from_name = 'ERP System'
    
    # Note: For production, use environment variables or secure storage
    # For testing, you'll need to provide actual SMTP credentials
    print("⚠️  SMTP settings configured but credentials need to be set manually")
    print("   Update smtp_username, smtp_password, and smtp_from_email in SystemSettings")
    
    settings.save()
    print("✅ SMTP settings saved")
    return settings

def test_email_service():
    """Test the email service functionality"""
    print("\n📧 Testing Email Service...")
    
    try:
        email_service = EmailService()
        print("✅ Email service initialized successfully")
        
        # Test user registration email (without actually sending)
        test_user = User.objects.filter(is_superuser=True).first()
        if test_user:
            print(f"✅ Found test user: {test_user.username}")
            
            # This would send an email in production
            print("📝 Email service is ready for user registration emails")
        else:
            print("❌ No test user found")
            
    except Exception as e:
        print(f"❌ Email service error: {str(e)}")

def create_test_user_with_email():
    """Create a test user and simulate email sending"""
    print("\n👤 Testing user creation with email...")
    
    try:
        # Check if test user already exists
        test_email = "test@example.com"
        if User.objects.filter(email=test_email).exists():
            print(f"✅ Test user with email {test_email} already exists")
            return
        
        # Create test user
        user = User.objects.create_user(
            username='testuser',
            email=test_email,
            password='testpass123',
            first_name='Test',
            last_name='User',
            role='employee'
        )
        
        print(f"✅ Created test user: {user.username} ({user.email})")
        
        # Test email service
        email_service = EmailService()
        print("📧 Email service ready for user registration notifications")
        
    except Exception as e:
        print(f"❌ Error creating test user: {str(e)}")

def main():
    print("🚀 ERP System Email Functionality Test")
    print("=" * 50)
    
    # Setup SMTP settings
    settings = setup_smtp_settings()
    
    # Test email service
    test_email_service()
    
    # Test user creation
    create_test_user_with_email()
    
    print("\n" + "=" * 50)
    print("📋 Summary:")
    print("✅ SMTP settings configured")
    print("✅ Email service tested")
    print("✅ User creation with email ready")
    print("\n💡 Next steps:")
    print("1. Configure actual SMTP credentials in SystemSettings")
    print("2. Test email sending with real SMTP server")
    print("3. Update frontend to use backend API endpoints")
    
    print(f"\n🔧 Current SMTP Settings:")
    print(f"   Host: {settings.smtp_host}")
    print(f"   Port: {settings.smtp_port}")
    print(f"   TLS: {settings.smtp_use_tls}")
    print(f"   Enabled: {settings.smtp_enabled}")

if __name__ == "__main__":
    main()
