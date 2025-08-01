from django.contrib import admin
from .models import Department, Employee

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'supervisor')
    search_fields = ('name',)
    list_filter = ('name',)
    autocomplete_fields = ['supervisor']

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'position', 'department', 'department.supervisor', 'hire_date', 'salary', 'is_active')
    list_display = ('user', 'position', 'department', 'get_supervisor', 'hire_date', 'salary', 'is_active')
    list_filter = ('department', 'is_active')
    search_fields = ('user__username', 'position')
    autocomplete_fields = ['user', 'department']

    def get_supervisor(self, obj):
        return obj.department.supervisor if obj.department else None
    get_supervisor.short_description = 'Supervisor (HOD)'
