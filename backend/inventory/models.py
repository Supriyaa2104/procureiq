from django.db import models
from django.conf import settings


class InventoryItem(models.Model):
    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(max_length=50, help_text="e.g. kg, litre, piece, packet")
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    low_stock_threshold = models.DecimalField(
        max_digits=10, decimal_places=2, default=10,
        help_text="Alert when stock falls at or below this level"
    )
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_low_stock(self):
        return self.current_stock <= self.low_stock_threshold

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        IN = "IN", "Stock In"
        OUT = "OUT", "Stock Out"

    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="movements")
    movement_type = models.CharField(max_length=10, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255, help_text="e.g. 'PO #12 delivered', 'Sale #45', 'Wastage'")
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            if self.movement_type == self.MovementType.IN:
                self.item.current_stock += self.quantity
            else:
                self.item.current_stock -= self.quantity
            self.item.save()

    def __str__(self):
        return f"{self.movement_type} {self.quantity} - {self.item.name}"