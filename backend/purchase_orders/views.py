from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Avg, Case, When, F, FloatField
from accounts.permissions import IsProcurementOrAdmin
from suppliers.models import Supplier
from .models import PurchaseOrder, SupplierPayment
from .serializers import PurchaseOrderSerializer, SupplierPaymentSerializer


class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseOrder.objects.all().order_by("-created_at")
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsProcurementOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [IsProcurementOrAdmin]


class SupplierPerformanceView(APIView):
    permission_classes = [IsProcurementOrAdmin]

    def get(self, request):
        results = []
        for supplier in Supplier.objects.all():
            pos = PurchaseOrder.objects.filter(supplier=supplier)
            total_orders = pos.count()

            if total_orders == 0:
                results.append({
                    "supplier_id": supplier.id,
                    "supplier_name": supplier.name,
                    "category": supplier.category,
                    "total_orders": 0,
                    "completion_rate": None,
                    "punctuality_rate": None,
                    "score": None,
                })
                continue

            delivered = pos.filter(status="DELIVERED").count()
            completion_rate = round((delivered / total_orders) * 100, 1)

            delivered_with_dates = pos.filter(
                status="DELIVERED",
                expected_delivery_date__isnull=False,
                actual_delivery_date__isnull=False,
            )
            on_time = sum(
                1 for po in delivered_with_dates
                if po.actual_delivery_date <= po.expected_delivery_date
            )
            punctuality_rate = (
                round((on_time / delivered_with_dates.count()) * 100, 1)
                if delivered_with_dates.count() > 0 else None
            )

            if punctuality_rate is not None:
                score = round((completion_rate * 0.6) + (punctuality_rate * 0.4), 1)
            else:
                score = completion_rate

            results.append({
                "supplier_id": supplier.id,
                "supplier_name": supplier.name,
                "category": supplier.category,
                "total_orders": total_orders,
                "completion_rate": completion_rate,
                "punctuality_rate": punctuality_rate,
                "score": score,
            })

        results.sort(key=lambda x: (x["score"] is None, -(x["score"] or 0)))
        return Response(results)


class SupplierPaymentListCreateView(generics.ListCreateAPIView):
    queryset = SupplierPayment.objects.all().order_by("-paid_at")
    serializer_class = SupplierPaymentSerializer
    permission_classes = [IsProcurementOrAdmin]

    def perform_create(self, serializer):
        serializer.save(paid_by=self.request.user)