from django.contrib import admin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "phone_number", "is_active", "created_at"]
    list_filter = ["category", "is_active"]
    search_fields = ["name", "phone_number", "email"]