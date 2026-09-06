from rest_framework import serializers
from .models import Bill, BillItem, Payment


class BillItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = BillItem
        fields = ["id", "bill", "item", "item_name", "quantity", "unit_price", "subtotal"]
        read_only_fields = ["id"]


class PaymentSerializer(serializers.ModelSerializer):
    recorded_by_username = serializers.CharField(source="recorded_by.username", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "bill", "amount", "method", "recorded_by", "recorded_by_username", "paid_at"]
        read_only_fields = ["id", "recorded_by", "paid_at"]


class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id", "customer_name", "total_amount", "status",
            "created_by", "created_by_username", "created_at",
            "items", "payments",
        ]
        read_only_fields = ["id", "total_amount", "created_by", "created_at"]