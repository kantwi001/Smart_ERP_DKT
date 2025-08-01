from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from django.contrib.auth import get_user_model
import json
import logging
from typing import List, Dict, Any

from .models import WorkflowNotification, WorkflowInstance, WorkflowApproval
from notifications.models import NotificationChannel, NotificationTemplate

User = get_user_model()
logger = logging.getLogger(__name__)

class WorkflowNotificationService:
    """
    Comprehensive notification service for workflow stages
    Supports Email, SMS, In-App, and Push notifications
    """
    
    NOTIFICATION_STAGES = {
        'workflow_initiated': {
            'title': 'Workflow Initiated',
            'description': 'New workflow request has been submitted'
        },
        'approval_assigned': {
            'title': 'Approval Required',
            'description': 'You have been assigned an approval task'
        },
        'approval_approved': {
            'title': 'Approval Granted',
            'description': 'Your request has been approved at this stage'
        },
        'approval_rejected': {
            'title': 'Approval Rejected',
            'description': 'Your request has been rejected'
        },
        'approval_delegated': {
            'title': 'Approval Delegated',
            'description': 'Approval has been delegated to another user'
        },
        'workflow_escalated': {
            'title': 'Workflow Escalated',
            'description': 'Workflow has been escalated due to timeout'
        },
        'workflow_completed': {
            'title': 'Workflow Completed',
            'description': 'Your workflow request has been completed'
        },
        'workflow_cancelled': {
            'title': 'Workflow Cancelled',
            'description': 'Workflow request has been cancelled'
        },
        'reminder_pending': {
            'title': 'Pending Approval Reminder',
            'description': 'Reminder: You have pending approvals'
        },
        'step_completed': {
            'title': 'Step Completed',
            'description': 'A workflow step has been completed'
        }
    }
    
    def __init__(self):
        self.channels = ['email', 'sms', 'in_app', 'push']
    
    def send_workflow_notification(
        self, 
        workflow_instance: WorkflowInstance,
        stage: str,
        recipients: List[User],
        additional_data: Dict[str, Any] = None,
        channels: List[str] = None
    ):
        """
        Send notifications for a workflow stage across all specified channels
        """
        if channels is None:
            channels = self.channels
        
        if additional_data is None:
            additional_data = {}
        
        stage_info = self.NOTIFICATION_STAGES.get(stage, {
            'title': 'Workflow Update',
            'description': 'Workflow status has been updated'
        })
        
        notification_data = {
            'workflow_instance': workflow_instance,
            'stage': stage,
            'stage_info': stage_info,
            'additional_data': additional_data,
            'timestamp': timezone.now()
        }
        
        results = {}
        
        for recipient in recipients:
            recipient_results = {}
            
            for channel in channels:
                try:
                    if channel == 'email':
                        result = self._send_email_notification(recipient, notification_data)
                    elif channel == 'sms':
                        result = self._send_sms_notification(recipient, notification_data)
                    elif channel == 'in_app':
                        result = self._send_in_app_notification(recipient, notification_data)
                    elif channel == 'push':
                        result = self._send_push_notification(recipient, notification_data)
                    else:
                        result = {'success': False, 'error': f'Unknown channel: {channel}'}
                    
                    recipient_results[channel] = result
                    
                    # Create notification record
                    WorkflowNotification.objects.create(
                        workflow_instance=workflow_instance,
                        notification_type=stage,
                        recipient=recipient,
                        channel=channel,
                        subject=stage_info['title'],
                        message=self._generate_message(notification_data),
                        delivered=result.get('success', False)
                    )
                    
                except Exception as e:
                    logger.error(f"Failed to send {channel} notification to {recipient.username}: {str(e)}")
                    recipient_results[channel] = {'success': False, 'error': str(e)}
            
            results[recipient.id] = recipient_results
        
        return results
    
    def _send_email_notification(self, recipient: User, notification_data: Dict) -> Dict:
        """Send email notification"""
        try:
            workflow_instance = notification_data['workflow_instance']
            stage_info = notification_data['stage_info']
            
            subject = f"[ERP System] {stage_info['title']} - {workflow_instance.instance_id}"
            
            # Generate email content
            context = {
                'recipient': recipient,
                'workflow_instance': workflow_instance,
                'stage_info': stage_info,
                'additional_data': notification_data.get('additional_data', {}),
                'timestamp': notification_data['timestamp']
            }
            
            # Try to use custom template, fallback to default
            try:
                html_message = render_to_string('workflows/email_notification.html', context)
                plain_message = render_to_string('workflows/email_notification.txt', context)
            except:
                # Fallback to simple message
                plain_message = self._generate_email_fallback(context)
                html_message = None
            
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient.email],
                html_message=html_message,
                fail_silently=False
            )
            
            return {'success': True, 'message': 'Email sent successfully'}
            
        except Exception as e:
            logger.error(f"Email notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_sms_notification(self, recipient: User, notification_data: Dict) -> Dict:
        """Send SMS notification"""
        try:
            # SMS implementation would go here
            # For now, we'll simulate SMS sending
            workflow_instance = notification_data['workflow_instance']
            stage_info = notification_data['stage_info']
            
            message = f"ERP Alert: {stage_info['title']} - {workflow_instance.instance_id}. Check your dashboard for details."
            
            # In a real implementation, you would integrate with SMS providers like:
            # - Twilio
            # - AWS SNS
            # - Africa's Talking
            # - etc.
            
            logger.info(f"SMS notification sent to {recipient.username}: {message}")
            
            return {'success': True, 'message': 'SMS sent successfully (simulated)'}
            
        except Exception as e:
            logger.error(f"SMS notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_in_app_notification(self, recipient: User, notification_data: Dict) -> Dict:
        """Send in-app notification"""
        try:
            from notifications.models import Notification
            
            workflow_instance = notification_data['workflow_instance']
            stage_info = notification_data['stage_info']
            
            Notification.objects.create(
                recipient=recipient,
                title=stage_info['title'],
                message=self._generate_message(notification_data),
                notification_type='workflow',
                related_object_type='workflow_instance',
                related_object_id=workflow_instance.id,
                metadata={
                    'workflow_instance_id': workflow_instance.id,
                    'instance_id': workflow_instance.instance_id,
                    'stage': notification_data['stage'],
                    'template_name': workflow_instance.template.name
                }
            )
            
            return {'success': True, 'message': 'In-app notification created'}
            
        except Exception as e:
            logger.error(f"In-app notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _send_push_notification(self, recipient: User, notification_data: Dict) -> Dict:
        """Send push notification"""
        try:
            # Push notification implementation would go here
            # For now, we'll simulate push notification sending
            workflow_instance = notification_data['workflow_instance']
            stage_info = notification_data['stage_info']
            
            push_data = {
                'title': stage_info['title'],
                'body': self._generate_message(notification_data),
                'data': {
                    'workflow_instance_id': workflow_instance.id,
                    'instance_id': workflow_instance.instance_id,
                    'stage': notification_data['stage']
                }
            }
            
            # In a real implementation, you would integrate with push services like:
            # - Firebase Cloud Messaging (FCM)
            # - Apple Push Notification Service (APNs)
            # - Web Push Protocol
            # etc.
            
            logger.info(f"Push notification sent to {recipient.username}: {push_data}")
            
            return {'success': True, 'message': 'Push notification sent (simulated)'}
            
        except Exception as e:
            logger.error(f"Push notification failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _generate_message(self, notification_data: Dict) -> str:
        """Generate notification message"""
        workflow_instance = notification_data['workflow_instance']
        stage_info = notification_data['stage_info']
        stage = notification_data['stage']
        
        base_message = f"{stage_info['description']} for {workflow_instance.template.name} request {workflow_instance.instance_id}."
        
        if stage == 'approval_assigned':
            base_message += f" Current step: {workflow_instance.current_step.name if workflow_instance.current_step else 'Processing'}."
        elif stage == 'approval_approved':
            base_message += " The request is moving to the next approval stage."
        elif stage == 'approval_rejected':
            reason = notification_data.get('additional_data', {}).get('rejection_reason', '')
            if reason:
                base_message += f" Reason: {reason}"
        elif stage == 'workflow_escalated':
            base_message += " Please review and take action as soon as possible."
        
        return base_message
    
    def _generate_email_fallback(self, context: Dict) -> str:
        """Generate fallback email content"""
        workflow_instance = context['workflow_instance']
        stage_info = context['stage_info']
        recipient = context['recipient']
        
        return f"""
Dear {recipient.first_name or recipient.username},

{stage_info['description']}

Workflow Details:
- Request ID: {workflow_instance.instance_id}
- Type: {workflow_instance.template.name}
- Status: {workflow_instance.status.title()}
- Current Step: {workflow_instance.current_step.name if workflow_instance.current_step else 'Completed'}
- Submitted: {workflow_instance.created_at.strftime('%Y-%m-%d %H:%M')}

Please log in to the ERP system to view more details and take any required actions.

Best regards,
ERP System
        """.strip()
    
    def send_stage_notifications(self, workflow_instance: WorkflowInstance, stage: str, **kwargs):
        """
        Send notifications for specific workflow stages
        """
        recipients = []
        channels = ['email', 'sms', 'in_app', 'push']
        
        if stage == 'workflow_initiated':
            # Notify requester that workflow has started
            recipients = [workflow_instance.requester]
            
        elif stage == 'approval_assigned':
            # Notify approvers that they have a new task
            approver_id = kwargs.get('approver_id')
            if approver_id:
                try:
                    approver = User.objects.get(id=approver_id)
                    recipients = [approver]
                except User.DoesNotExist:
                    logger.error(f"Approver with ID {approver_id} not found")
                    
        elif stage in ['approval_approved', 'approval_rejected', 'workflow_completed', 'workflow_cancelled']:
            # Notify requester of status changes
            recipients = [workflow_instance.requester]
            
        elif stage == 'approval_delegated':
            # Notify both delegator and delegatee
            delegated_to_id = kwargs.get('delegated_to_id')
            delegated_by_id = kwargs.get('delegated_by_id')
            
            if delegated_to_id:
                try:
                    delegated_to = User.objects.get(id=delegated_to_id)
                    recipients.append(delegated_to)
                except User.DoesNotExist:
                    pass
                    
            if delegated_by_id:
                try:
                    delegated_by = User.objects.get(id=delegated_by_id)
                    recipients.append(delegated_by)
                except User.DoesNotExist:
                    pass
                    
        elif stage == 'workflow_escalated':
            # Notify escalation target and original approver
            escalated_to_id = kwargs.get('escalated_to_id')
            original_approver_id = kwargs.get('original_approver_id')
            
            if escalated_to_id:
                try:
                    escalated_to = User.objects.get(id=escalated_to_id)
                    recipients.append(escalated_to)
                except User.DoesNotExist:
                    pass
                    
            if original_approver_id:
                try:
                    original_approver = User.objects.get(id=original_approver_id)
                    recipients.append(original_approver)
                except User.DoesNotExist:
                    pass
        
        elif stage == 'reminder_pending':
            # Notify users with pending approvals
            approver_ids = kwargs.get('approver_ids', [])
            for approver_id in approver_ids:
                try:
                    approver = User.objects.get(id=approver_id)
                    recipients.append(approver)
                except User.DoesNotExist:
                    pass
        
        # Send notifications if we have recipients
        if recipients:
            additional_data = kwargs.get('additional_data', {})
            return self.send_workflow_notification(
                workflow_instance=workflow_instance,
                stage=stage,
                recipients=recipients,
                additional_data=additional_data,
                channels=channels
            )
        
        return {}
    
    def get_notification_status(self, workflow_instance: WorkflowInstance) -> Dict:
        """
        Get comprehensive notification status for a workflow instance
        """
        notifications = WorkflowNotification.objects.filter(
            workflow_instance=workflow_instance
        ).order_by('-sent_at')
        
        status = {
            'total_notifications': notifications.count(),
            'delivered_notifications': notifications.filter(delivered=True).count(),
            'failed_notifications': notifications.filter(delivered=False).count(),
            'by_channel': {},
            'by_stage': {},
            'timeline': []
        }
        
        # Group by channel
        for channel in self.channels:
            channel_notifications = notifications.filter(channel=channel)
            status['by_channel'][channel] = {
                'total': channel_notifications.count(),
                'delivered': channel_notifications.filter(delivered=True).count(),
                'failed': channel_notifications.filter(delivered=False).count()
            }
        
        # Group by stage
        for stage_key in self.NOTIFICATION_STAGES.keys():
            stage_notifications = notifications.filter(notification_type=stage_key)
            if stage_notifications.exists():
                status['by_stage'][stage_key] = {
                    'total': stage_notifications.count(),
                    'delivered': stage_notifications.filter(delivered=True).count(),
                    'failed': stage_notifications.filter(delivered=False).count(),
                    'last_sent': stage_notifications.first().sent_at.isoformat()
                }
        
        # Create timeline
        for notification in notifications[:20]:  # Last 20 notifications
            status['timeline'].append({
                'stage': notification.notification_type,
                'channel': notification.channel,
                'recipient': notification.recipient.username,
                'delivered': notification.delivered,
                'sent_at': notification.sent_at.isoformat(),
                'subject': notification.subject
            })
        
        return status

# Global instance
workflow_notification_service = WorkflowNotificationService()
