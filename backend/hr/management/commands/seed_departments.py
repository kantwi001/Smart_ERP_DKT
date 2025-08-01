from django.core.management.base import BaseCommand
from hr.models import Department

class Command(BaseCommand):
    help = 'Seed department data'

    def handle(self, *args, **options):
        departments = [
            'FINANCE',
            'OPERATIONS', 
            'HR',
            'CD',
            'M&E/NBD',
            'PROGRAMS',
            'LOGISTICS/PROCUREMENT/SUPPLY CHAIN',
            'SALES',
        ]
        
        created_count = 0
        for dept_name in departments:
            department, created = Department.objects.get_or_create(name=dept_name)
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created department: {department.get_name_display()}')
                )
            else:
                self.stdout.write(f'Department already exists: {department.get_name_display()}')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new departments')
        )
        self.stdout.write(f'Total departments in database: {Department.objects.count()}')
