from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, NotificationChannel, NotificationTemplate, TransferApproval

User = get_user_model()

class NotificationChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationChannel
        fields = ['id', 'name', 'channel_type', 'is_enabled', 'configuration', 'created_at']

class NotificationTemplateSerializer(serializers.ModelSerializer):
    channel = NotificationChannelSerializer(read_only=True)
    
    class Meta:
        model = NotificationTemplate
        fields = ['id', 'name', 'template_type', 'channel', 'subject_template', 
                 'body_template', 'is_active', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    recipient = serializers.StringRelatedField()
    sender = serializers.StringRelatedField()
    channel = NotificationChannelSerializer(read_only=True)
    template = NotificationTemplateSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'sender', 'channel', 'template', 'subject', 
                 'message', 'notification_type', 'reference_id', 'reference_type',
                 'status', 'sent_at', 'delivered_at', 'read_at', 'requires_response',
                 'response_data', 'response_at', 'created_at', 'updated_at']

class TransferApprovalSerializer(serializers.ModelSerializer):
    transfer = serializers.StringRelatedField()
    approver = serializers.StringRelatedField()
    
    class Meta:
        model = TransferApproval
        fields = ['id', 'transfer', 'approver', 'status', 'requested_at', 
                 'reviewed_at', 'expires_at', 'approval_notes', 'rejection_reason',
                 'notifications_sent', 'created_at', 'updated_at']

class ApprovalActionSerializer(serializers.Serializer):
    """Serializer for approval/rejection actions"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    notes = serializers.CharField(required=False, allow_blank=True)
    reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        if data['action'] == 'reject' and not data.get('reason'):
            raise serializers.ValidationError("Rejection reason is required when rejecting a transfer.")
        return data
