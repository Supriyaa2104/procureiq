from django.contrib import admin
from .models import Bill, BillItem, Payment


class BillItemInline(admin.TabularInline):
    model = BillItem
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ["paid_at"]


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ["id", "customer_name", "total_amount", "status", "created_by", "created_at"]
    list_filter = ["status"]
    inlines = [BillItemInline, PaymentInline]


@admin.register(BillItem)
class BillItemAdmin(admin.ModelAdmin):
    list_display = ["bill", "item", "quantity", "unit_price", "subtotal"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["bill", "amount", "method", "recorded_by", "paid_at"]