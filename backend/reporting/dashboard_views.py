from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class StatsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Dummy stats data
        return Response({
            'sales_count': 0,
            'customer_count': 0,
            'product_count': 0,
            'revenue': 0,
        })

class ActivityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Dummy recent activity
        return Response([])
