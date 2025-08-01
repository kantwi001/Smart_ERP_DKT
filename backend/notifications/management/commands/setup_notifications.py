from django.core.management.base import BaseCommand
from notifications.models import NotificationChannel, NotificationTemplate


class Command(BaseCommand):
    help = 'Set up default notification channels and templates'

    def handle(self, *args, **options):
        self.stdout.write('Setting up notification channels...')
        
        # Create default notification channels
        channels_data = [
            {
                'name': 'Email Notifications',
                'channel_type': 'email',
                'is_enabled': True,
                'configuration': {
                    'priority': 'high',
                    'retry_attempts': 3
                }
            },
            {
                'name': 'SMS Notifications',
                'channel_type': 'sms',
                'is_enabled': True,
                'configuration': {
                    'priority': 'medium',
                    'retry_attempts': 2
                }
            },
            {
                'name': 'Push Notifications',
                'channel_type': 'push',
                'is_enabled': True,
                'configuration': {
                    'priority': 'low',
                    'retry_attempts': 1
                }
            }
        ]
        
        created_channels = []
        for channel_data in channels_data:
            channel, created = NotificationChannel.objects.get_or_create(
                name=channel_data['name'],
                defaults=channel_data
            )
            if created:
                created_channels.append(channel)
                self.stdout.write(
                    self.style.SUCCESS(f'Created channel: {channel.name}')
                )
            else:
                self.stdout.write(f'Channel already exists: {channel.name}')
        
        # Create default notification templates
        self.stdout.write('Setting up notification templates...')
        
        template_data = [
            # Email templates
            {
                'name': 'Transfer Request Email',
                'template_type': 'transfer_request',
                'channel_type': 'email',
                'subject_template': 'Stock Transfer Approval Required - {{ product.name }}',
                'body_template': '''Dear {{ recipient.first_name|default:recipient.username }},

A stock transfer request requires your approval:

Product: {{ product.name }}
Quantity: {{ quantity }}
From: {{ from_location }}
To: {{ to_location }}
Requested by: {{ requested_by.first_name|default:requested_by.username }}

Please review and approve this transfer in your dashboard.

Best regards,
ERP System'''
            },
            {
                'name': 'Transfer Approved Email',
                'template_type': 'transfer_approved',
                'channel_type': 'email',
                'subject_template': 'Transfer Approved - {{ product.name }}',
                'body_template': '''Dear {{ recipient.first_name|default:recipient.username }},

Your transfer request has been approved:

Product: {{ product.name }}
Quantity: {{ quantity }}
From: {{ from_location }}
To: {{ to_location }}

The stock will be updated shortly.

Best regards,
ERP System'''
            },
            {
                'name': 'Transfer Rejected Email',
                'template_type': 'transfer_rejected',
                'channel_type': 'email',
                'subject_template': 'Transfer Rejected - {{ product.name }}',
                'body_template': '''Dear {{ recipient.first_name|default:recipient.username }},

Your transfer request has been rejected:

Product: {{ product.name }}
Quantity: {{ quantity }}
From: {{ from_location }}
To: {{ to_location }}

Please contact your warehouse manager for more information.

Best regards,
ERP System'''
            },
            # SMS templates
            {
                'name': 'Transfer Request SMS',
                'template_type': 'transfer_request',
                'channel_type': 'sms',
                'subject_template': '',
                'body_template': 'Transfer approval needed: {{ quantity }} x {{ product.name }} from {{ from_location }} to {{ to_location }}. Check your dashboard to approve.'
            },
            {
                'name': 'Transfer Approved SMS',
                'template_type': 'transfer_approved',
                'channel_type': 'sms',
                'subject_template': '',
                'body_template': 'Transfer approved: {{ quantity }} x {{ product.name }} from {{ from_location }} to {{ to_location }}.'
            },
            {
                'name': 'Transfer Rejected SMS',
                'template_type': 'transfer_rejected',
                'channel_type': 'sms',
                'subject_template': '',
                'body_template': 'Transfer rejected: {{ quantity }} x {{ product.name }} from {{ from_location }} to {{ to_location }}.'
            },
            # Push notification templates
            {
                'name': 'Transfer Request Push',
                'template_type': 'transfer_request',
                'channel_type': 'push',
                'subject_template': 'Transfer Approval Required',
                'body_template': '{{ quantity }} x {{ product.name }} transfer needs approval'
            },
            {
                'name': 'Transfer Approved Push',
                'template_type': 'transfer_approved',
                'channel_type': 'push',
                'subject_template': 'Transfer Approved',
                'body_template': 'Your transfer request has been approved'
            },
            {
                'name': 'Transfer Rejected Push',
                'template_type': 'transfer_rejected',
                'channel_type': 'push',
                'subject_template': 'Transfer Rejected',
                'body_template': 'Your transfer request has been rejected'
            }
        ]
        
        created_templates = 0
        for template_info in template_data:
            try:
                channel = NotificationChannel.objects.get(channel_type=template_info['channel_type'])
                template, created = NotificationTemplate.objects.get_or_create(
                    template_type=template_info['template_type'],
                    channel=channel,
                    defaults={
                        'name': template_info['name'],
                        'subject_template': template_info['subject_template'],
                        'body_template': template_info['body_template'],
                        'is_active': True
                    }
                )
                if created:
                    created_templates += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created template: {template.name}')
                    )
                else:
                    self.stdout.write(f'Template already exists: {template.name}')
            except NotificationChannel.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Channel not found for type: {template_info["channel_type"]}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Setup complete! Created {len(created_channels)} channels and {created_templates} templates.'
            )
        )
