from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from sales.models import Sale, Customer
from accounting.models import Transaction
from users.models import User
from .models import (
    Report, Survey, SurveyQuestion, SurveyResponse, SurveyAnswer,
    Route, RouteStop, RouteAssignment
)
from .serializers import (
    ReportSerializer, SurveySerializer, SurveyQuestionSerializer, SurveyResponseSerializer, SurveyAnswerSerializer,
    RouteSerializer, RouteStopSerializer, RouteAssignmentSerializer
)

class PowerBIEmbedAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Placeholder: In production, use PowerBI REST API to get embed token and URL
        # Example: return Response({'embed_url': ..., 'token': ...})
        return Response({
            'embed_url': 'https://app.powerbi.com/reportEmbed?reportId=YOUR_REPORT_ID&groupId=YOUR_GROUP_ID',
            'token': 'DUMMY_TOKEN_FOR_DEMO'
        })

class RevenueView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            revenue = Sale.objects.filter(status='completed').aggregate(total=models.Sum('total'))['total']
            if revenue is None:
                revenue = 0
            return Response({'revenue': revenue})
        except Exception as e:
            import logging
            logging.exception("RevenueView error")
            return Response({'revenue': 0, 'error': str(e)}, status=200)

class TransactionsPerStaffView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            data = (
                Sale.objects.filter(status='completed')
                .values('staff__id', 'staff__username')
                .annotate(transactions=models.Count('id'), total_sales=models.Sum('total'))
            )
            return Response({'transactions_per_staff': list(data)})
        except Exception as e:
            import logging
            logging.exception("TransactionsPerStaffView error")
            return Response({'transactions_per_staff': [], 'error': str(e)}, status=200)

class CustomerBalancesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            customers = Customer.objects.all()
            result = []
            for customer in customers:
                sales_total = Sale.objects.filter(customer=customer, status='completed').aggregate(total=models.Sum('total'))['total']
                if sales_total is None:
                    sales_total = 0
                result.append({
                    'customer_id': customer.id,
                    'customer_name': customer.name,
                    'balance': sales_total
                })
            return Response({'customer_balances': result})
        except Exception as e:
            import logging
            logging.exception("CustomerBalancesView error")
            return Response({'customer_balances': [], 'error': str(e)}, status=200)

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]

class SurveyQuestionViewSet(viewsets.ModelViewSet):
    queryset = SurveyQuestion.objects.all()
    serializer_class = SurveyQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

class SurveyResponseViewSet(viewsets.ModelViewSet):
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

class SurveyAnswerViewSet(viewsets.ModelViewSet):
    queryset = SurveyAnswer.objects.all()
    serializer_class = SurveyAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer
    permission_classes = [permissions.IsAuthenticated]

class RouteAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RouteAssignment.objects.all()
    serializer_class = RouteAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
