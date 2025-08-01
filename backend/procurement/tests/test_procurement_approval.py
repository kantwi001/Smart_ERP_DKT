from django.test import TestCase
from django.contrib.auth import get_user_model
from hr.models import Department, Employee
from procurement.models import ProcurementRequest

User = get_user_model()

class ProcurementApprovalWorkflowTest(TestCase):
    def setUp(self):
        self.hod = User.objects.create_user(username='hod', password='hod', role='hod')
        self.hr = User.objects.create_user(username='hr', password='hr', role='hr')
        self.emp = User.objects.create_user(username='emp', password='emp', role='employee')
        self.dept = Department.objects.create(name='IT', supervisor=self.hod)
        self.employee = Employee.objects.create(user=self.emp, department=self.dept)
        self.proc = ProcurementRequest.objects.create(item='Laptop', quantity=2, reason='Dev work', created_by=self.emp)
    def test_hod_approval(self):
        self.assertEqual(self.proc.approval_stage, 'hod')
        self.proc.approve(self.hod)
        self.proc.refresh_from_db()
        self.assertEqual(self.proc.approval_stage, 'hr')
        self.assertEqual(self.proc.approver.role, 'hr')
    def test_hr_approval(self):
        self.proc.approve(self.hod)
        self.proc.refresh_from_db()
        self.proc.approve(self.hr)
        self.proc.refresh_from_db()
        self.assertEqual(self.proc.status, 'approved')
        self.assertEqual(self.proc.approval_stage, 'complete')
    def test_decline(self):
        self.proc.decline(self.hod)
        self.proc.refresh_from_db()
        self.assertEqual(self.proc.status, 'declined')
        self.assertEqual(self.proc.approval_stage, 'complete')
    def test_only_current_approver_can_act(self):
        with self.assertRaises(PermissionError):
            self.proc.approve(self.hr)
        with self.assertRaises(PermissionError):
            self.proc.decline(self.hr)
