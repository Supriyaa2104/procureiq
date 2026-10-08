from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from suppliers.models import Supplier
from purchase_orders.models import PurchaseOrder
from inventory.models import InventoryItem

RESULT_LIMIT = 5


class GlobalSearchView(APIView):
    """
    Powers the top-bar search box. Given ?q=<text>, looks across
    Suppliers, Purchase Orders, and Inventory Items and returns a
    handful of matches from each so the frontend can group them.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({"suppliers": [], "purchase_orders": [], "inventory_items": []})

        suppliers = Supplier.objects.filter(
            Q(name__icontains=query)
            | Q(contact_person__icontains=query)
            | Q(category__icontains=query)
        )[:RESULT_LIMIT]

        purchase_orders = PurchaseOrder.objects.select_related("supplier").filter(
            Q(item_name__icontains=query) | Q(supplier__name__icontains=query)
        )[:RESULT_LIMIT]

        inventory_items = InventoryItem.objects.filter(name__icontains=query)[:RESULT_LIMIT]

        return Response({
            "suppliers": [
                {"id": s.id, "name": s.name, "category": s.category}
                for s in suppliers
            ],
            "purchase_orders": [
                {
                    "id": po.id,
                    "item_name": po.item_name,
                    "supplier_name": po.supplier.name,
                    "status": po.status,
                }
                for po in purchase_orders
            ],
            "inventory_items": [
                {
                    "id": item.id,
                    "name": item.name,
                    "current_stock": float(item.current_stock),
                    "unit": item.unit,
                }
                for item in inventory_items
            ],
        })