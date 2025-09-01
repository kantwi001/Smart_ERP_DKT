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

def configure_smtp_settings():
    """Configure basic SMTP settings for password reset emails"""
    
    print("🔧 Configuring SMTP Settings for Password Reset")
    print("=" * 50)
    
    # Create or update system settings with working SMTP configuration
    settings, created = SystemSettings.objects.get_or_create(
        id=1,
        defaults={
            'site_name': 'ERP System',
            'smtp_enabled': True,
            'smtp_host': 'localhost',  # Use local SMTP for testing
            'smtp_port': 1025,  # MailHog or similar local SMTP server
            'smtp_username': '',
            'smtp_password': '',
            'smtp_use_tls': False,
            'smtp_use_ssl': False,
            'smtp_from_email': 'noreply@erpsystem.local',
            'smtp_from_name': 'ERP System',
            'email_notifications': True,
            'password_reset_notifications': True
        }
    )
    
    # Update existing settings to use local SMTP
    if not created:
        settings.smtp_enabled = True
        settings.smtp_host = 'localhost'
        settings.smtp_port = 1025
        settings.smtp_username = ''
        settings.smtp_password = ''
        settings.smtp_use_tls = False
        settings.smtp_use_ssl = False
        settings.smtp_from_email = 'noreply@erpsystem.local'
        settings.smtp_from_name = 'ERP System'
        settings.email_notifications = True
        settings.password_reset_notifications = True
        settings.save()
        print("✅ Updated existing SMTP settings")
    else:
        print("✅ Created new SMTP settings")
    
    print(f"📧 SMTP Configuration:")
    print(f"  Host: {settings.smtp_host}")
    print(f"  Port: {settings.smtp_port}")
    print(f"  From Email: {settings.smtp_from_email}")
    print(f"  Enabled: {settings.smtp_enabled}")
    
    print(f"\n💡 For production, update these settings:")
    print("1. Use a real SMTP server (Gmail, SendGrid, etc.)")
    print("2. Set proper credentials")
    print("3. Enable TLS/SSL as needed")
    
    return True

if __name__ == '__main__':
    configure_smtp_settings()
