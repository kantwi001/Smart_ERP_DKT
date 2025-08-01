# transactions/serializers.py - Serializers for transaction API
from rest_framework import serializers
from .models import Transaction, TransactionLog, ModuleIntegration, TransactionAnalytics

class TransactionSerializer(serializers.ModelSerializer):
    target_modules_display = serializers.ReadOnlyField()
    affected_modules = serializers.ReadOnlyField()
    is_cross_module = serializers.ReadOnlyField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_id', 'transaction_type', 'status',
            'source_module', 'target_modules', 'target_modules_display',
            'transaction_data', 'metadata', 'amount', 'currency',
            'created_by', 'created_at', 'updated_at', 'completed_at',
            'error_message', 'retry_count', 'workflow_id', 'workflow_step',
            'affected_modules', 'is_cross_module'
        ]
        read_only_fields = ['transaction_id', 'created_at', 'updated_at', 'completed_at']

    def create(self, validated_data):
        # Set created_by from request user
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)

class TransactionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionLog
        fields = '__all__'
        read_only_fields = ['created_at']

class ModuleIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModuleIntegration
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class TransactionAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionAnalytics
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class TransactionCreateSerializer(serializers.Serializer):
    """Simplified serializer for creating transactions from frontend"""
    transaction_type = serializers.ChoiceField(choices=Transaction.TRANSACTION_TYPES)
    source_module = serializers.ChoiceField(choices=Transaction.MODULE_CHOICES)
    target_modules = serializers.ListField(
        child=serializers.ChoiceField(choices=Transaction.MODULE_CHOICES),
        required=False,
        default=list
    )
    transaction_data = serializers.JSONField(default=dict)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    workflow_id = serializers.CharField(max_length=100, required=False)
    workflow_step = serializers.IntegerField(required=False)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        
        transaction = Transaction.objects.create(**validated_data)
        return transaction

class ModuleAnalyticsSerializer(serializers.Serializer):
    """Serializer for module-specific analytics"""
    module = serializers.CharField()
    incoming_transactions = serializers.IntegerField()
    outgoing_transactions = serializers.IntegerField()
    total_transactions = serializers.IntegerField()
    total_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    average_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    success_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_sources = serializers.ListField()
    top_targets = serializers.ListField()
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()
