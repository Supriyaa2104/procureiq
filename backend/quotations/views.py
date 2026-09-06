from rest_framework import generics
from accounts.permissions import IsProcurementOrAdmin
from .models import Quotation
from .serializers import QuotationSerializer


class QuotationListCreateView(generics.ListCreateAPIView):
    queryset = Quotation.objects.all().order_by("-requested_at")
    serializer_class = QuotationSerializer
    permission_classes = [IsProcurementOrAdmin]

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class QuotationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quotation.objects.all()
    serializer_class = QuotationSerializer
    permission_classes = [IsProcurementOrAdmin]