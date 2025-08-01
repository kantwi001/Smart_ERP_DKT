from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from workflows.services import WorkflowIntegrationService

User = get_user_model()

class Command(BaseCommand):
    help = 'Setup default workflow templates and configurations'

    def handle(self, *args, **options):
        self.stdout.write('Setting up default workflow templates...')
        
        # Create default workflow templates
        WorkflowIntegrationService.create_default_templates()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created default workflow templates')
        )
