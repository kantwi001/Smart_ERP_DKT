from django.urls import path
from . import views

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('stats/', views.notification_stats, name='notification-stats'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    
    # Notification Channels (Admin)
    path('channels/', views.NotificationChannelListView.as_view(), name='notification-channels'),
    
    # Notification Templates (Admin)
    path('templates/', views.NotificationTemplateListView.as_view(), name='notification-templates'),
    
    # Transfer Approvals
    path('approvals/', views.TransferApprovalListView.as_view(), name='transfer-approvals'),
    path('approvals/<int:pk>/', views.TransferApprovalDetailView.as_view(), name='transfer-approval-detail'),
    path('approvals/pending/', views.pending_approvals, name='pending-approvals'),
    path('transfers/<int:transfer_id>/approve/', views.approve_transfer, name='approve-transfer'),
    path('transfers/<int:transfer_id>/details/', views.transfer_approval_details, name='transfer-approval-details'),
]
