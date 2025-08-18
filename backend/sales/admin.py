from django.contrib import admin
from .models import Customer, Sale, CustomerApproval, Quote, Lead, Promotion, PromotionProduct

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'customer_type', 'is_blacklisted']
    list_filter = ['customer_type', 'is_blacklisted']
    search_fields = ['name', 'email']

@admin.register(CustomerApproval)
class CustomerApprovalAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'requested_by', 'created_at']
    list_filter = ['status', 'customer_type']
    search_fields = ['name', 'email']

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ['customer', 'product', 'quantity', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['customer__name', 'product__name']

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'status', 'source', 'created_at']
    list_filter = ['status', 'source']
    search_fields = ['name', 'email', 'company']

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['customer', 'staff', 'total', 'status', 'date']
    list_filter = ['status', 'payment_method', 'currency']
    search_fields = ['customer__name']

class PromotionProductInline(admin.TabularInline):
    model = PromotionProduct
    extra = 1

@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['name', 'discount_type', 'discount_value', 'status', 'start_date', 'end_date', 'is_active']
    list_filter = ['status', 'discount_type', 'apply_to_all']
    search_fields = ['name', 'description']
    filter_horizontal = ['applicable_products']
    inlines = [PromotionProductInline]
    
    def is_active(self, obj):
        return obj.is_active()
    is_active.boolean = True
    is_active.short_description = 'Currently Active'

@admin.register(PromotionProduct)
class PromotionProductAdmin(admin.ModelAdmin):
    list_display = ['promotion', 'product', 'original_price', 'discounted_price', 'discount_amount']
    list_filter = ['promotion__status']
    search_fields = ['promotion__name', 'product__name']
