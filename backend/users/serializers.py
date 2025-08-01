from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import SystemSettings

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=User._meta.get_field('department').related_model.objects.all(), allow_null=True, required=False)
    department_name = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'phone', 'first_name', 'last_name', 
            'department', 'department_name', 'is_superuser', 'accessible_modules', 
            'is_module_restricted', 'assigned_warehouse', 'profile_picture', 
            'profile_picture_url', 'bio', 'date_of_birth', 'address', 
            'emergency_contact_name', 'emergency_contact_phone', 'hire_date', 'employee_id'
        ]
        read_only_fields = ['id', 'role', 'department_name', 'is_superuser', 'profile_picture_url']

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
    
    def get_profile_picture_url(self, obj):
        if obj.profile_picture:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None

class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile information"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'bio', 
            'date_of_birth', 'address', 'emergency_contact_name', 
            'emergency_contact_phone', 'profile_picture'
        ]
    
    def update(self, instance, validated_data):
        print(f"ProfileUpdateSerializer.update called with data: {validated_data.keys()}")
        
        # Handle profile picture upload
        if 'profile_picture' in validated_data:
            profile_picture = validated_data['profile_picture']
            print(f"Profile picture received: {profile_picture}, type: {type(profile_picture)}")
            
            # Delete old profile picture if exists
            if instance.profile_picture:
                print(f"Deleting old profile picture: {instance.profile_picture}")
                instance.profile_picture.delete(save=False)
        
        # Update the instance
        updated_instance = super().update(instance, validated_data)
        print(f"Profile updated. New profile_picture: {updated_instance.profile_picture}")
        
        return updated_instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'phone', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            phone=validated_data.get('phone', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for system settings including SMTP configuration"""
    
    class Meta:
        model = SystemSettings
        fields = [
            # General Settings
            'site_name', 'site_description', 'maintenance_mode', 'registration_enabled',
            'default_user_role', 'session_timeout', 'max_login_attempts', 'password_min_length',
            'require_password_complexity', 'enable_two_factor', 'backup_frequency', 'log_retention_days',
            
            # SMTP Settings
            'smtp_enabled', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password',
            'smtp_use_tls', 'smtp_use_ssl', 'smtp_from_email', 'smtp_from_name',
            
            # Notification Settings
            'email_notifications', 'sms_notifications', 'push_notifications',
            'user_registration_notifications', 'password_reset_notifications', 'system_alerts',
            'maintenance_notices', 'security_alerts', 'daily_reports', 'weekly_reports', 'monthly_reports',
            
            # Metadata
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        # Set the updated_by field to the current user if available
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['updated_by'] = request.user
        
        return super().update(instance, validated_data)
