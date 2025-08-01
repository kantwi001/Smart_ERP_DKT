import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from hr.models import Department, Employee, Payroll, Announcement, LeaveRequest, PerformanceReview
from procurement.models import ProcurementRequest, ProcurementWorkflowStage
# Add imports for other modules as needed

fake = Faker()

class Command(BaseCommand):
    help = 'Generate sample data for HR and Procurement modules.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Generating sample data...'))
        self.generate_departments()
        self.generate_employees()
        self.generate_payroll()
        self.generate_announcements()
        self.generate_leaves()
        self.generate_performance_reviews()
        self.generate_procurement_workflow_stages()
        self.generate_procurement_requests()
        self.stdout.write(self.style.SUCCESS('Sample data generation complete.'))

    def generate_departments(self):
        names = ['HR', 'Finance', 'IT', 'Procurement', 'Sales', 'Marketing', 'Logistics', 'R&D', 'Legal', 'Admin']
        for name in names:
            Department.objects.get_or_create(name=name)

    def generate_employees(self):
        departments = list(Department.objects.all())
        for _ in range(30):
            Employee.objects.create(
                name=fake.name(),
                email=fake.unique.email(),
                department=random.choice(departments),
                position=fake.job(),
                hire_date=fake.date_between(start_date='-10y', end_date='today'),
                salary=round(random.uniform(30000, 120000), 2),
            )

    def generate_payroll(self):
        employees = list(Employee.objects.all())
        for emp in employees:
            Payroll.objects.create(
                employee=emp,
                month=fake.date_this_year(),
                amount=emp.salary / 12,
                status=random.choice(['Processed', 'Pending', 'Failed'])
            )

    def generate_announcements(self):
        for _ in range(10):
            Announcement.objects.create(
                title=fake.sentence(nb_words=6),
                content=fake.paragraph(nb_sentences=3),
                date=timezone.now()
            )

    def generate_leaves(self):
        employees = list(Employee.objects.all())
        for _ in range(20):
            LeaveRequest.objects.create(
                employee=random.choice(employees),
                start_date=fake.date_between(start_date='-1y', end_date='today'),
                end_date=fake.date_between(start_date='today', end_date='+30d'),
                reason=fake.sentence(nb_words=8),
                status=random.choice(['Pending', 'Approved', 'Declined'])
            )

    def generate_performance_reviews(self):
        employees = list(Employee.objects.all())
        for _ in range(20):
            PerformanceReview.objects.create(
                employee=random.choice(employees),
                reviewer=fake.name(),
                review_date=fake.date_this_year(),
                score=random.randint(1, 5),
                comments=fake.paragraph(nb_sentences=2)
            )

    def generate_procurement_workflow_stages(self):
        stages = ['Requested', 'HOD Approval', 'HR Approval', 'Procurement', 'Finance', 'Completed']
        for i, name in enumerate(stages):
            ProcurementWorkflowStage.objects.get_or_create(stage_order=i, name=name)

    def generate_procurement_requests(self):
        stages = list(ProcurementWorkflowStage.objects.all())
        for _ in range(30):
            ProcurementRequest.objects.create(
                item=fake.word(),
                quantity=random.randint(1, 100),
                reason=fake.sentence(nb_words=8),
                department_name=random.choice(['HR', 'Finance', 'IT', 'Procurement']),
                status=random.choice(['Pending', 'Approved', 'Declined']),
                approval_stage=random.choice([s.name for s in stages]),
                approver_username=fake.user_name()
            )
