from django.test import TestCase
from django.contrib.auth import get_user_model
from hr.models import Department, Employee, PerformanceReview

User = get_user_model()

class PerformanceReviewApprovalWorkflowTest(TestCase):
    def setUp(self):
        self.hod = User.objects.create_user(username='hod', password='hod', role='hod')
        self.hr = User.objects.create_user(username='hr', password='hr', role='hr')
        self.emp = User.objects.create_user(username='emp', password='emp', role='employee')
        self.dept = Department.objects.create(name='IT', supervisor=self.hod)
        self.employee = Employee.objects.create(user=self.emp, department=self.dept)
        self.review = PerformanceReview.objects.create(employee=self.employee, period='2025-Q3', status='submitted')
    def test_hod_approval(self):
        self.assertEqual(self.review.approval_stage, 'hod')
        self.review.approve(self.hod)
        self.review.refresh_from_db()
        self.assertEqual(self.review.approval_stage, 'hr')
        self.assertEqual(self.review.reviewer.role, 'hr')
    def test_hr_approval(self):
        self.review.approve(self.hod)
        self.review.refresh_from_db()
        self.review.approve(self.hr)
        self.review.refresh_from_db()
        self.assertEqual(self.review.status, 'approved')
        self.assertEqual(self.review.approval_stage, 'complete')
    def test_decline(self):
        self.review.decline(self.hod)
        self.review.refresh_from_db()
        self.assertEqual(self.review.status, 'declined')
        self.assertEqual(self.review.approval_stage, 'complete')
    def test_only_current_approver_can_act(self):
        with self.assertRaises(PermissionError):
            self.review.approve(self.hr)
        with self.assertRaises(PermissionError):
            self.review.decline(self.hr)
