from django.urls import path
from .views import (
    PurchaseOrderListCreateView, PurchaseOrderDetailView,
    SupplierPerformanceView, SupplierPaymentListCreateView,
    ApprovePurchaseOrderView,
)

urlpatterns = [
    path("purchase-orders/", PurchaseOrderListCreateView.as_view(), name="po_list_create"),
    path("purchase-orders/<int:pk>/", PurchaseOrderDetailView.as_view(), name="po_detail"),
    path("purchase-orders/<int:pk>/approve/", ApprovePurchaseOrderView.as_view(), name="po_approve"),
    path("suppliers/performance/", SupplierPerformanceView.as_view(), name="supplier_performance"),
    path("supplier-payments/", SupplierPaymentListCreateView.as_view(), name="supplier_payment_list_create"),
]