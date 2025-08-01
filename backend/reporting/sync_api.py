from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from sales.models import Sale
from procurement.models import ProcurementRequest
from inventory.models import InventoryTransfer
from reporting.models import Survey, SurveyResponse, Route, RouteAssignment
from users.models import User

class SyncDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Download all relevant records for offline use
        data = {
            'sales': list(Sale.objects.filter(staff=request.user).values()),
            'procurement_requests': list(ProcurementRequest.objects.filter(created_by=request.user).values()),
            'transfers': list(InventoryTransfer.objects.filter(requested_by=request.user).values()),
            'surveys': list(Survey.objects.all().values()),
            'survey_responses': list(SurveyResponse.objects.filter(user=request.user).values()),
            'routes': list(Route.objects.filter(created_by=request.user).values()),
            'route_assignments': list(RouteAssignment.objects.filter(user=request.user).values()),
        }
        return Response(data)

class SyncUploadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Accept uploaded records, save or update as needed, and log sync event
        # This is a stub; implement validation and conflict resolution as needed
        uploaded = request.data
        # TODO: process uploaded records
        # Log sync event
        user = request.user
        user.profile.last_sync = timezone.now()
        user.profile.save()
        return Response({'status': 'success', 'synced_at': user.profile.last_sync})
