from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from hr.models import Employee, Department
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sync Employee records for all existing users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating records',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        self.stdout.write(
            self.style.SUCCESS('Starting Employee record sync...')
        )
        
        # Get all users
        users = User.objects.all()
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for user in users:
            try:
                # Check if Employee record exists
                employee, created = Employee.objects.get_or_create(
                    user=user,
                    defaults={
                        'position': getattr(user, 'position', 'Employee'),
                        'department': getattr(user, 'department', None),
                        'hire_date': getattr(user, 'date_joined', timezone.now().date()),
                        'salary': 0.00,
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    if not dry_run:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'Created Employee record for user {user.id} ({user.username})'
                            )
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'[DRY RUN] Would create Employee record for user {user.id} ({user.username})'
                            )
                        )
                else:
                    # Update existing record if needed
                    updated = False
                    
                    # Sync department if user has department but employee doesn't
                    if hasattr(user, 'department') and user.department and not employee.department:
                        if not dry_run:
                            employee.department = user.department
                            updated = True
                    
                    # Sync position if user has position but employee has default
                    if hasattr(user, 'position') and user.position and employee.position == 'Employee':
                        if not dry_run:
                            employee.position = user.position
                            updated = True
                    
                    if updated and not dry_run:
                        employee.save()
                        updated_count += 1
                        self.stdout.write(
                            self.style.SUCCESS(
                                f'Updated Employee record for user {user.id} ({user.username})'
                            )
                        )
                    elif updated and dry_run:
                        updated_count += 1
                        self.stdout.write(
                            self.style.WARNING(
                                f'[DRY RUN] Would update Employee record for user {user.id} ({user.username})'
                            )
                        )
                
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'Error processing user {user.id} ({user.username}): {str(e)}'
                    )
                )
                logger.error(f'Error syncing Employee record for user {user.id}: {str(e)}')
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS('Employee Record Sync Summary:'))
        self.stdout.write(f'Total users processed: {users.count()}')
        self.stdout.write(f'Employee records created: {created_count}')
        self.stdout.write(f'Employee records updated: {updated_count}')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'Errors encountered: {error_count}'))
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('\nThis was a dry run. No changes were made.')
            )
            self.stdout.write(
                self.style.SUCCESS('Run without --dry-run to apply changes.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('\nEmployee record sync completed successfully!')
            )
