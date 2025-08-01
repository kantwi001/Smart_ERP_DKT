from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Avg
from .models import Route, Waypoint, Delivery
from .serializers import RouteSerializer, WaypointSerializer, DeliverySerializer

class RouteListCreateView(generics.ListCreateAPIView):
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Route.objects.filter(created_by=self.request.user).order_by('-created_at')

class RouteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def route_stats(request):
    """Get route planning statistics for dashboard"""
    user_routes = Route.objects.filter(created_by=request.user)
    total_routes = user_routes.count()
    active_routes = user_routes.filter(status='active').count()
    completed_routes = user_routes.filter(status='completed').count()
    total_deliveries = Delivery.objects.filter(route__created_by=request.user).count()
    
    # Route status distribution
    status_stats = user_routes.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Recent routes
    recent_routes = user_routes.order_by('-created_at')[:5].values(
        'id', 'name', 'status', 'start_location', 'end_location', 'created_at'
    )
    
    return Response({
        'total_routes': total_routes,
        'active_routes': active_routes,
        'completed_routes': completed_routes,
        'planned_routes': user_routes.filter(status='planned').count(),
        'total_deliveries': total_deliveries,
        'status_distribution': list(status_stats),
        'recent_routes': list(recent_routes)
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_route(request):
    """Create a new route"""
    serializer = RouteSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        route = serializer.save()
        return Response({
            'message': 'Route created successfully',
            'route': RouteSerializer(route).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_waypoint(request):
    """Add a waypoint to a route"""
    serializer = WaypointSerializer(data=request.data)
    if serializer.is_valid():
        waypoint = serializer.save()
        return Response({
            'message': 'Waypoint added successfully',
            'waypoint': WaypointSerializer(waypoint).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
