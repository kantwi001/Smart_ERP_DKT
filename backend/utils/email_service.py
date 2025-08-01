import os
import logging
from typing import Dict, List, Optional, Any
from django.core.mail import send_mail, EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()
logger = logging.getLogger(__name__)

class EmailService:
    """
    Comprehensive email service for ERP system notifications
    Handles user registration, password reset, system alerts, security alerts,
    warehouse transfers, and other module notifications
    """
    
    def __init__(self):
        self.enabled = getattr(settings, 'NOTIFICATION_SETTINGS', {}).get('ENABLE_EMAIL_NOTIFICATIONS', True)
        self.retry_attempts = getattr(settings, 'NOTIFICATION_SETTINGS', {}).get('EMAIL_RETRY_ATTEMPTS', 3)
        self.retry_delay = getattr(settings, 'NOTIFICATION_SETTINGS', {}).get('EMAIL_RETRY_DELAY', 60)
        self.email_templates = getattr(settings, 'EMAIL_TEMPLATES', {})
    
    def get_smtp_settings(self):
        """Get dynamic SMTP settings from System Settings module"""
        try:
            from users.models import SystemSettings
            system_settings = SystemSettings.get_settings()
            
            if system_settings.smtp_enabled and system_settings.smtp_host:
                return {
                    'host': system_settings.smtp_host,
                    'port': system_settings.smtp_port,
                    'username': system_settings.smtp_username,
                    'password': system_settings.smtp_password,
                    'use_tls': system_settings.smtp_use_tls,
                    'use_ssl': system_settings.smtp_use_ssl,
                    'from_email': system_settings.smtp_from_email or settings.DEFAULT_FROM_EMAIL,
                    'from_name': system_settings.smtp_from_name,
                }
        except Exception as e:
            logger.error(f"Failed to get SMTP settings from System Settings: {str(e)}")
        
        # Fallback to Django settings
        return None
    
    def get_email_connection(self):
        """Get email connection using dynamic SMTP settings or Django defaults"""
        smtp_settings = self.get_smtp_settings()
        
        if smtp_settings:
            # Use dynamic SMTP settings from System Settings
            return get_connection(
                backend='django.core.mail.backends.smtp.EmailBackend',
                host=smtp_settings['host'],
                port=smtp_settings['port'],
                username=smtp_settings['username'],
                password=smtp_settings['password'],
                use_tls=smtp_settings['use_tls'],
                use_ssl=smtp_settings['use_ssl'],
                fail_silently=False,
            )
        else:
            # Use Django default settings
            return get_connection()
        
    def generate_password(self, length: int = 12) -> str:
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for i in range(length))
        return password
    
    def send_email(self, 
                   template_key: str,
                   recipient_email: str,
                   context: Dict[str, Any],
                   subject_override: Optional[str] = None,
                   sender_email: Optional[str] = None) -> bool:
        """
        Send email using template configuration
        
        Args:
            template_key: Key from EMAIL_TEMPLATES settings
            recipient_email: Recipient's email address
            context: Template context variables
            subject_override: Override default subject
            sender_email: Override default sender
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not self.enabled:
            logger.info(f"Email notifications disabled. Would send {template_key} to {recipient_email}")
            return True
            
        if not recipient_email:
            logger.error("No recipient email provided")
            return False
            
        template_config = self.email_templates.get(template_key)
        if not template_config:
            logger.error(f"Email template {template_key} not found")
            return False
            
        try:
            # Get dynamic SMTP settings
            smtp_settings = self.get_smtp_settings()
            connection = self.get_email_connection()
            
            subject = subject_override or template_config['subject']
            # Use dynamic from_email if available, otherwise fallback to settings
            if smtp_settings and smtp_settings.get('from_email'):
                from_email = f"{smtp_settings.get('from_name', 'ERP System')} <{smtp_settings['from_email']}>"
            else:
                from_email = sender_email or settings.DEFAULT_FROM_EMAIL
            
            # For development, use simple text email if template doesn't exist
            try:
                html_content = render_to_string(template_config['template'], context)
                text_content = strip_tags(html_content)
            except:
                # Fallback to simple text email for development
                text_content = self._generate_fallback_content(template_key, context)
                html_content = None
            
            if html_content:
                # Send HTML email
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=from_email,
                    to=[recipient_email],
                    connection=connection
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
            else:
                # Send plain text email
                send_mail(
                    subject=subject,
                    message=text_content,
                    from_email=from_email,
                    recipient_list=[recipient_email],
                    connection=connection,
                    fail_silently=False
                )
            
            logger.info(f"Email sent successfully: {template_key} to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email {template_key} to {recipient_email}: {str(e)}")
            return False
    
    def _generate_fallback_content(self, template_key: str, context: Dict[str, Any]) -> str:
        """Generate fallback email content when templates are not available"""
        if template_key == 'USER_REGISTRATION':
            return f"""
Welcome to ERP System!

Your account has been created successfully.

Account Details:
- Name: {context.get('user_name', 'N/A')}
- Email: {context.get('user_email', 'N/A')}
- Role: {context.get('user_role', 'N/A')}
- Department: {context.get('department_name', 'N/A')}
- Temporary Password: {context.get('password', 'N/A')}

Please log in and change your password immediately.

Best regards,
ERP System Team
            """
        elif template_key == 'PASSWORD_RESET':
            return f"""
Password Reset Request

Hello {context.get('user_name', 'User')},

A password reset was requested for your account.

Reset Link: {context.get('reset_link', 'N/A')}

If you did not request this reset, please ignore this email.

Best regards,
ERP System Team
            """
        elif template_key == 'WAREHOUSE_TRANSFER':
            return f"""
Warehouse Transfer Notification

A new warehouse transfer requires your attention:

Transfer ID: {context.get('transfer_id', 'N/A')}
From: {context.get('from_warehouse', 'N/A')}
To: {context.get('to_warehouse', 'N/A')}
Product: {context.get('product_name', 'N/A')}
Quantity: {context.get('quantity', 'N/A')}
Requested by: {context.get('requested_by', 'N/A')}

Please review and approve this transfer.

Best regards,
ERP System Team
            """
        elif template_key == 'SYSTEM_ALERT':
            return f"""
System Alert

Alert Type: {context.get('alert_type', 'N/A')}
Message: {context.get('message', 'N/A')}
Time: {context.get('timestamp', 'N/A')}

Please take appropriate action.

Best regards,
ERP System Team
            """
        elif template_key == 'SECURITY_ALERT':
            return f"""
Security Alert

A security event has occurred:

Event: {context.get('event_type', 'N/A')}
User: {context.get('user_name', 'N/A')}
IP Address: {context.get('ip_address', 'N/A')}
Time: {context.get('timestamp', 'N/A')}

Please review this activity.

Best regards,
ERP System Team
            """
        elif template_key == 'CUSTOMER_APPROVAL':
            return f"""
Customer Approval Required

A new customer registration requires approval:

Customer Name: {context.get('customer_name', 'N/A')}
Contact: {context.get('customer_contact', 'N/A')}
Address: {context.get('customer_address', 'N/A')}
Requested by: {context.get('requested_by', 'N/A')}

Please review and approve this customer.

Best regards,
ERP System Team
            """
        elif template_key == 'INVENTORY_ALERT':
            return f"""
Inventory Alert

Product: {context.get('product_name', 'N/A')}
Current Stock: {context.get('current_stock', 'N/A')}
Minimum Stock: {context.get('minimum_stock', 'N/A')}
Warehouse: {context.get('warehouse_name', 'N/A')}

Stock level is below minimum threshold.

Best regards,
ERP System Team
            """
        else:
            return f"""
ERP System Notification

You have received a new notification.

Details: {context}

Best regards,
ERP System Team
            """
    
    def send_user_registration_email(self, user, password: str, department_name: str = None) -> bool:
        """Send user registration email with credentials"""
        # Get user's full name from first_name and last_name
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        context = {
            'user_name': user_name,
            'user_email': user.email,
            'user_role': getattr(user, 'role', 'Employee'),
            'department_name': department_name or 'N/A',
            'password': password,
            'login_url': f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/login"
        }
        
        return self.send_email(
            template_key='USER_REGISTRATION',
            recipient_email=user.email,
            context=context
        )
    
    def send_password_reset_email(self, user, reset_link: str) -> bool:
        """Send password reset email"""
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        context = {
            'user_name': user_name,
            'reset_link': reset_link,
            'expiry_hours': 24
        }
        
        return self.send_email(
            template_key='PASSWORD_RESET',
            recipient_email=user.email,
            context=context
        )
    
    def send_warehouse_transfer_notification(self, transfer, recipient_email: str) -> bool:
        """Send warehouse transfer notification"""
        # Get requester name from User model fields
        if transfer.requested_by:
            requester_name = f"{transfer.requested_by.first_name} {transfer.requested_by.last_name}".strip() or transfer.requested_by.username
        else:
            requester_name = 'System'
            
        context = {
            'transfer_id': transfer.id,
            'from_warehouse': transfer.from_warehouse.name,
            'to_warehouse': transfer.to_warehouse.name,
            'product_name': transfer.product.name,
            'quantity': transfer.quantity,
            'requested_by': requester_name,
            'approval_url': f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/warehouse/approvals"
        }
        
        return self.send_email(
            template_key='WAREHOUSE_TRANSFER',
            recipient_email=recipient_email,
            context=context
        )
    
    def send_system_alert(self, alert_type: str, message: str, recipient_emails: List[str]) -> bool:
        """Send system alert to multiple recipients"""
        context = {
            'alert_type': alert_type,
            'message': message,
            'timestamp': str(timezone.now()) if 'timezone' in globals() else str(datetime.now())
        }
        
        success = True
        for email in recipient_emails:
            result = self.send_email(
                template_key='SYSTEM_ALERT',
                recipient_email=email,
                context=context
            )
            success = success and result
            
        return success
    
    def send_security_alert(self, event_type: str, user, ip_address: str, admin_emails: List[str]) -> bool:
        """Send security alert to administrators"""
        context = {
            'event_type': event_type,
            'user_name': user.name if user else 'Unknown',
            'user_email': user.email if user else 'Unknown',
            'ip_address': ip_address,
            'timestamp': str(timezone.now()) if 'timezone' in globals() else str(datetime.now())
        }
        
        success = True
        for email in admin_emails:
            result = self.send_email(
                template_key='SECURITY_ALERT',
                recipient_email=email,
                context=context
            )
            success = success and result
            
        return success
    
    def send_customer_approval_notification(self, customer, requested_by, manager_emails: List[str]) -> bool:
        """Send customer approval notification to managers"""
        context = {
            'customer_name': customer.name,
            'customer_contact': customer.contact_info,
            'customer_address': getattr(customer, 'address', 'N/A'),
            'requested_by': requested_by.name,
            'approval_url': f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/customers/approvals"
        }
        
        success = True
        for email in manager_emails:
            result = self.send_email(
                template_key='CUSTOMER_APPROVAL',
                recipient_email=email,
                context=context
            )
            success = success and result
            
        return success
    
    def send_inventory_alert(self, product, warehouse, current_stock: int, minimum_stock: int, recipient_emails: List[str]) -> bool:
        """Send inventory alert for low stock"""
        context = {
            'product_name': product.name,
            'product_sku': product.sku,
            'current_stock': current_stock,
            'minimum_stock': minimum_stock,
            'warehouse_name': warehouse.name,
            'reorder_url': f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/inventory/reorder"
        }
        
        success = True
        for email in recipient_emails:
            result = self.send_email(
                template_key='INVENTORY_ALERT',
                recipient_email=email,
                context=context
            )
            success = success and result
            
        return success

# Global email service instance
email_service = EmailService()
