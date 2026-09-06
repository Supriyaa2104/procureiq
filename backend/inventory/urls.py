from django.urls import path
from .views import (
    InventoryItemListCreateView, InventoryItemDetailView,
    StockMovementListCreateView, LowStockListView, InventoryAnalyticsView,
)

urlpatterns = [
    path("inventory-items/", InventoryItemListCreateView.as_view(), name="item_list_create"),
    path("inventory-items/<int:pk>/", InventoryItemDetailView.as_view(), name="item_detail"),
    path("inventory-items/low-stock/", LowStockListView.as_view(), name="low_stock"),
    path("stock-movements/", StockMovementListCreateView.as_view(), name="movement_list_create"),
    path("analytics/inventory/", InventoryAnalyticsView.as_view(), name="inventory_analytics"),
]