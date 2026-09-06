from django.urls import path
from .views import QuotationListCreateView, QuotationDetailView

urlpatterns = [
    path("quotations/", QuotationListCreateView.as_view(), name="quotation_list_create"),
    path("quotations/<int:pk>/", QuotationDetailView.as_view(), name="quotation_detail"),
]