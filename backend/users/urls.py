from django.urls import path
from .views import (
    RegisterView, UserDetailView, UserListView, UserRetrieveUpdateView,
    get_roles, get_permissions, update_user_role, get_user_stats,
    SystemSettingsView, test_smtp_settings, create_user_with_email, delete_user,
    ProfileUpdateView, ForgotPasswordView, ResetPasswordView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserRetrieveUpdateView.as_view(), name='user-retrieve-update'),
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('me/profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('roles/', get_roles, name='get-roles'),
    path('permissions/', get_permissions, name='get-permissions'),
    path('<int:user_id>/role/', update_user_role, name='update-user-role'),
    path('stats/', get_user_stats, name='user-stats'),
    path('create/', create_user_with_email, name='create-user-with-email'),
    path('<int:user_id>/delete/', delete_user, name='delete-user'),
    
    # Password Reset endpoints
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    
    # System Settings endpoints
    path('system/settings/', SystemSettingsView.as_view(), name='system-settings'),
    path('system/smtp/test/', test_smtp_settings, name='test-smtp'),
]
