from django.db import models
from suppliers.models import Supplier
from django.conf import settings


class Quotation(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RECEIVED = "RECEIVED", "Received"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    PRICE_JUMP_THRESHOLD = 20  # percent

    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name="quotations")
    item_name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    @property
    def price_change_info(self):
        """Compare this quotation's price to the same supplier's last quote for the same item."""
        previous = Quotation.objects.filter(
            supplier=self.supplier,
            item_name=self.item_name,
            unit_price__isnull=False,
        ).exclude(pk=self.pk).order_by("-requested_at").first()

        if not previous or not previous.unit_price or not self.unit_price:
            return None

        old_price = float(previous.unit_price)
        new_price = float(self.unit_price)
        if old_price == 0:
            return None

        percent_change = round(((new_price - old_price) / old_price) * 100, 1)

        return {
            "previous_price": old_price,
            "current_price": new_price,
            "percent_change": percent_change,
            "is_spike": percent_change >= self.PRICE_JUMP_THRESHOLD,
        }

    def __str__(self):
        return f"{self.item_name} - {self.supplier.name} ({self.status})"