from rest_framework import serializers
from .models import InventoryItem, StockMovement


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id", "name", "unit", "current_stock",
            "low_stock_threshold", "is_low_stock", "updated_at",
        ]
        read_only_fields = ["id", "current_stock", "updated_at"]


class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    recorded_by_username = serializers.CharField(source="recorded_by.username", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id", "item", "item_name", "movement_type", "quantity",
            "reason", "recorded_by", "recorded_by_username", "created_at",
        ]
        read_only_fields = ["id", "recorded_by", "created_at"]