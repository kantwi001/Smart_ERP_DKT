#!/usr/bin/env python3

import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/Users/kwadwoantwi/CascadeProjects/erp-system/backend')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import SystemSettings
from utils.email_service import email_service
from django.contrib.auth import get_user_model

User = get_user_model()

def fix_password_reset_email():
    """Fix password reset email functionality by configuring SMTP settings"""
    
    print("🔧 Fixing Password Reset Email Configuration")
    print("=" * 60)
    
    # Get or create system settings
    try:
        settings, created = SystemSettings.objects.get_or_create(
            id=1,
            defaults={
                'site_name': 'ERP System',
                'smtp_enabled': True,
                'smtp_host': 'smtp.gmail.com',
                'smtp_port': 587,
                'smtp_username': 'your-email@gmail.com',
                'smtp_password': 'your-app-password',
                'smtp_use_tls': True,
                'smtp_use_ssl': False,
                'smtp_from_email': 'noreply@erpsystem.com',
                'smtp_from_name': 'ERP System',
                'email_notifications': True,
                'password_reset_notifications': True
            }
        )
        
        if created:
            print("✅ Created new system settings with default SMTP configuration")
        else:
            print("✅ Found existing system settings")
            
        print(f"📧 SMTP Configuration:")
        print(f"  Host: {settings.smtp_host}")
        print(f"  Port: {settings.smtp_port}")
        print(f"  Username: {settings.smtp_username}")
        print(f"  TLS: {settings.smtp_use_tls}")
        print(f"  From Email: {settings.smtp_from_email}")
        print(f"  Email Notifications: {settings.email_notifications}")
        print(f"  Password Reset Notifications: {settings.password_reset_notifications}")
        
    except Exception as e:
        print(f"❌ Error configuring system settings: {str(e)}")
        return False
    
    # Test email service configuration
    print(f"\n🔍 Testing Email Service Configuration...")
    try:
        # Initialize email service with current settings
        email_service.configure_smtp()
        print("✅ Email service configured successfully")
        
        # Test with a sample user (if exists)
        test_user = User.objects.filter(email='edmondsekyere@gmail.com').first()
        if test_user:
            print(f"📧 Testing password reset email for: {test_user.email}")
            
            # Generate test reset link
            test_reset_link = "https://erp.tarinnovation.com/reset-password/test/token/"
            
            # Try to send password reset email
            try:
                success = email_service.send_password_reset_email(test_user, test_reset_link)
                if success:
                    print("✅ Password reset email sent successfully!")
                else:
                    print("❌ Failed to send password reset email")
            except Exception as email_error:
                print(f"❌ Email sending error: {str(email_error)}")
                print("💡 This might be due to missing SMTP credentials")
                
        else:
            print("⚠️  No test user found (edmondsekyere@gmail.com)")
            
    except Exception as e:
        print(f"❌ Email service configuration error: {str(e)}")
        
    # Provide configuration instructions
    print(f"\n📝 Configuration Instructions:")
    print("=" * 60)
    print("To fix password reset emails, you need to:")
    print("1. Set up proper SMTP credentials in SystemSettings")
    print("2. For Gmail, use an App Password (not your regular password)")
    print("3. Enable 2-factor authentication on Gmail")
    print("4. Generate an App Password: https://myaccount.google.com/apppasswords")
    print("5. Update the SMTP settings in the admin panel or database")
    
    print(f"\n🔧 Quick Fix Commands:")
    print("=" * 60)
    print("# Update SMTP settings in Django admin or run:")
    print("python manage.py shell")
    print("from users.models import SystemSettings")
    print("settings = SystemSettings.objects.get(id=1)")
    print("settings.smtp_username = 'your-email@gmail.com'")
    print("settings.smtp_password = 'your-app-password'")
    print("settings.save()")
    
    print(f"\n✅ Password reset email configuration check completed!")
    return True

if __name__ == '__main__':
    fix_password_reset_email()
