from django.contrib import admin
from .models import (
    WorkflowTemplate, WorkflowStep, WorkflowInstance, 
    WorkflowApproval, WorkflowNotification, WorkflowAuditLog,
    WorkflowConfiguration
)

class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1
    ordering = ['step_order']

@admin.register(WorkflowTemplate)
class WorkflowTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'workflow_type', 'is_active', 'is_default', 'created_by', 'created_at']
    list_filter = ['workflow_type', 'is_active', 'is_default', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [WorkflowStepInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'workflow_type', 'description', 'is_active', 'is_default')
        }),
        ('Approval Settings', {
            'fields': ('auto_approve_threshold', 'require_manager_approval', 
                      'require_finance_approval', 'require_hr_approval', 
                      'require_it_approval', 'escalation_days')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ['template', 'step_order', 'name', 'step_type', 'approver_type', 'is_required']
    list_filter = ['step_type', 'approver_type', 'is_required']
    search_fields = ['name', 'template__name']
    ordering = ['template', 'step_order']

@admin.register(WorkflowInstance)
class WorkflowInstanceAdmin(admin.ModelAdmin):
    list_display = ['instance_id', 'template', 'status', 'requester', 'created_at', 'completed_at']
    list_filter = ['status', 'template__workflow_type', 'created_at']
    search_fields = ['instance_id', 'requester__username', 'template__name']
    readonly_fields = ['instance_id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('template', 'instance_id', 'status', 'current_step')
        }),
        ('Request Details', {
            'fields': ('requester', 'request_data', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(WorkflowApproval)
class WorkflowApprovalAdmin(admin.ModelAdmin):
    list_display = ['workflow_instance', 'step', 'approver', 'action', 'assigned_at', 'action_taken_at']
    list_filter = ['action', 'assigned_at', 'action_taken_at']
    search_fields = ['workflow_instance__instance_id', 'approver__username', 'step__name']
    readonly_fields = ['assigned_at', 'action_taken_at']

@admin.register(WorkflowNotification)
class WorkflowNotificationAdmin(admin.ModelAdmin):
    list_display = ['workflow_instance', 'notification_type', 'recipient', 'channel', 'sent_at', 'delivered', 'read']
    list_filter = ['notification_type', 'channel', 'delivered', 'read', 'sent_at']
    search_fields = ['workflow_instance__instance_id', 'recipient__username', 'subject']
    readonly_fields = ['sent_at']

@admin.register(WorkflowAuditLog)
class WorkflowAuditLogAdmin(admin.ModelAdmin):
    list_display = ['workflow_instance', 'user', 'action', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['workflow_instance__instance_id', 'user__username', 'action']
    readonly_fields = ['timestamp']

@admin.register(WorkflowConfiguration)
class WorkflowConfigurationAdmin(admin.ModelAdmin):
    list_display = ['key', 'description', 'updated_by', 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['updated_at']
