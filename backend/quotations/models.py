from django.db import models
from suppliers.models import Supplier
from django.conf import settings


class Quotation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RECEIVED = "RECEIVED", "Received"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="quotations")
    item_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.item_name} - {self.supplier.name} ({self.status})"