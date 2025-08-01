from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from hr.models import Department, OnboardingTemplate, OnboardingStep

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed onboarding templates and steps'

    def handle(self, *args, **options):
        self.stdout.write('Creating onboarding templates and steps...')
        
        # Get or create departments
        hr_dept, _ = Department.objects.get_or_create(name='HR')
        sales_dept, _ = Department.objects.get_or_create(name='SALES')
        finance_dept, _ = Department.objects.get_or_create(name='FINANCE')
        
        # Create General Onboarding Template
        general_template, created = OnboardingTemplate.objects.get_or_create(
            name='General Employee Onboarding',
            defaults={
                'description': 'Standard onboarding process for all new employees',
                'is_active': True
            }
        )
        
        if created:
            # Create steps for general template
            steps_data = [
                {
                    'title': 'Welcome Email and Documentation',
                    'description': 'Send welcome email with company handbook, policies, and first-day instructions',
                    'step_type': 'document',
                    'order': 1,
                    'estimated_duration': 1,
                    'responsible_department': hr_dept,
                    'responsible_role': 'HR Coordinator',
                    'documents_required': 'Employee handbook, Company policies, Welcome letter'
                },
                {
                    'title': 'IT Setup and System Access',
                    'description': 'Create user accounts, provide equipment, and set up system access',
                    'step_type': 'system_access',
                    'order': 2,
                    'estimated_duration': 2,
                    'responsible_department': hr_dept,
                    'responsible_role': 'IT Administrator',
                    'documents_required': 'System access form, Equipment checklist'
                },
                {
                    'title': 'HR Orientation Session',
                    'description': 'Conduct HR orientation covering benefits, policies, and procedures',
                    'step_type': 'orientation',
                    'order': 3,
                    'estimated_duration': 3,
                    'responsible_department': hr_dept,
                    'responsible_role': 'HR Manager',
                    'documents_required': 'Benefits enrollment forms, Emergency contact form'
                },
                {
                    'title': 'Meet Direct Supervisor',
                    'description': 'Introduction meeting with direct supervisor and team overview',
                    'step_type': 'meeting',
                    'order': 4,
                    'estimated_duration': 1,
                    'responsible_role': 'Direct Supervisor',
                    'documents_required': 'Job description, Team structure chart'
                },
                {
                    'title': 'Department Introduction',
                    'description': 'Meet department colleagues and understand department goals',
                    'step_type': 'meeting',
                    'order': 5,
                    'estimated_duration': 2,
                    'responsible_role': 'Department Head',
                    'documents_required': 'Department overview, Team contact list'
                },
                {
                    'title': 'Complete Required Forms',
                    'description': 'Fill out tax forms, emergency contacts, and other required documentation',
                    'step_type': 'form_completion',
                    'order': 6,
                    'estimated_duration': 1,
                    'responsible_department': hr_dept,
                    'responsible_role': 'HR Assistant',
                    'documents_required': 'Tax forms, Emergency contact form, Bank details form'
                },
                {
                    'title': 'Safety and Security Training',
                    'description': 'Complete workplace safety training and security protocols',
                    'step_type': 'training',
                    'order': 7,
                    'estimated_duration': 2,
                    'responsible_department': hr_dept,
                    'responsible_role': 'Safety Officer',
                    'documents_required': 'Safety manual, Security guidelines'
                },
                {
                    'title': 'Job-Specific Training',
                    'description': 'Role-specific training and skill development',
                    'step_type': 'training',
                    'order': 8,
                    'estimated_duration': 8,
                    'responsible_role': 'Training Coordinator',
                    'documents_required': 'Training materials, Skill assessment forms'
                },
                {
                    'title': '30-Day Check-in',
                    'description': 'Review progress, address concerns, and provide feedback',
                    'step_type': 'meeting',
                    'order': 9,
                    'estimated_duration': 1,
                    'responsible_department': hr_dept,
                    'responsible_role': 'HR Manager',
                    'documents_required': '30-day evaluation form'
                },
                {
                    'title': '90-Day Review',
                    'description': 'Comprehensive review of performance and integration',
                    'step_type': 'meeting',
                    'order': 10,
                    'estimated_duration': 2,
                    'responsible_department': hr_dept,
                    'responsible_role': 'HR Manager',
                    'documents_required': '90-day performance review form'
                }
            ]
            
            for step_data in steps_data:
                OnboardingStep.objects.create(template=general_template, **step_data)
            
            self.stdout.write(f'Created general onboarding template with {len(steps_data)} steps')
        
        # Create Sales Department Onboarding Template
        sales_template, created = OnboardingTemplate.objects.get_or_create(
            name='Sales Team Onboarding',
            department=sales_dept,
            defaults={
                'role': 'Sales Representative',
                'description': 'Specialized onboarding process for sales team members',
                'is_active': True
            }
        )
        
        if created:
            # Create sales-specific steps
            sales_steps = [
                {
                    'title': 'Sales System Training',
                    'description': 'Training on CRM, sales processes, and reporting tools',
                    'step_type': 'training',
                    'order': 1,
                    'estimated_duration': 4,
                    'responsible_department': sales_dept,
                    'responsible_role': 'Sales Manager',
                    'documents_required': 'CRM user guide, Sales process manual'
                },
                {
                    'title': 'Product Knowledge Training',
                    'description': 'Comprehensive training on company products and services',
                    'step_type': 'training',
                    'order': 2,
                    'estimated_duration': 8,
                    'responsible_department': sales_dept,
                    'responsible_role': 'Product Specialist',
                    'documents_required': 'Product catalog, Technical specifications'
                },
                {
                    'title': 'Territory Assignment',
                    'description': 'Assign sales territory and customer accounts',
                    'step_type': 'task',
                    'order': 3,
                    'estimated_duration': 2,
                    'responsible_department': sales_dept,
                    'responsible_role': 'Sales Manager',
                    'documents_required': 'Territory map, Customer list'
                },
                {
                    'title': 'Shadow Experienced Sales Rep',
                    'description': 'Accompany senior sales representative on customer visits',
                    'step_type': 'training',
                    'order': 4,
                    'estimated_duration': 16,
                    'responsible_department': sales_dept,
                    'responsible_role': 'Senior Sales Rep',
                    'documents_required': 'Visit schedule, Customer profiles'
                },
                {
                    'title': 'First Independent Sales Call',
                    'description': 'Conduct first independent customer visit with supervisor support',
                    'step_type': 'task',
                    'order': 5,
                    'estimated_duration': 4,
                    'responsible_department': sales_dept,
                    'responsible_role': 'Sales Manager',
                    'documents_required': 'Call report template, Customer feedback form'
                }
            ]
            
            for step_data in sales_steps:
                OnboardingStep.objects.create(template=sales_template, **step_data)
            
            self.stdout.write(f'Created sales onboarding template with {len(sales_steps)} steps')
        
        # Create Finance Department Onboarding Template
        finance_template, created = OnboardingTemplate.objects.get_or_create(
            name='Finance Team Onboarding',
            department=finance_dept,
            defaults={
                'role': 'Finance Officer',
                'description': 'Specialized onboarding process for finance team members',
                'is_active': True
            }
        )
        
        if created:
            # Create finance-specific steps
            finance_steps = [
                {
                    'title': 'Financial Systems Training',
                    'description': 'Training on accounting software and financial reporting systems',
                    'step_type': 'training',
                    'order': 1,
                    'estimated_duration': 6,
                    'responsible_department': finance_dept,
                    'responsible_role': 'Finance Manager',
                    'documents_required': 'System user manuals, Chart of accounts'
                },
                {
                    'title': 'Compliance and Procedures Training',
                    'description': 'Training on financial compliance, audit procedures, and internal controls',
                    'step_type': 'training',
                    'order': 2,
                    'estimated_duration': 4,
                    'responsible_department': finance_dept,
                    'responsible_role': 'Compliance Officer',
                    'documents_required': 'Compliance manual, Audit procedures'
                },
                {
                    'title': 'Budget and Forecasting Training',
                    'description': 'Learn budget preparation and financial forecasting processes',
                    'step_type': 'training',
                    'order': 3,
                    'estimated_duration': 4,
                    'responsible_department': finance_dept,
                    'responsible_role': 'Budget Analyst',
                    'documents_required': 'Budget templates, Forecasting models'
                },
                {
                    'title': 'Month-End Procedures',
                    'description': 'Participate in month-end closing and reporting procedures',
                    'step_type': 'task',
                    'order': 4,
                    'estimated_duration': 8,
                    'responsible_department': finance_dept,
                    'responsible_role': 'Senior Accountant',
                    'documents_required': 'Month-end checklist, Reporting templates'
                }
            ]
            
            for step_data in finance_steps:
                OnboardingStep.objects.create(template=finance_template, **step_data)
            
            self.stdout.write(f'Created finance onboarding template with {len(finance_steps)} steps')
        
        self.stdout.write(self.style.SUCCESS('Successfully created onboarding templates and steps!'))
