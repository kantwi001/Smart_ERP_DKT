from django.urls import path
from .views import (
    RouteListCreateView, RouteDetailView, route_stats, create_route, add_waypoint
)

urlpatterns = [
    path('', RouteListCreateView.as_view(), name='route-list-create'),
    path('<int:pk>/', RouteDetailView.as_view(), name='route-detail'),
    path('stats/', route_stats, name='route-stats'),
    path('create/', create_route, name='create-route'),
    path('waypoints/add/', add_waypoint, name='add-waypoint'),
]
