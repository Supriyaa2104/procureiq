from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F
from accounts.permissions import IsProcurementOrAdmin
from .models import InventoryItem, StockMovement
from .serializers import InventoryItemSerializer, StockMovementSerializer


class InventoryItemListCreateView(generics.ListCreateAPIView):
    queryset = InventoryItem.objects.all().order_by("name")
    serializer_class = InventoryItemSerializer
    permission_classes = [IsProcurementOrAdmin]


class InventoryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsProcurementOrAdmin]


class StockMovementListCreateView(generics.ListCreateAPIView):
    queryset = StockMovement.objects.all().order_by("-created_at")
    serializer_class = StockMovementSerializer
    permission_classes = [IsProcurementOrAdmin]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class LowStockListView(generics.ListAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsProcurementOrAdmin]

    def get_queryset(self):
        return InventoryItem.objects.filter(current_stock__lte=F("low_stock_threshold"))


class InventoryAnalyticsView(APIView):
    permission_classes = [IsProcurementOrAdmin]

    def get(self, request):
        items = InventoryItem.objects.all()

        low_stock_count = sum(1 for i in items if i.is_low_stock)
        total_items = items.count()

        stock_in_total = StockMovement.objects.filter(movement_type="IN").aggregate(
            total=Sum("quantity")
        )["total"] or 0
        stock_out_total = StockMovement.objects.filter(movement_type="OUT").aggregate(
            total=Sum("quantity")
        )["total"] or 0

        stock_levels = [
            {
                "name": i.name,
                "current_stock": float(i.current_stock),
                "unit": i.unit,
                "is_low_stock": i.is_low_stock,
            }
            for i in items
        ]

        recent_movements = StockMovement.objects.select_related("item").order_by("-created_at")[:10]
        recent_movements_data = [
            {
                "item_name": m.item.name,
                "movement_type": m.movement_type,
                "quantity": float(m.quantity),
                "reason": m.reason,
                "created_at": m.created_at,
            }
            for m in recent_movements
        ]

        return Response({
            "total_items": total_items,
            "low_stock_count": low_stock_count,
            "total_stock_in": float(stock_in_total),
            "total_stock_out": float(stock_out_total),
            "stock_levels": stock_levels,
            "recent_movements": recent_movements_data,
        })