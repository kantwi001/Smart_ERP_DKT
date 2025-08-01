from django.test import TestCase
from django.contrib.auth import get_user_model
from hr.models import Department, Employee, LeaveRequest

User = get_user_model()

class LeaveApprovalWorkflowTest(TestCase):
    def setUp(self):
        self.hod = User.objects.create_user(username='hod', password='hod', role='hod')
        self.hr = User.objects.create_user(username='hr', password='hr', role='hr')
        self.emp = User.objects.create_user(username='emp', password='emp', role='employee')
        self.dept = Department.objects.create(name='IT', supervisor=self.hod)
        self.employee = Employee.objects.create(user=self.emp, department=self.dept)
        self.leave = LeaveRequest.objects.create(employee=self.employee, leave_type='annual', start_date='2025-07-20', end_date='2025-07-25')
    def test_hod_approval(self):
        self.assertEqual(self.leave.approval_stage, 'hod')
        self.leave.approve(self.hod)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.approval_stage, 'hr')
        self.assertEqual(self.leave.approver.role, 'hr')
    def test_hr_approval(self):
        self.leave.approve(self.hod)
        self.leave.refresh_from_db()
        self.leave.approve(self.hr)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, 'approved')
        self.assertEqual(self.leave.approval_stage, 'complete')
    def test_decline(self):
        self.leave.decline(self.hod)
        self.leave.refresh_from_db()
        self.assertEqual(self.leave.status, 'declined')
        self.assertEqual(self.leave.approval_stage, 'complete')
    def test_only_current_approver_can_act(self):
        with self.assertRaises(PermissionError):
            self.leave.approve(self.hr)
        with self.assertRaises(PermissionError):
            self.leave.decline(self.hr)
