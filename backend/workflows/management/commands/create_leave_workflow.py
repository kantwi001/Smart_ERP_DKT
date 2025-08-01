from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from workflows.models import WorkflowTemplate, WorkflowStep

User = get_user_model()

class Command(BaseCommand):
    help = 'Create custom Leave Request workflow template'

    def handle(self, *args, **options):
        self.stdout.write('Creating Leave Request workflow template...')
        
        # Update the existing Leave Request template
        try:
            template = WorkflowTemplate.objects.get(workflow_type='leave_request', is_default=True)
            template.name = 'Leave Request'
            template.description = 'Complete leave request approval workflow: Requester → Department HOD → CD → HR → Leave Deduction'
            template.is_active = True
            template.require_manager_approval = True
            template.require_hr_approval = True
            template.escalation_days = 2
            template.save()
            created = False
        except WorkflowTemplate.DoesNotExist:
            template = WorkflowTemplate.objects.create(
                name='Leave Request',
                workflow_type='leave_request',
                description='Complete leave request approval workflow: Requester → Department HOD → CD → HR → Leave Deduction',
                is_active=True,
                is_default=True,
                require_manager_approval=True,
                require_hr_approval=True,
                escalation_days=2
            )
            created = True
        
        if created:
            self.stdout.write('Created new Leave Request template')
        else:
            self.stdout.write('Updated existing Leave Request template')
            # Clear existing steps to recreate them
            template.steps.all().delete()
        
        # Create workflow steps
        steps = [
            {
                'step_order': 1,
                'name': 'Department HOD Approval',
                'step_type': 'approval',
                'approver_type': 'department_head',
                'is_required': True,
                'timeout_hours': 48,
                'allow_delegate': True,
                'send_notification': True
            },
            {
                'step_order': 2,
                'name': 'Country Director Approval',
                'step_type': 'approval',
                'approver_type': 'country_director',
                'is_required': True,
                'timeout_hours': 72,
                'allow_delegate': True,
                'send_notification': True
            },
            {
                'step_order': 3,
                'name': 'HR Final Approval & Leave Deduction',
                'step_type': 'approval',
                'approver_type': 'hr_manager',
                'is_required': True,
                'timeout_hours': 48,
                'allow_delegate': False,
                'send_notification': True
            }
        ]
        
        for step_data in steps:
            step = WorkflowStep.objects.create(template=template, **step_data)
            self.stdout.write(f'Created step: {step.name}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created Leave Request workflow with {len(steps)} steps')
        )
