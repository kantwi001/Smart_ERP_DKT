from django.utils import timezone
from django.db import transaction
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from datetime import timedelta
import uuid

from .models import (
    WorkflowTemplate, WorkflowStep, WorkflowInstance, 
    WorkflowApproval, WorkflowNotification, WorkflowAuditLog
)
from .notification_service import workflow_notification_service

User = get_user_model()

class WorkflowService:
    """Service class for workflow operations"""
    
    def initiate_workflow(self, template_id, request_object, requester, request_data=None):
        """
        Initiate a new workflow instance
        
        Args:
            template_id: ID of the workflow template
            request_object: The actual request object (LeaveRequest, ProcurementRequest, etc.)
            requester: User who initiated the request
            request_data: Additional data about the request
        
        Returns:
            WorkflowInstance object
        """
        template = WorkflowTemplate.objects.get(id=template_id)
        
        # Generate unique instance ID
        instance_id = f"{template.workflow_type}_{uuid.uuid4().hex[:8]}"
        
        # Get content type for generic foreign key
        content_type = ContentType.objects.get_for_model(request_object)
        
        with transaction.atomic():
            # Create workflow instance
            instance = WorkflowInstance.objects.create(
                template=template,
                instance_id=instance_id,
                content_type=content_type,
                object_id=request_object.id,
                requester=requester,
                request_data=request_data or {},
                status='in_progress'
            )
            
            # Create approval records for all steps
            self._create_approval_records(instance)
            
            # Set current step to first step
            first_step = template.steps.filter(step_order=1).first()
            if first_step:
                instance.current_step = first_step
                instance.save()
                
                # Assign first step approvers
                self._assign_step_approvers(instance, first_step)
            
            # Log workflow initiation
            WorkflowAuditLog.objects.create(
                workflow_instance=instance,
                user=requester,
                action='initiated',
                details={'template': template.name, 'instance_id': instance_id}
            )
            
            # Send workflow initiated notifications
            workflow_notification_service.send_stage_notifications(
                workflow_instance=instance,
                stage='workflow_initiated',
                additional_data={
                    'template_name': template.name,
                    'requester_name': requester.get_full_name() or requester.username
                }
            )
            
            return instance
    
    def process_approval(self, instance, approver, action, comments='', delegated_to_id=None, ip_address=None):
        """
        Process an approval action
        
        Args:
            instance: WorkflowInstance
            approver: User taking the action
            action: 'approved', 'rejected', 'delegated'
            comments: Optional comments
            delegated_to_id: User ID if delegating
            ip_address: IP address of the action
        
        Returns:
            dict with success status and message
        """
        with transaction.atomic():
            # Get current approval record
            approval = WorkflowApproval.objects.filter(
                workflow_instance=instance,
                step=instance.current_step,
                approver=approver,
                action='pending'
            ).first()
            
            if not approval:
                raise ValueError("No pending approval found for this user")
            
            # Update approval record
            approval.action = action
            approval.comments = comments
            approval.action_taken_at = timezone.now()
            
            if action == 'delegated' and delegated_to_id:
                delegated_to = User.objects.get(id=delegated_to_id)
                approval.delegated_to = delegated_to
                
                # Create new approval record for delegated user
                WorkflowApproval.objects.create(
                    workflow_instance=instance,
                    step=instance.current_step,
                    approver=delegated_to,
                    action='pending',
                    due_date=approval.due_date
                )
                
                # Send delegation notifications
                workflow_notification_service.send_stage_notifications(
                    workflow_instance=instance,
                    stage='approval_delegated',
                    delegated_to_id=delegated_to_id,
                    delegated_by_id=approver.id,
                    additional_data={
                        'delegated_by': approver.get_full_name() or approver.username,
                        'delegated_to': delegated_to.get_full_name() or delegated_to.username,
                        'step_name': instance.current_step.name,
                        'comments': comments
                    }
                )
            
            approval.save()
            
            # Log the action
            WorkflowAuditLog.objects.create(
                workflow_instance=instance,
                user=approver,
                action=action,
                details={
                    'step': instance.current_step.name,
                    'comments': comments,
                    'delegated_to': delegated_to_id if action == 'delegated' else None
                },
                ip_address=ip_address
            )
            
            # Process workflow based on action
            if action == 'rejected':
                instance.status = 'rejected'
                instance.completed_at = timezone.now()
                instance.save()
                
                # Send rejection notification
                workflow_notification_service.send_stage_notifications(
                    workflow_instance=instance,
                    stage='approval_rejected',
                    additional_data={
                        'rejector_name': approver.get_full_name() or approver.username,
                        'step_name': instance.current_step.name,
                        'rejection_reason': comments,
                        'comments': comments
                    }
                )
                
                return {'success': True, 'message': 'Request rejected'}
            
            elif action == 'approved':
                # Send approval notification
                workflow_notification_service.send_stage_notifications(
                    workflow_instance=instance,
                    stage='approval_approved',
                    additional_data={
                        'approver_name': approver.get_full_name() or approver.username,
                        'step_name': instance.current_step.name,
                        'comments': comments
                    }
                )
                
                # Check if this step is complete
                if self._is_step_complete(instance, instance.current_step):
                    # Move to next step or complete workflow
                    next_step = self._get_next_step(instance)
                    if next_step:
                        instance.current_step = next_step
                        instance.save()
                        
                        # Create approval record for next step
                        next_approver = self._get_step_approvers(instance, next_step)[0]
                        if next_approver:
                            WorkflowApproval.objects.create(
                                workflow_instance=instance,
                                step=next_step,
                                approver=next_approver,
                                action='pending',
                                due_date=timezone.now() + timedelta(hours=next_step.timeout_hours or 48)
                            )
                            
                            # Send approval assignment notification
                            workflow_notification_service.send_stage_notifications(
                                workflow_instance=instance,
                                stage='approval_assigned',
                                approver_id=next_approver.id,
                                additional_data={
                                    'step_name': next_step.name,
                                    'previous_approver': approver.get_full_name() or approver.username
                                }
                            )
                            
                            # Send step completed notification
                            workflow_notification_service.send_stage_notifications(
                                workflow_instance=instance,
                                stage='step_completed',
                                additional_data={
                                    'completed_step': approval.step.name,
                                    'next_step': next_step.name,
                                    'approver_name': approver.get_full_name() or approver.username
                                }
                            )
                    else:
                        # Workflow completed
                        instance.status = 'approved'
                        instance.completed_at = timezone.now()
                        instance.save()
                        
                        # Send workflow completion notification
                        workflow_notification_service.send_stage_notifications(
                            workflow_instance=instance,
                            stage='workflow_completed',
                            additional_data={
                                'final_approver': approver.get_full_name() or approver.username,
                                'completion_time': instance.completed_at.isoformat()
                            }
                        )
                        
                        return {'success': True, 'message': 'Request fully approved'}
                else:
                    return {'success': True, 'message': 'Approved. Waiting for other approvers.'}
            
            elif action == 'delegated':
                self._send_notification(
                    instance, 'assignment',
                    User.objects.get(id=delegated_to_id),
                    f"Workflow approval delegated to you",
                    f"A {instance.template.workflow_type} request has been delegated to you for approval."
                )
                
                return {'success': True, 'message': 'Successfully delegated'}
    
    def _create_approval_records(self, instance):
        """Create approval records for all workflow steps"""
        for step in instance.template.steps.all():
            if step.step_type == 'approval':
                # We'll create the actual approval records when steps are assigned
                pass
    
    def _assign_step_approvers(self, instance, step):
        """Assign approvers for a specific step"""
        approvers = self._get_step_approvers(instance, step)
        
        due_date = timezone.now() + timedelta(hours=step.timeout_hours)
        
        for approver in approvers:
            approval, created = WorkflowApproval.objects.get_or_create(
                workflow_instance=instance,
                step=step,
                approver=approver,
                defaults={
                    'action': 'pending',
                    'due_date': due_date
                }
            )
            
            if created and step.send_notification:
                self._send_notification(
                    instance, 'assignment',
                    approver,
                    f"New {instance.template.workflow_type} approval required",
                    f"You have a new {instance.template.workflow_type} request to review: {instance.instance_id}"
                )
    
    def _get_step_approvers(self, instance, step):
        """Get list of approvers for a step based on approver type"""
        approvers = []
        
        if step.approver_type == 'specific_user' and step.specific_approver:
            approvers.append(step.specific_approver)
        
        elif step.approver_type == 'direct_manager':
            # Logic to find direct manager
            if hasattr(instance.requester, 'manager'):
                approvers.append(instance.requester.manager)
        
        elif step.approver_type == 'department_head':
            # Logic to find department head
            if instance.requester.department:
                dept_head = instance.requester.department.supervisor
                if dept_head:
                    approvers.append(dept_head)
        
        elif step.approver_type == 'finance_manager':
            finance_managers = User.objects.filter(
                role='manager',
                department__name='FINANCE'
            )
            approvers.extend(finance_managers)
        
        elif step.approver_type == 'hr_manager':
            hr_managers = User.objects.filter(
                role='manager',
                department__name='HR'
            )
            approvers.extend(hr_managers)
        
        elif step.approver_type == 'it_manager':
            it_managers = User.objects.filter(
                role='manager',
                department__name='OPERATIONS'  # Assuming IT is under Operations
            )
            approvers.extend(it_managers)
        
        elif step.approver_type == 'procurement_manager':
            procurement_managers = User.objects.filter(
                role='manager',
                department__name='LOGISTICS/PROCUREMENT/SUPPLY CHAIN'
            )
            approvers.extend(procurement_managers)
        
        elif step.approver_type == 'country_director':
            cd_users = User.objects.filter(
                role__in=['executive', 'superadmin'],
                department__name='CD'
            )
            approvers.extend(cd_users)
        
        elif step.approver_type == 'role_based' and step.required_role:
            role_users = User.objects.filter(role=step.required_role)
            approvers.extend(role_users)
        
        return list(set(approvers))  # Remove duplicates
    
    def _is_step_complete(self, instance, step):
        """Check if all required approvals for a step are complete"""
        pending_approvals = WorkflowApproval.objects.filter(
            workflow_instance=instance,
            step=step,
            action='pending'
        ).count()
        
        return pending_approvals == 0
    
    def _get_next_step(self, instance):
        """Get the next step in the workflow"""
        current_order = instance.current_step.step_order
        return instance.template.steps.filter(
            step_order__gt=current_order
        ).order_by('step_order').first()
    
    def escalate_overdue_approvals(self):
        """
        Escalate overdue approvals (to be called by scheduled task)
        """
        overdue_approvals = WorkflowApproval.objects.filter(
            action='pending',
            due_date__lt=timezone.now()
        )
        
        for approval in overdue_approvals:
            escalation_target = self._find_escalation_target(approval.approver)
            if escalation_target:
                # Create new approval for escalation target
                WorkflowApproval.objects.create(
                    workflow_instance=approval.workflow_instance,
                    step=approval.step,
                    approver=escalation_target,
                    action='pending',
                    due_date=timezone.now() + timedelta(hours=24),
                    escalated_from=approval
                )
                
                # Mark as escalated
                approval.action = 'escalated'
                approval.action_taken_at = timezone.now()
                approval.save()
                
                # Send escalation notifications
                workflow_notification_service.send_stage_notifications(
                    workflow_instance=approval.workflow_instance,
                    stage='workflow_escalated',
                    escalated_to_id=escalation_target.id,
                    original_approver_id=approval.approver.id,
                    additional_data={
                        'escalated_from': approval.approver.get_full_name() or approval.approver.username,
                        'escalated_to': escalation_target.get_full_name() or escalation_target.username,
                        'step_name': approval.step.name,
                        'overdue_hours': int((timezone.now() - approval.due_date).total_seconds() / 3600)
                    }
                )
                
                # Log escalation
                WorkflowAuditLog.objects.create(
                    workflow_instance=approval.workflow_instance,
                    user=None,
                    action='escalated',
                    details={
                        'step': approval.step.name,
                        'original_approver': approval.approver.username,
                        'escalated_to': escalation_target.username,
                        'overdue_hours': int((timezone.now() - approval.due_date).total_seconds() / 3600)
                    }
                )
    
    def _get_step_approvers(self, instance, step):
        """Get list of approvers for a step based on approver type"""
        approvers = []
    
        if step.approver_type == 'specific_user' and step.specific_approver:
            approvers.append(step.specific_approver)
        
        elif step.approver_type == 'direct_manager':
            # Logic to find direct manager
            if hasattr(instance.requester, 'manager'):
                approvers.append(instance.requester.manager)
        
        elif step.approver_type == 'department_head':
            # Logic to find department head
            if instance.requester.department:
                dept_head = instance.requester.department.supervisor
                if dept_head:
                    approvers.append(dept_head)
        
        elif step.approver_type == 'finance_manager':
            finance_managers = User.objects.filter(
                role='manager',
                department__name='FINANCE'
            )
            approvers.extend(finance_managers)
        
        elif step.approver_type == 'hr_manager':
            hr_managers = User.objects.filter(
                role='manager',
                department__name='HR'
            )
            approvers.extend(hr_managers)
        
        elif step.approver_type == 'it_manager':
            it_managers = User.objects.filter(
                role='manager',
                department__name='OPERATIONS'  # Assuming IT is under Operations
            )
            approvers.extend(it_managers)
        
        elif step.approver_type == 'procurement_manager':
            procurement_managers = User.objects.filter(
                role='manager',
                department__name='LOGISTICS/PROCUREMENT/SUPPLY CHAIN'
            )
            approvers.extend(procurement_managers)
        
        elif step.approver_type == 'country_director':
            cd_users = User.objects.filter(
                role__in=['executive', 'superadmin'],
                department__name='CD'
            )
            approvers.extend(cd_users)
        
        return approvers
    
    def _find_escalation_target(self, user):
        """Find escalation target for a user"""
        # Simple logic: escalate to department head or CD
        if user.department and user.department.supervisor:
            return user.department.supervisor
        
        # Fallback to CD
        cd_user = User.objects.filter(
            role__in=['executive', 'superadmin'],
            department__name='CD'
        ).first()
        
        return cd_user

class WorkflowIntegrationService:
    """Service for integrating workflows with other modules"""
    
    @staticmethod
    def get_default_template(workflow_type):
        """Get default template for a workflow type"""
        return WorkflowTemplate.objects.filter(
            workflow_type=workflow_type,
            is_default=True,
            is_active=True
        ).first()
    
    @staticmethod
    def create_default_templates():
        """Create default workflow templates for common processes"""
        templates = [
            {
                'name': 'Standard Staff Request Approval',
                'workflow_type': 'staff_request',
                'description': 'Standard approval process for staff requests',
                'is_default': True,
                'require_manager_approval': True,
                'steps': [
                    {
                        'step_order': 1,
                        'name': 'Manager Approval',
                        'step_type': 'approval',
                        'approver_type': 'direct_manager',
                        'is_required': True,
                        'timeout_hours': 48
                    }
                ]
            },
            {
                'name': 'Standard Procurement Approval',
                'workflow_type': 'procurement',
                'description': 'Standard approval process for procurement requests',
                'is_default': True,
                'require_manager_approval': True,
                'require_finance_approval': True,
                'auto_approve_threshold': 1000.00,
                'steps': [
                    {
                        'step_order': 1,
                        'name': 'Manager Approval',
                        'step_type': 'approval',
                        'approver_type': 'direct_manager',
                        'is_required': True,
                        'timeout_hours': 48
                    },
                    {
                        'step_order': 2,
                        'name': 'Procurement Manager Approval',
                        'step_type': 'approval',
                        'approver_type': 'procurement_manager',
                        'is_required': True,
                        'timeout_hours': 72,
                        'condition_field': 'amount',
                        'condition_operator': 'gt',
                        'condition_value': '1000'
                    },
                    {
                        'step_order': 3,
                        'name': 'Finance Manager Approval',
                        'step_type': 'approval',
                        'approver_type': 'finance_manager',
                        'is_required': True,
                        'timeout_hours': 72,
                        'condition_field': 'amount',
                        'condition_operator': 'gt',
                        'condition_value': '5000'
                    }
                ]
            },
            {
                'name': 'Standard Leave Request Approval',
                'workflow_type': 'leave_request',
                'description': 'Standard approval process for leave requests',
                'is_default': True,
                'require_manager_approval': True,
                'require_hr_approval': True,
                'steps': [
                    {
                        'step_order': 1,
                        'name': 'Manager Approval',
                        'step_type': 'approval',
                        'approver_type': 'direct_manager',
                        'is_required': True,
                        'timeout_hours': 48
                    },
                    {
                        'step_order': 2,
                        'name': 'HR Approval',
                        'step_type': 'approval',
                        'approver_type': 'hr_manager',
                        'is_required': True,
                        'timeout_hours': 48,
                        'condition_field': 'days',
                        'condition_operator': 'gt',
                        'condition_value': '5'
                    }
                ]
            },
            {
                'name': 'Standard IT Ticket Approval',
                'workflow_type': 'it_ticket',
                'description': 'Standard approval process for IT tickets',
                'is_default': True,
                'require_manager_approval': True,
                'steps': [
                    {
                        'step_order': 1,
                        'name': 'IT Manager Review',
                        'step_type': 'approval',
                        'approver_type': 'it_manager',
                        'is_required': True,
                        'timeout_hours': 24
                    }
                ]
            }
        ]
        
        for template_data in templates:
            steps_data = template_data.pop('steps', [])
            
            template, created = WorkflowTemplate.objects.get_or_create(
                workflow_type=template_data['workflow_type'],
                is_default=True,
                defaults=template_data
            )
            
            if created:
                for step_data in steps_data:
                    WorkflowStep.objects.create(template=template, **step_data)
        
        return True
