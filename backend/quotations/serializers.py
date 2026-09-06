from rest_framework import serializers
from .models import Quotation


class QuotationSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    requested_by_username = serializers.CharField(source="requested_by.username", read_only=True)

    class Meta:
        model = Quotation
        fields = [
            "id",
            "supplier",
            "supplier_name",
            "item_name",
            "quantity",
            "unit_price",
            "status",
            "requested_by",
            "requested_by_username",
            "notes",
            "requested_at",
            "responded_at",
        ]
        read_only_fields = ["id", "requested_by", "requested_at"]