# transactions/views.py - API views for transaction management
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Transaction, TransactionLog, TransactionAnalytics
from .serializers import (
    TransactionSerializer, TransactionCreateSerializer, 
    TransactionLogSerializer, ModuleAnalyticsSerializer
)

class TransactionListCreateView(generics.ListCreateAPIView):
    """List all transactions or create a new transaction"""
    queryset = Transaction.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TransactionCreateSerializer
        return TransactionSerializer
    
    def get_queryset(self):
        queryset = Transaction.objects.all()
        
        # Filter by module
        module = self.request.query_params.get('module', None)
        if module:
            queryset = queryset.filter(
                Q(source_module=module) | Q(target_modules__contains=[module])
            )
        
        # Filter by transaction type
        transaction_type = self.request.query_params.get('type', None)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Limit results
        limit = self.request.query_params.get('limit', None)
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
        
        return queryset.order_by('-created_at')

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a transaction"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def module_transactions(request, module_id):
    """Get transactions for a specific module"""
    try:
        limit = int(request.GET.get('limit', 50))
        
        # Get transactions where module is source or target
        transactions = Transaction.objects.filter(
            Q(source_module=module_id) | Q(target_modules__contains=[module_id])
        ).order_by('-created_at')[:limit]
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to get transactions: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def transaction_analytics(request, module_id):
    """Get analytics for a specific module"""
    try:
        period = request.GET.get('period', '30d')
        
        # Calculate date range
        if period == '7d':
            start_date = timezone.now() - timedelta(days=7)
        elif period == '30d':
            start_date = timezone.now() - timedelta(days=30)
        elif period == '90d':
            start_date = timezone.now() - timedelta(days=90)
        else:
            start_date = timezone.now() - timedelta(days=30)
        
        end_date = timezone.now()
        
        # Get transactions for the module in the period
        incoming_transactions = Transaction.objects.filter(
            target_modules__contains=[module_id],
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        outgoing_transactions = Transaction.objects.filter(
            source_module=module_id,
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        
        # Calculate metrics
        incoming_count = incoming_transactions.count()
        outgoing_count = outgoing_transactions.count()
        total_count = incoming_count + outgoing_count
        
        # Calculate total value
        total_value = 0
        average_value = 0
        if total_count > 0:
            all_transactions = Transaction.objects.filter(
                Q(source_module=module_id) | Q(target_modules__contains=[module_id]),
                created_at__gte=start_date,
                created_at__lte=end_date,
                amount__isnull=False
            )
            
            value_aggregate = all_transactions.aggregate(
                total=Sum('amount'),
                average=Avg('amount')
            )
            total_value = float(value_aggregate['total'] or 0)
            average_value = float(value_aggregate['average'] or 0)
        
        # Calculate success rate
        completed_transactions = Transaction.objects.filter(
            Q(source_module=module_id) | Q(target_modules__contains=[module_id]),
            created_at__gte=start_date,
            created_at__lte=end_date,
            status='completed'
        ).count()
        
        success_rate = (completed_transactions / total_count * 100) if total_count > 0 else 0
        
        # Get top sources (modules that send transactions to this module)
        top_sources = list(incoming_transactions.values('source_module').annotate(
            count=Count('source_module')
        ).order_by('-count')[:5])
        
        # Get top targets (modules that receive transactions from this module)
        top_targets = []
        for transaction in outgoing_transactions:
            for target in transaction.target_modules:
                top_targets.append(target)
        
        # Count target occurrences
        target_counts = {}
        for target in top_targets:
            target_counts[target] = target_counts.get(target, 0) + 1
        
        top_targets = [
            {'module': module, 'count': count}
            for module, count in sorted(target_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        analytics_data = {
            'module': module_id,
            'incoming_transactions': incoming_count,
            'outgoing_transactions': outgoing_count,
            'total_transactions': total_count,
            'total_value': total_value,
            'average_value': average_value,
            'success_rate': round(success_rate, 2),
            'top_sources': top_sources,
            'top_targets': top_targets,
            'period_start': start_date,
            'period_end': end_date
        }
        
        return Response(analytics_data)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to get analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_workflow_transaction(request):
    """Create a transaction as part of a workflow"""
    try:
        data = request.data
        workflow_id = data.get('workflow_id')
        workflow_step = data.get('workflow_step', 1)
        
        # Create transaction with workflow information
        serializer = TransactionCreateSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            transaction = serializer.save(
                workflow_id=workflow_id,
                workflow_step=workflow_step
            )
            
            # Create transaction log
            TransactionLog.objects.create(
                transaction=transaction,
                step=f"Workflow Step {workflow_step}",
                status='processing',
                message=f"Transaction created as part of workflow {workflow_id}",
                created_by=request.user
            )
            
            return Response(
                TransactionSerializer(transaction).data,
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to create workflow transaction: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_transaction(request, transaction_id):
    """Mark a transaction as completed"""
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        transaction.mark_completed(request.user)
        
        # Create completion log
        TransactionLog.objects.create(
            transaction=transaction,
            step="Completion",
            status='completed',
            message="Transaction marked as completed",
            created_by=request.user
        )
        
        return Response(TransactionSerializer(transaction).data)
    
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to complete transaction: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def fail_transaction(request, transaction_id):
    """Mark a transaction as failed"""
    try:
        transaction = Transaction.objects.get(id=transaction_id)
        error_message = request.data.get('error_message', 'Transaction failed')
        transaction.mark_failed(error_message, request.user)
        
        # Create failure log
        TransactionLog.objects.create(
            transaction=transaction,
            step="Failure",
            status='failed',
            message=error_message,
            created_by=request.user
        )
        
        return Response(TransactionSerializer(transaction).data)
    
    except Transaction.DoesNotExist:
        return Response(
            {'error': 'Transaction not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to mark transaction as failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def cross_module_analytics(request):
    """Get cross-module transaction analytics"""
    try:
        period = request.GET.get('period', '30d')
        
        # Calculate date range
        if period == '7d':
            start_date = timezone.now() - timedelta(days=7)
        elif period == '30d':
            start_date = timezone.now() - timedelta(days=30)
        elif period == '90d':
            start_date = timezone.now() - timedelta(days=90)
        else:
            start_date = timezone.now() - timedelta(days=30)
        
        # Get all modules
        modules = ['sales', 'inventory', 'procurement', 'manufacturing', 'accounting', 'hr', 'pos', 'warehouse', 'customers', 'reporting']
        
        analytics = {}
        for module in modules:
            module_data = transaction_analytics(request, module).data
            analytics[module] = module_data
        
        return Response(analytics)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to get cross-module analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
