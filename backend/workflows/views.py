from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from .models import (
    WorkflowTemplate, WorkflowStep, WorkflowInstance, 
    WorkflowApproval, WorkflowNotification, WorkflowAuditLog,
    WorkflowConfiguration
)
from .serializers import (
    WorkflowTemplateSerializer, WorkflowTemplateCreateSerializer,
    WorkflowStepSerializer, WorkflowInstanceSerializer,
    WorkflowApprovalSerializer, WorkflowNotificationSerializer,
    WorkflowAuditLogSerializer, WorkflowConfigurationSerializer,
    WorkflowActionSerializer
)
from .services import WorkflowService
from .notification_service import workflow_notification_service

class WorkflowTemplateViewSet(viewsets.ModelViewSet):
    queryset = WorkflowTemplate.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return WorkflowTemplateCreateSerializer
        return WorkflowTemplateSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get workflow templates by type"""
        workflow_type = request.query_params.get('type')
        if workflow_type:
            templates = self.queryset.filter(workflow_type=workflow_type, is_active=True)
            serializer = self.get_serializer(templates, many=True)
            return Response(serializer.data)
        return Response({'error': 'type parameter is required'}, status=400)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a workflow template"""
        template = self.get_object()
        new_template = WorkflowTemplate.objects.create(
            name=f"{template.name} (Copy)",
            workflow_type=template.workflow_type,
            description=template.description,
            created_by=request.user,
            auto_approve_threshold=template.auto_approve_threshold,
            require_manager_approval=template.require_manager_approval,
            require_finance_approval=template.require_finance_approval,
            require_hr_approval=template.require_hr_approval,
            require_it_approval=template.require_it_approval,
            escalation_days=template.escalation_days
        )
        
        # Duplicate steps
        for step in template.steps.all():
            WorkflowStep.objects.create(
                template=new_template,
                step_order=step.step_order,
                name=step.name,
                step_type=step.step_type,
                approver_type=step.approver_type,
                specific_approver=step.specific_approver,
                required_role=step.required_role,
                condition_field=step.condition_field,
                condition_operator=step.condition_operator,
                condition_value=step.condition_value,
                is_required=step.is_required,
                timeout_hours=step.timeout_hours,
                allow_delegate=step.allow_delegate,
                send_notification=step.send_notification
            )
        
        serializer = self.get_serializer(new_template)
        return Response(serializer.data)

class WorkflowStepViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStep.objects.all()
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        template_id = self.request.query_params.get('template')
        if template_id:
            return self.queryset.filter(template_id=template_id)
        return self.queryset

class WorkflowInstanceViewSet(viewsets.ModelViewSet):
    queryset = WorkflowInstance.objects.all()
    serializer_class = WorkflowInstanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by requester
        requester = self.request.query_params.get('requester')
        if requester:
            queryset = queryset.filter(requester_id=requester)
        
        # Filter by workflow type
        workflow_type = self.request.query_params.get('type')
        if workflow_type:
            queryset = queryset.filter(template__workflow_type=workflow_type)
        
        # Filter by pending approvals for current user
        pending_for_me = self.request.query_params.get('pending_for_me')
        if pending_for_me == 'true':
            queryset = queryset.filter(
                approvals__approver=self.request.user,
                approvals__action='pending'
            ).distinct()
        
        return queryset.select_related('template', 'current_step', 'requester')
    
    @action(detail=True, methods=['post'])
    def take_action(self, request, pk=None):
        """Take approval action on a workflow instance"""
        instance = self.get_object()
        serializer = WorkflowActionSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                workflow_service = WorkflowService()
                result = workflow_service.process_approval(
                    instance=instance,
                    approver=request.user,
                    action=serializer.validated_data['action'],
                    comments=serializer.validated_data.get('comments', ''),
                    delegated_to_id=serializer.validated_data.get('delegated_to'),
                    ip_address=self.get_client_ip(request)
                )
                
                return Response({
                    'success': True,
                    'message': result['message'],
                    'instance': WorkflowInstanceSerializer(instance).data
                })
            
            except Exception as e:
                return Response({
                    'success': False,
                    'error': str(e)
                }, status=400)
        
        return Response(serializer.errors, status=400)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a workflow instance"""
        instance = self.get_object()
        
        if instance.status != 'in_progress':
            return Response(
                {'error': 'Only in-progress workflows can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.status = 'cancelled'
        instance.completed_at = timezone.now()
        instance.save()
        
        # Send cancellation notifications
        workflow_notification_service.send_stage_notifications(
            workflow_instance=instance,
            stage='workflow_cancelled',
            additional_data={
                'cancelled_by': request.user.get_full_name() or request.user.username,
                'cancellation_time': instance.completed_at.isoformat()
            }
        )
        
        return Response({'success': True, 'message': 'Workflow cancelled'})
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class WorkflowApprovalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkflowApproval.objects.all()
    serializer_class = WorkflowApprovalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by approver
        approver = self.request.query_params.get('approver')
        if approver:
            queryset = queryset.filter(approver_id=approver)
        
        # Filter by workflow instance
        instance = self.request.query_params.get('instance')
        if instance:
            queryset = queryset.filter(workflow_instance_id=instance)
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        return queryset.select_related('approver', 'step', 'workflow_instance')

class WorkflowNotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkflowNotification.objects.all()
    serializer_class = WorkflowNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own notifications
        return self.queryset.filter(recipient=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'success': True})

class WorkflowAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkflowAuditLog.objects.all()
    serializer_class = WorkflowAuditLogSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        
        # Filter by workflow instance
        instance = self.request.query_params.get('instance')
        if instance:
            queryset = queryset.filter(workflow_instance_id=instance)
        
        return queryset.select_related('user', 'workflow_instance')

class WorkflowConfigurationViewSet(viewsets.ModelViewSet):
    queryset = WorkflowConfiguration.objects.all()
    serializer_class = WorkflowConfigurationSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def system_settings(self, request):
        """Get all workflow system settings"""
        configs = self.queryset.all()
        data = {config.key: config.value for config in configs}
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update workflow configurations"""
        updates = request.data.get('configurations', {})
        
        with transaction.atomic():
            for key, value in updates.items():
                config, created = WorkflowConfiguration.objects.get_or_create(
                    key=key,
                    defaults={'value': value, 'updated_by': request.user}
                )
                if not created:
                    config.value = value
                    config.updated_by = request.user
                    config.save()
        
        return Response({'success': True, 'message': 'Configurations updated'})

class WorkflowDashboardViewSet(viewsets.ViewSet):
    """Dashboard views for workflow analytics"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get workflow statistics"""
        stats = {
            'total_templates': WorkflowTemplate.objects.filter(is_active=True).count(),
            'active_instances': WorkflowInstance.objects.filter(status='in_progress').count(),
            'pending_approvals': WorkflowApproval.objects.filter(
                approver=request.user,
                action='pending'
            ).count(),
            'completed_this_month': WorkflowInstance.objects.filter(
                status='approved',
                completed_at__month=timezone.now().month
            ).count()
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def my_tasks(self, request):
        """Get pending tasks for current user"""
        pending_approvals = WorkflowApproval.objects.filter(
            approver=request.user,
            action='pending'
        ).select_related('workflow_instance', 'step')
        
        serializer = WorkflowApprovalSerializer(pending_approvals, many=True)
        return Response(serializer.data)
