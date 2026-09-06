from django.urls import path

from .views import (
    BillListCreateView, BillDetailView,
    BillItemListCreateView, BillItemDetailView,
    PaymentListCreateView, SalesAnalyticsView,
)

urlpatterns = [
    path("bills/", BillListCreateView.as_view(), name="bill_list_create"),
    path("bills/<int:pk>/", BillDetailView.as_view(), name="bill_detail"),
    path("bill-items/", BillItemListCreateView.as_view(), name="bill_item_list_create"),
    path("bill-items/<int:pk>/", BillItemDetailView.as_view(), name="bill_item_detail"),
    path("payments/", PaymentListCreateView.as_view(), name="payment_list_create"),
    path("analytics/sales/", SalesAnalyticsView.as_view(), name="sales_analytics"),
]