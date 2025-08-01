from django.core.mail import send_mail
from django.template import Template, Context
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging
import json

from .models import Notification, NotificationChannel, NotificationTemplate, TransferApproval
from users.models import SystemSettings

logger = logging.getLogger(__name__)

class NotificationService:
    """Service for sending notifications through multiple channels"""
    
    def __init__(self):
        self.system_settings = SystemSettings.get_settings()
    
    def send_transfer_approval_request(self, transfer, recipient):
        """Send transfer approval request to warehouse rep via all enabled channels"""
        notifications_sent = []
        
        # Get enabled notification channels
        channels = NotificationChannel.objects.filter(is_enabled=True)
        
        for channel in channels:
            try:
                notification = self._create_notification(
                    recipient=recipient,
                    sender=transfer.requested_by,
                    channel=channel,
                    notification_type='transfer_request',
                    reference_id=str(transfer.id),
                    reference_type='transfer',
                    context_data={
                        'transfer': transfer,
                        'recipient': recipient,
                        'product': transfer.product,
                        'quantity': transfer.quantity,
                        'from_location': transfer.from_location,
                        'to_location': transfer.to_location,
                        'requested_by': transfer.requested_by,
                        'approval_url': f"{settings.FRONTEND_URL}/warehouse/transfers/{transfer.id}/approve"
                    }
                )
                
                if self._send_notification(notification):
                    notifications_sent.append({
                        'channel': channel.name,
                        'status': 'sent',
                        'sent_at': timezone.now().isoformat()
                    })
                else:
                    notifications_sent.append({
                        'channel': channel.name,
                        'status': 'failed',
                        'sent_at': timezone.now().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"Failed to send notification via {channel.name}: {str(e)}")
                notifications_sent.append({
                    'channel': channel.name,
                    'status': 'error',
                    'error': str(e),
                    'sent_at': timezone.now().isoformat()
                })
        
        return notifications_sent
    
    def send_transfer_status_update(self, transfer, status, recipient=None):
        """Send transfer status update notification"""
        if not recipient:
            recipient = transfer.requested_by
        
        notification_type = f'transfer_{status}'
        channels = NotificationChannel.objects.filter(is_enabled=True)
        
        for channel in channels:
            try:
                notification = self._create_notification(
                    recipient=recipient,
                    sender=None,
                    channel=channel,
                    notification_type=notification_type,
                    reference_id=str(transfer.id),
                    reference_type='transfer',
                    context_data={
                        'transfer': transfer,
                        'recipient': recipient,
                        'status': status,
                        'product': transfer.product,
                        'quantity': transfer.quantity,
                        'from_location': transfer.from_location,
                        'to_location': transfer.to_location,
                    }
                )
                
                self._send_notification(notification)
                
            except Exception as e:
                logger.error(f"Failed to send status update via {channel.name}: {str(e)}")
    
    def _create_notification(self, recipient, channel, notification_type, reference_id, reference_type, sender=None, context_data=None):
        """Create a notification record"""
        try:
            template = NotificationTemplate.objects.get(
                template_type=notification_type,
                channel=channel,
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            # Create default template if none exists
            template = self._create_default_template(notification_type, channel)
        
        # Render template with context
        context = Context(context_data or {})
        subject = Template(template.subject_template).render(context) if template.subject_template else ""
        message = Template(template.body_template).render(context)
        
        notification = Notification.objects.create(
            recipient=recipient,
            sender=sender,
            channel=channel,
            template=template,
            subject=subject,
            message=message,
            notification_type=notification_type,
            reference_id=reference_id,
            reference_type=reference_type,
            requires_response=(notification_type == 'transfer_request')
        )
        
        return notification
    
    def _send_notification(self, notification):
        """Send notification via appropriate channel"""
        try:
            if notification.channel.channel_type == 'email':
                return self._send_email(notification)
            elif notification.channel.channel_type == 'sms':
                return self._send_sms(notification)
            elif notification.channel.channel_type == 'push':
                return self._send_push(notification)
            else:
                logger.warning(f"Unknown channel type: {notification.channel.channel_type}")
                return False
        except Exception as e:
            logger.error(f"Failed to send notification {notification.id}: {str(e)}")
            notification.status = 'failed'
            notification.save()
            return False
    
    def _send_email(self, notification):
        """Send email notification"""
        if not self.system_settings.smtp_enabled:
            logger.warning("SMTP is not enabled in system settings")
            return False
        
        try:
            send_mail(
                subject=notification.subject,
                message=notification.message,
                from_email=self.system_settings.smtp_from_email or settings.DEFAULT_FROM_EMAIL,
                recipient_list=[notification.recipient.email],
                fail_silently=False,
            )
            
            notification.mark_as_sent()
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {notification.recipient.email}: {str(e)}")
            notification.status = 'failed'
            notification.save()
            return False
    
    def _send_sms(self, notification):
        """Send SMS notification (placeholder - integrate with SMS provider)"""
        # TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
        logger.info(f"SMS notification would be sent to {notification.recipient.username}: {notification.message}")
        
        # For demo purposes, mark as sent
        notification.mark_as_sent()
        return True
    
    def _send_push(self, notification):
        """Send push notification (placeholder - integrate with push service)"""
        # TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        logger.info(f"Push notification would be sent to {notification.recipient.username}: {notification.message}")
        
        # For demo purposes, mark as sent
        notification.mark_as_sent()
        return True
    
    def _create_default_template(self, notification_type, channel):
        """Create default notification template"""
        templates = {
            'transfer_request': {
                'email': {
                    'subject': 'Stock Transfer Approval Required - {{ product.name }}',
                    'body': '''Dear {{ recipient.first_name|default:recipient.username }},

A stock transfer request requires your approval:

Product: {{ product.name }}
Quantity: {{ quantity }}
From: {{ from_location }}
To: {{ to_location }}
Requested by: {{ requested_by.first_name|default:requested_by.username }}

Please review and approve this transfer at: {{ approval_url }}

Best regards,
ERP System'''
                },
                'sms': {
                    'subject': '',
                    'body': 'Transfer approval needed: {{ quantity }} x {{ product.name }} from {{ from_location }} to {{ to_location }}. Check your dashboard to approve.'
                },
                'push': {
                    'subject': 'Transfer Approval Required',
                    'body': '{{ quantity }} x {{ product.name }} transfer needs approval'
                }
            },
            'transfer_approved': {
                'email': {
                    'subject': 'Transfer Approved - {{ product.name }}',
                    'body': 'Your transfer request for {{ quantity }} x {{ product.name }} has been approved.'
                },
                'sms': {
                    'subject': '',
                    'body': 'Transfer approved: {{ quantity }} x {{ product.name }}'
                },
                'push': {
                    'subject': 'Transfer Approved',
                    'body': 'Your transfer request has been approved'
                }
            },
            'transfer_rejected': {
                'email': {
                    'subject': 'Transfer Rejected - {{ product.name }}',
                    'body': 'Your transfer request for {{ quantity }} x {{ product.name }} has been rejected.'
                },
                'sms': {
                    'subject': '',
                    'body': 'Transfer rejected: {{ quantity }} x {{ product.name }}'
                },
                'push': {
                    'subject': '',
                    'body': 'Transfer rejected: {{ quantity }} x {{ product.name }} from {{ from_location }} to {{ to_location }}'
                }
            },
            'customer_request': {
                'email': {
                    'subject': 'Customer Approval Required - {{ customer.name }}',
                    'body': '''Dear {{ recipient.first_name|default:recipient.username }},

A new customer registration requires your approval:

Customer Name: {{ customer.name }}
Email: {{ customer.email }}
Phone: {{ customer.phone }}
Address: {{ customer.address }}
Requested Type: {{ customer.customer_type }}
Payment Terms: {{ customer.payment_terms }} days
Requested by: {{ requested_by.first_name|default:requested_by.username }}

Please review and approve this customer at: {{ approval_url }}

Best regards,
ERP System'''
                },
                'sms': {
                    'subject': '',
                    'body': 'Customer approval needed: {{ customer.name }} ({{ customer.customer_type }}). Check your dashboard to approve.'
                },
                'push': {
                    'subject': '',
                    'body': 'New customer approval required: {{ customer.name }}'
                }
            },
            'customer_approved': {
                'email': {
                    'subject': 'Customer Approved - {{ customer.name }}',
                    'body': '''Dear {{ recipient.first_name|default:recipient.username }},

Your customer registration request has been approved:

Customer Name: {{ customer.name }}
Approved Type: {{ approved_customer_type }}
Approved by: {{ approved_by.first_name|default:approved_by.username }}
Approval Date: {{ approved_at }}

The customer has been added to the system and is ready for business.

Best regards,
ERP System'''
                },
                'sms': {
                    'subject': '',
                    'body': 'Customer approved: {{ customer.name }} as {{ approved_customer_type }}. Ready for business!'
                },
                'push': {
                    'subject': '',
                    'body': 'Customer {{ customer.name }} approved as {{ approved_customer_type }}'
                }
            },
            'customer_rejected': {
                'email': {
                    'subject': 'Customer Request Rejected - {{ customer.name }}',
                    'body': '''Dear {{ recipient.first_name|default:recipient.username }},

Your customer registration request has been rejected:

Customer Name: {{ customer.name }}
Rejected by: {{ approved_by.first_name|default:approved_by.username }}
Rejection Date: {{ approved_at }}
Reason: {{ rejection_reason }}

Please review the feedback and resubmit if appropriate.

Best regards,
ERP System'''
                },
                'sms': {
                    'subject': '',
                    'body': 'Customer request rejected: {{ customer.name }}. Reason: {{ rejection_reason }}'
                },
                'push': {
                    'subject': '',
                    'body': 'Customer {{ customer.name }} request rejected'
                }
            }
        }
        
        template_config = templates.get(notification_type, {}).get(channel.channel_type, {})
        if not template_config:
            return None
            
        template, created = NotificationTemplate.objects.get_or_create(
            notification_type=notification_type,
            channel=channel,
            defaults={
                'subject': template_config['subject'],
                'body': template_config['body'],
                'is_active': True
            }
        )
        return template
    
    @staticmethod
    def send_customer_approval_request(customer_approval):
        """
        Send notification to Sales Managers when a customer approval is requested
        """
        from users.models import User
        
        # Get all Sales Managers and Superusers
        managers = User.objects.filter(
            models.Q(is_superuser=True) | 
            models.Q(role='sales_manager') |
            models.Q(role='admin')
        )
        
        for manager in managers:
            context = {
                'customer': customer_approval,
                'requested_by': customer_approval.requested_by,
                'approval_url': f'/sales/customer-approvals/{customer_approval.id}'
            }
            
            NotificationService.send_notification(
                recipient=manager,
                notification_type='customer_request',
                context=context
            )
    
    @staticmethod
    def send_customer_approval_notification(customer_approval, action):
        """
        Send notification to the requesting user about approval/rejection
        """
        if action == 'approved':
            notification_type = 'customer_approved'
            context = {
                'customer': customer_approval,
                'approved_customer_type': customer_approval.approved_customer_type,
                'approved_by': customer_approval.approved_by,
                'approved_at': customer_approval.approved_at
            }
        else:  # rejected
            notification_type = 'customer_rejected'
            context = {
                'customer': customer_approval,
                'approved_by': customer_approval.approved_by,
                'approved_at': customer_approval.approved_at,
                'rejection_reason': customer_approval.rejection_reason
            }
        
        NotificationService.send_notification(
            recipient=customer_approval.requested_by,
            notification_type=notification_type,
            context=context
        )


class TransferApprovalService:
    """Service for managing transfer approval workflow"""
    
    def __init__(self):
        self.notification_service = NotificationService()
    
    def request_approval(self, transfer):
        """Request approval for a transfer from the destination warehouse rep"""
        # Find the destination warehouse and its manager
        from warehouse.models import Warehouse
        
        try:
            destination_warehouse = Warehouse.objects.get(name=transfer.to_location)
            if not destination_warehouse.manager:
                logger.warning(f"No manager assigned to warehouse {destination_warehouse.name}")
                return None
            
            # Create approval record
            approval = TransferApproval.objects.create(
                transfer=transfer,
                expires_at=timezone.now() + timedelta(hours=24)  # 24-hour expiry
            )
            
            # Send notifications
            notifications_sent = self.notification_service.send_transfer_approval_request(
                transfer, destination_warehouse.manager
            )
            
            # Update approval record with notification tracking
            approval.notifications_sent = notifications_sent
            approval.save()
            
            # Update transfer status
            transfer.status = 'pending_approval'
            transfer.save()
            
            return approval
            
        except Warehouse.DoesNotExist:
            logger.error(f"Destination warehouse '{transfer.to_location}' not found")
            return None
        except Exception as e:
            logger.error(f"Failed to request approval for transfer {transfer.id}: {str(e)}")
            return None
    
    def approve_transfer(self, transfer_id, approver, notes=""):
        """Approve a transfer"""
        try:
            approval = TransferApproval.objects.get(transfer_id=transfer_id)
            
            if approval.status != 'pending':
                return False, "Transfer has already been reviewed"
            
            if approval.is_expired():
                approval.status = 'expired'
                approval.save()
                return False, "Transfer approval has expired"
            
            # Approve the transfer
            approval.approve(approver, notes)
            
            # Send status update notification
            self.notification_service.send_transfer_status_update(
                approval.transfer, 'approved', approval.transfer.requested_by
            )
            
            return True, "Transfer approved successfully"
            
        except TransferApproval.DoesNotExist:
            return False, "Transfer approval not found"
        except Exception as e:
            logger.error(f"Failed to approve transfer {transfer_id}: {str(e)}")
            return False, str(e)
    
    def reject_transfer(self, transfer_id, approver, reason=""):
        """Reject a transfer"""
        try:
            approval = TransferApproval.objects.get(transfer_id=transfer_id)
            
            if approval.status != 'pending':
                return False, "Transfer has already been reviewed"
            
            # Reject the transfer
            approval.reject(approver, reason)
            
            # Send status update notification
            self.notification_service.send_transfer_status_update(
                approval.transfer, 'rejected', approval.transfer.requested_by
            )
            
            return True, "Transfer rejected successfully"
            
        except TransferApproval.DoesNotExist:
            return False, "Transfer approval not found"
        except Exception as e:
            logger.error(f"Failed to reject transfer {transfer_id}: {str(e)}")
            return False, str(e)
