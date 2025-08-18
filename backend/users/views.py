from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.urls import reverse
from .models import SystemSettings
from .serializers import UserSerializer, RegisterSerializer, SystemSettingsSerializer, ProfileUpdateSerializer
from utils.email_service import email_service
import secrets
import string

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

from rest_framework.response import Response
from rest_framework.views import APIView

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

class ProfileUpdateView(APIView):
    """Update user profile including profile picture"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        print(f"ProfileUpdateView.patch called with data: {request.data}")
        print(f"Files in request: {request.FILES}")
        
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            print(f"Serializer is valid. Validated data: {serializer.validated_data}")
            serializer.save()
            # Return updated user data
            user_serializer = UserSerializer(request.user, context={'request': request})
            return Response({
                'message': 'Profile updated successfully',
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        else:
            print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        """Full profile update"""
        serializer = ProfileUpdateSerializer(request.user, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            # Return updated user data
            user_serializer = UserSerializer(request.user, context={'request': request})
            return Response({
                'message': 'Profile updated successfully',
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class CustomTokenObtainPairView(TokenObtainPairView):
    # You can customize token claims here if needed
    pass

from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_roles(request):
    """Get all available user roles"""
    roles = [{'value': role[0], 'label': role[1]} for role in User.ROLES]
    return Response({
        'roles': roles,
        'current_user_role': request.user.role
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_permissions(request):
    """Get all available permissions"""
    permissions_list = Permission.objects.all().values('id', 'name', 'codename', 'content_type__app_label')
    return Response({
        'permissions': list(permissions_list)
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_user_role(request, user_id):
    """Update user role (admin only)"""
    if request.user.role not in ['admin', 'superadmin']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        new_role = request.data.get('role')
        
        if new_role not in [role[0] for role in User.ROLES]:
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.role = new_role
        user.save()
        
        return Response({
            'message': f'User role updated to {new_role}',
            'user': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    """Get user statistics for dashboard"""
    if not request.user.is_superuser:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    inactive_users = total_users - active_users
    
    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'inactive_users': inactive_users,
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_user_with_email(request):
    """Create a new user with email notification and password generation"""
    if not (request.user.is_superuser or request.user.role in ['admin', 'superadmin']):
        return Response(
            {'error': 'Permission denied. Only administrators can create users.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['name', 'email', 'role']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'{field} is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'User with this email already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate password if requested
        password = None
        send_email = data.get('sendEmail', False)
        generate_password = data.get('generatePassword', False)
        
        if generate_password:
            password = email_service.generate_password()
        else:
            password = data.get('password')
            if not password:
                return Response(
                    {'error': 'Password is required when not auto-generating'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Parse and validate data
        name_parts = data.get('name', '').strip().split(' ', 1)
        first_name = name_parts[0] if name_parts else ''
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        email = data.get('email', '').strip()
        role = data.get('role', 'employee')
        department_id = data.get('department')
        assigned_warehouse_id = data.get('assignedWarehouse')
        access_level = data.get('accessLevel', 'basic')
        module_access = data.get('moduleAccess', [])
        generate_password = data.get('generatePassword', True)
        send_email = data.get('sendEmail', True)
        
        # Get department and warehouse objects if specified
        department = None
        department_name = 'N/A'
        if department_id:
            try:
                from hr.models import Department
                department = Department.objects.get(id=department_id)
                department_name = department.name
            except Department.DoesNotExist:
                pass
        
        assigned_warehouse = None
        if assigned_warehouse_id:
            try:
                from warehouse.models import Warehouse
                assigned_warehouse = Warehouse.objects.get(id=assigned_warehouse_id)
            except Warehouse.DoesNotExist:
                pass
        
        # Create user
        user_data = {
            'username': email,  # Use email as username
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
            'role': role,
            'password': make_password(password),
            'is_active': True,
        }
        
        if department:
            user_data['department'] = department
        
        user = User.objects.create(**user_data)
        
        # Set assigned warehouse if provided (for Sales Reps)
        if assigned_warehouse:
            user.assigned_warehouse = assigned_warehouse
            user.save()
        
        # Set module access permissions if provided
        if data.get('moduleAccess'):
            user.accessible_modules = data['moduleAccess']
            user.is_module_restricted = True
            user.save()
        
        # Send email notification if requested and password was generated
        email_sent = False
        if send_email and generate_password and password:
            try:
                email_sent = email_service.send_user_registration_email(
                    user=user,
                    password=password,
                    department_name=department_name
                )
            except Exception as e:
                # Log error but don't fail user creation
                print(f"Failed to send email: {str(e)}")
        
        # Prepare response
        response_data = {
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'email_sent': email_sent,
        }
        
        if generate_password and not send_email:
            # Include password in response if not emailed (for admin to share manually)
            response_data['generated_password'] = password
            response_data['note'] = 'Password generated but not emailed. Please share with user manually.'
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create user: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_user(request, user_id):
    """Delete a user (admin only)"""
    if not (request.user.is_superuser or request.user.role in ['admin', 'superadmin']):
        return Response(
            {'error': 'Permission denied. Only administrators can delete users.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Prevent self-deletion
    if request.user.id == user_id:
        return Response(
            {'error': 'You cannot delete your own account.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Prevent deletion of superadmin users by non-superadmin
        if user.role == 'superadmin' and not request.user.is_superuser:
            return Response(
                {'error': 'Only superadmin can delete superadmin users.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_name = f"{user.first_name} {user.last_name}".strip() or user.username
        
        # Handle foreign key constraints gracefully
        try:
            # Check for related records that would prevent deletion
            related_objects = []
            
            # Check procurement requests
            if hasattr(user, 'procurement_requests'):
                proc_count = user.procurement_requests.count()
                if proc_count > 0:
                    related_objects.append(f"{proc_count} procurement request(s)")
            
            # Check sales orders
            if hasattr(user, 'sales_orders'):
                sales_count = user.sales_orders.count()
                if sales_count > 0:
                    related_objects.append(f"{sales_count} sales order(s)")
            
            # Check warehouse transfers
            if hasattr(user, 'warehouse_transfers'):
                transfer_count = user.warehouse_transfers.count()
                if transfer_count > 0:
                    related_objects.append(f"{transfer_count} warehouse transfer(s)")
            
            # If there are related objects, provide options
            if related_objects:
                return Response({
                    'error': f'Cannot delete user "{user_name}" because they have related records: {", ".join(related_objects)}. Please reassign or delete these records first, or contact an administrator to force deletion.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Proceed with deletion if no blocking relationships
            user.delete()
            
            return Response({
                'message': f'User "{user_name}" deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as delete_error:
            # If deletion fails due to foreign key constraints, provide helpful error
            error_message = str(delete_error)
            if 'foreign key constraint' in error_message.lower() or 'relation' in error_message.lower():
                return Response({
                    'error': f'Cannot delete user "{user_name}" because they have related records in the system. Please reassign their records to another user first, or contact an administrator.'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                raise delete_error
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to delete user: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

class ForgotPasswordView(APIView):
    """Handle forgot password requests"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({'message': 'If an account with this email exists, password reset instructions have been sent.'}, status=status.HTTP_200_OK)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset URL (for production, use your domain)
        reset_url = f"https://erp.tarinnovation.com/reset-password/{uid}/{token}/"
        
        # Send email
        subject = 'ERP System - Password Reset Request'
        message = f"""
        Hello {user.first_name or user.username},
        
        You have requested a password reset for your ERP System account.
        
        Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 24 hours.
        
        If you didn't request this reset, please ignore this email.
        
        Best regards,
        ERP System Team
        """
        
        try:
            # Use the email service if available, otherwise use Django's send_mail
            if hasattr(email_service, 'send_email'):
                email_service.send_email(
                    to_email=email,
                    subject=subject,
                    message=message
                )
            else:
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            
            return Response({'message': 'Password reset instructions have been sent to your email.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to send reset email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordView(APIView):
    """Handle password reset with token"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([uid, token, new_password]):
            return Response({'error': 'UID, token, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'error': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired reset link'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.password = make_password(new_password)
        user.save()
        
        return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)

# System Settings Views
class SystemSettingsView(APIView):
    """Get and update system settings including SMTP configuration"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get current system settings"""
        if not (request.user.is_superuser or request.user.role == 'superadmin'):
            return Response(
                {'error': 'Permission denied. Only superusers can access system settings.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data)
    
    def put(self, request):
        """Update system settings"""
        if not (request.user.is_superuser or request.user.role == 'superadmin'):
            return Response(
                {'error': 'Permission denied. Only superusers can update system settings.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(
            settings, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'System settings updated successfully',
                'data': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def test_smtp_settings(request):
    """Test SMTP configuration by sending a test email"""
    if not (request.user.is_superuser or request.user.role == 'superadmin'):
        return Response(
            {'error': 'Permission denied. Only superusers can test SMTP settings.'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    test_email = request.data.get('test_email')
    if not test_email:
        return Response(
            {'error': 'Test email address is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get current SMTP settings
        settings = SystemSettings.get_settings()
        
        if not settings.smtp_enabled:
            return Response(
                {'error': 'SMTP is not enabled in system settings'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Configure Django email settings temporarily
        from django.core.mail import EmailMessage
        from django.core.mail.backends.smtp import EmailBackend
        
        # Create custom email backend with current settings
        backend = EmailBackend(
            host=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_username,
            password=settings.smtp_password,
            use_tls=settings.smtp_use_tls,
            use_ssl=settings.smtp_use_ssl,
        )
        
        # Send test email
        email = EmailMessage(
            subject='ERP System - SMTP Test Email',
            body=f'This is a test email sent from the ERP System to verify SMTP configuration.\n\nSent at: {timezone.now()}\nSent by: {request.user.username}',
            from_email=settings.smtp_from_email or settings.smtp_username,
            to=[test_email],
            connection=backend
        )
        
        email.send()
        
        return Response({
            'message': f'Test email sent successfully to {test_email}',
            'status': 'success'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to send test email: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
