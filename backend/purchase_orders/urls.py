from django.urls import path
from .views import PurchaseOrderListCreateView, PurchaseOrderDetailView, SupplierPerformanceView

urlpatterns = [
    path("purchase-orders/", PurchaseOrderListCreateView.as_view(), name="po_list_create"),
    path("purchase-orders/<int:pk>/", PurchaseOrderDetailView.as_view(), name="po_detail"),
    path("suppliers/performance/", SupplierPerformanceView.as_view(), name="supplier_performance"),
]