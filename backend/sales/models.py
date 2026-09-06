from django.db import models
from django.conf import settings
from inventory.models import InventoryItem


class Bill(models.Model):
    class Status(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    customer_name = models.CharField(max_length=255, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def recalculate_total(self):
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save()

    def __str__(self):
        return f"Bill #{self.id} - Rs.{self.total_amount}"


class BillItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name="bill_items")
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            # selling reduces inventory stock
            from inventory.models import StockMovement
            StockMovement.objects.create(
                item=self.item,
                movement_type=StockMovement.MovementType.OUT,
                quantity=self.quantity,
                reason=f"Sold via Bill #{self.bill_id}",
                recorded_by=self.bill.created_by,
            )
        self.bill.recalculate_total()

    def __str__(self):
        return f"{self.quantity} x {self.item.name}"


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "CASH", "Cash"
        CARD = "CARD", "Card"
        ESEWA = "ESEWA", "eSewa"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"

    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.CASH)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    paid_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        total_paid = sum(p.amount for p in self.bill.payments.all())
        if total_paid >= self.bill.total_amount:
            self.bill.status = Bill.Status.PAID
        elif total_paid > 0:
            self.bill.status = Bill.Status.PARTIAL
        self.bill.save()

    def __str__(self):
        return f"Rs.{self.amount} - {self.method}"