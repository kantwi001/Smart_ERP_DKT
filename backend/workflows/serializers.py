from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    WorkflowTemplate, WorkflowStep, WorkflowInstance, 
    WorkflowApproval, WorkflowNotification, WorkflowAuditLog,
    WorkflowConfiguration
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class WorkflowStepSerializer(serializers.ModelSerializer):
    specific_approver_details = UserSerializer(source='specific_approver', read_only=True)
    
    class Meta:
        model = WorkflowStep
        fields = [
            'id', 'step_order', 'name', 'step_type', 'approver_type',
            'specific_approver', 'specific_approver_details', 'required_role',
            'condition_field', 'condition_operator', 'condition_value',
            'is_required', 'timeout_hours', 'allow_delegate', 'send_notification'
        ]

class WorkflowTemplateSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = WorkflowTemplate
        fields = [
            'id', 'name', 'workflow_type', 'description', 'is_active', 'is_default',
            'created_by', 'created_by_details', 'created_at', 'updated_at',
            'auto_approve_threshold', 'require_manager_approval', 'require_finance_approval',
            'require_hr_approval', 'require_it_approval', 'escalation_days', 'steps'
        ]

class WorkflowTemplateCreateSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, required=False)
    
    class Meta:
        model = WorkflowTemplate
        fields = [
            'name', 'workflow_type', 'description', 'is_active', 'is_default',
            'auto_approve_threshold', 'require_manager_approval', 'require_finance_approval',
            'require_hr_approval', 'require_it_approval', 'escalation_days', 'steps'
        ]
    
    def create(self, validated_data):
        steps_data = validated_data.pop('steps', [])
        template = WorkflowTemplate.objects.create(**validated_data)
        
        for step_data in steps_data:
            WorkflowStep.objects.create(template=template, **step_data)
        
        return template

class WorkflowApprovalSerializer(serializers.ModelSerializer):
    approver_details = UserSerializer(source='approver', read_only=True)
    delegated_to_details = UserSerializer(source='delegated_to', read_only=True)
    step_details = WorkflowStepSerializer(source='step', read_only=True)
    
    class Meta:
        model = WorkflowApproval
        fields = [
            'id', 'step', 'step_details', 'approver', 'approver_details',
            'action', 'comments', 'delegated_to', 'delegated_to_details',
            'assigned_at', 'action_taken_at', 'due_date'
        ]

class WorkflowInstanceSerializer(serializers.ModelSerializer):
    template_details = WorkflowTemplateSerializer(source='template', read_only=True)
    current_step_details = WorkflowStepSerializer(source='current_step', read_only=True)
    requester_details = UserSerializer(source='requester', read_only=True)
    approvals = WorkflowApprovalSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkflowInstance
        fields = [
            'id', 'template', 'template_details', 'instance_id', 'status',
            'current_step', 'current_step_details', 'requester', 'requester_details',
            'created_at', 'updated_at', 'completed_at', 'request_data', 'notes',
            'approvals'
        ]

class WorkflowNotificationSerializer(serializers.ModelSerializer):
    recipient_details = UserSerializer(source='recipient', read_only=True)
    
    class Meta:
        model = WorkflowNotification
        fields = [
            'id', 'notification_type', 'recipient', 'recipient_details',
            'channel', 'subject', 'message', 'sent_at', 'delivered', 'read'
        ]

class WorkflowAuditLogSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = WorkflowAuditLog
        fields = [
            'id', 'user', 'user_details', 'action', 'details',
            'timestamp', 'ip_address'
        ]

class WorkflowConfigurationSerializer(serializers.ModelSerializer):
    updated_by_details = UserSerializer(source='updated_by', read_only=True)
    
    class Meta:
        model = WorkflowConfiguration
        fields = [
            'id', 'key', 'value', 'description',
            'updated_by', 'updated_by_details', 'updated_at'
        ]

class WorkflowActionSerializer(serializers.Serializer):
    """Serializer for workflow approval actions"""
    action = serializers.ChoiceField(choices=['approved', 'rejected', 'delegated'])
    comments = serializers.CharField(required=False, allow_blank=True)
    delegated_to = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        if data.get('action') == 'delegated' and not data.get('delegated_to'):
            raise serializers.ValidationError("delegated_to is required when action is 'delegated'")
        return data
