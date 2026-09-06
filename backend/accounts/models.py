from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Administrator"
        OWNER = "OWNER", "Restaurant Owner/Manager"
        PROCUREMENT_STAFF = "PROCUREMENT_STAFF", "Procurement/Inventory Staff"
        CASHIER = "CASHIER", "Cashier"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CASHIER,
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active_employee = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"