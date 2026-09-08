from rest_framework import serializers
from .models import PurchaseOrder
from .models import PurchaseOrder, SupplierPayment

class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id", "supplier", "supplier_name", "quotation", "item_name",
            "quantity", "unit_price", "total_amount", "status",
            "expected_delivery_date", "actual_delivery_date",
            "created_by", "created_by_username", "created_at", "updated_at",
            "amount_paid", "balance_due",
        ]
        read_only_fields = ["id", "total_amount", "created_by", "created_at", "updated_at"]

class SupplierPaymentSerializer(serializers.ModelSerializer):
    paid_by_username = serializers.CharField(source="paid_by.username", read_only=True)

    class Meta:
        model = SupplierPayment
        fields = ["id", "purchase_order", "amount", "method", "paid_by", "paid_by_username", "paid_at"]
        read_only_fields = ["id", "paid_by", "paid_at"]