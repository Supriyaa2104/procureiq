from rest_framework import generics
from accounts.permissions import IsAuthenticatedReadOnly, IsProcurementOrAdmin
from .models import Supplier
from .serializers import SupplierSerializer


class SupplierListCreateView(generics.ListCreateAPIView):
    queryset = Supplier.objects.all().order_by("-created_at")
    serializer_class = SupplierSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsProcurementOrAdmin()]
        return [IsAuthenticatedReadOnly()]


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticatedReadOnly()]
        return [IsProcurementOrAdmin()]