from rest_framework import generics
from accounts.permissions import IsAuthenticatedReadOnly, IsProcurementOrAdmin
from .models import Quotation
from .serializers import QuotationSerializer


class QuotationListCreateView(generics.ListCreateAPIView):
    queryset = Quotation.objects.all().order_by("-requested_at")
    serializer_class = QuotationSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProcurementOrAdmin()]
        return [IsAuthenticatedReadOnly()]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class QuotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedReadOnly()]
        return [IsProcurementOrAdmin()]