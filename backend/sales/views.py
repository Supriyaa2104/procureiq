from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncMonth
from accounts.permissions import IsCashierOrAdmin
from .models import Bill, BillItem, Payment
from .serializers import BillSerializer, BillItemSerializer, PaymentSerializer


class BillListCreateView(generics.ListCreateAPIView):
    queryset = Bill.objects.all().order_by("-created_at")
    serializer_class = BillSerializer
    permission_classes = [IsCashierOrAdmin]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class BillDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsCashierOrAdmin]


class BillItemListCreateView(generics.ListCreateAPIView):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [IsCashierOrAdmin]


class BillItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BillItem.objects.all()
    serializer_class = BillItemSerializer
    permission_classes = [IsCashierOrAdmin]


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.all().order_by("-paid_at")
    serializer_class = PaymentSerializer
    permission_classes = [IsCashierOrAdmin]

    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class SalesAnalyticsView(APIView):
    permission_classes = [IsCashierOrAdmin]

    def get(self, request):
        # Revenue by month
        revenue_by_month = (
            Bill.objects.exclude(status="CANCELLED")
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("total_amount"))
            .order_by("month")
        )

        # Best-selling items by quantity sold
        best_sellers = (
            BillItem.objects.values("item__name")
            .annotate(total_qty=Sum("quantity"), total_revenue=Sum(
                F("quantity") * F("unit_price")
            ))
            .order_by("-total_qty")[:10]
        )

        # Overall totals
        total_revenue = Bill.objects.exclude(status="CANCELLED").aggregate(
            total=Sum("total_amount")
        )["total"] or 0
        total_bills = Bill.objects.exclude(status="CANCELLED").count()
        unpaid_amount = Bill.objects.filter(status__in=["UNPAID", "PARTIAL"]).aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        return Response({
            "revenue_by_month": [
                {"month": r["month"].strftime("%b %Y"), "revenue": float(r["total"])}
                for r in revenue_by_month
            ],
            "best_sellers": [
                {
                    "item_name": b["item__name"],
                    "total_quantity": float(b["total_qty"]),
                    "total_revenue": float(b["total_revenue"]),
                }
                for b in best_sellers
            ],
            "total_revenue": float(total_revenue),
            "total_bills": total_bills,
            "unpaid_amount": float(unpaid_amount),
        })