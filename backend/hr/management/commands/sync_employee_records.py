from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from hr.models import Employee, Department
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Sync Employee records with User accounts and fix department assignments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix-departments',
            action='store_true',
            help='Fix department assignments for existing Employee records',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔄 Starting Employee record synchronization...'))
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        # Get all users
        all_users = User.objects.all()
        self.stdout.write(f"📊 Found {all_users.count()} users to process")
        
        for user in all_users:
            try:
                # Try to get existing Employee record
                employee, created = Employee.objects.get_or_create(
                    user=user,
                    defaults={
                        'position': getattr(user, 'role', 'Employee').title() if hasattr(user, 'role') else 'Employee',
                        'department_id': getattr(user, 'department', None) if hasattr(user, 'department') else None,
                        'hire_date': date.today(),
                        'salary': 0.00,
                        'is_active': True
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f"✅ Created Employee record for: {user.username} (ID: {user.id})")
                    )
                else:
                    # Update existing Employee record if needed
                    needs_update = False
                    
                    # Check if department needs updating
                    if (hasattr(user, 'department') and 
                        user.department and 
                        employee.department_id != user.department):
                        employee.department_id = user.department
                        needs_update = True
                        self.stdout.write(
                            f"🔧 Updating department for {user.username}: {employee.department_id} -> {user.department}"
                        )
                    
                    # Check if position needs updating based on role
                    if hasattr(user, 'role') and user.role:
                        expected_position = user.role.title()
                        if employee.position != expected_position:
                            employee.position = expected_position
                            needs_update = True
                            self.stdout.write(
                                f"🔧 Updating position for {user.username}: {employee.position} -> {expected_position}"
                            )
                    
                    if needs_update:
                        employee.save()
                        updated_count += 1
                        self.stdout.write(
                            self.style.WARNING(f"📝 Updated Employee record for: {user.username}")
                        )
                
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f"❌ Error processing user {user.username}: {e}")
                )
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n📈 Synchronization Summary:'))
        self.stdout.write(f"  • Created: {created_count} Employee records")
        self.stdout.write(f"  • Updated: {updated_count} Employee records")
        self.stdout.write(f"  • Errors: {error_count}")
        
        if options['fix_departments']:
            self.stdout.write(self.style.SUCCESS('\n🏢 Fixing department assignments...'))
            self.fix_department_assignments()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Employee record synchronization completed!'))

    def fix_department_assignments(self):
        """Fix department assignments for Employee records"""
        fixed_count = 0
        
        employees_without_departments = Employee.objects.filter(department__isnull=True)
        
        for employee in employees_without_departments:
            user = employee.user
            
            # Try to get department from user
            if hasattr(user, 'department') and user.department:
                try:
                    department = Department.objects.get(id=user.department)
                    employee.department = department
                    employee.save()
                    fixed_count += 1
                    self.stdout.write(
                        f"🔧 Fixed department for {user.username}: {department.name}"
                    )
                except Department.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f"⚠️ Department ID {user.department} not found for {user.username}")
                    )
        
        self.stdout.write(f"  • Fixed {fixed_count} department assignments")
