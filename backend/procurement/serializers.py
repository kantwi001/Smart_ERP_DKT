from rest_framework import serializers
from .models import (
    ProcurementWorkflowStage, ProcurementRequest, ProcurementAudit, 
    Vendor, ProcurementApproval, BidAnalysis, PurchaseOrder, PaymentVoucher
)
from users.serializers import UserSerializer

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'is_active', 'created_at']

class ProcurementWorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcurementWorkflowStage
        fields = ['id', 'name', 'order']

class ProcurementAuditSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    class Meta:
        model = ProcurementAudit
        fields = ['id', 'actor_name', 'action', 'comment', 'attachment', 'timestamp']

class ProcurementApprovalSerializer(serializers.ModelSerializer):
    approver_name = serializers.CharField(source='approver.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = ProcurementApproval
        fields = ['id', 'approver', 'approver_name', 'stage', 'action', 'comment', 'assigned_to', 'assigned_to_name', 'created_at']

class BidAnalysisSerializer(serializers.ModelSerializer):
    analyzed_by_name = serializers.CharField(source='analyzed_by.get_full_name', read_only=True)
    
    class Meta:
        model = BidAnalysis
        fields = ['id', 'analyzed_by', 'analyzed_by_name', 'vendor_quotes', 'analysis_notes', 'recommendation', 'created_at']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'po_number', 'vendor', 'vendor_name', 'total_amount', 'terms_and_conditions', 
                 'delivery_date', 'generated_by', 'generated_by_name', 'created_at']

class PaymentVoucherSerializer(serializers.ModelSerializer):
    prepared_by_name = serializers.CharField(source='prepared_by.get_full_name', read_only=True)
    approved_by_finance_name = serializers.CharField(source='approved_by_finance.get_full_name', read_only=True)
    approved_by_cd_name = serializers.CharField(source='approved_by_cd.get_full_name', read_only=True)
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)
    
    class Meta:
        model = PaymentVoucher
        fields = ['id', 'voucher_number', 'cheque_number', 'amount', 'prepared_by', 'prepared_by_name',
                 'approved_by_finance', 'approved_by_finance_name', 'approved_by_cd', 'approved_by_cd_name',
                 'po_number', 'status', 'created_at']

class ProcurementRequestSerializer(serializers.ModelSerializer):
    audits = ProcurementAuditSerializer(many=True, read_only=True)
    approvals = ProcurementApprovalSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    current_approver_name = serializers.CharField(source='current_approver.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    assigned_procurement_officer_name = serializers.CharField(source='assigned_procurement_officer.get_full_name', read_only=True)
    assigned_finance_officer_name = serializers.CharField(source='assigned_finance_officer.get_full_name', read_only=True)
    selected_vendor_name = serializers.CharField(source='selected_vendor.name', read_only=True)
    bid_analysis = BidAnalysisSerializer(read_only=True)
    purchase_order = PurchaseOrderSerializer(read_only=True)
    
    class Meta:
        model = ProcurementRequest
        fields = [
            'id', 'title', 'description', 'item', 'quantity', 'estimated_cost', 'urgency', 'reason',
            'status', 'current_stage', 'current_approver', 'current_approver_name',
            'assigned_procurement_officer', 'assigned_procurement_officer_name',
            'assigned_finance_officer', 'assigned_finance_officer_name',
            'selected_vendor', 'selected_vendor_name', 'bid_analysis_report',
            'po_number', 'po_amount', 'po_generated_at',
            'payment_voucher_number', 'cheque_number', 'payment_amount',
            'department', 'department_name', 'created_by', 'created_by_name',
            'workflow_instance', 'created_at', 'updated_at',
            'audits', 'approvals', 'bid_analysis', 'purchase_order'
        ]
    
    def create(self, validated_data):
        # Set the created_by to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
