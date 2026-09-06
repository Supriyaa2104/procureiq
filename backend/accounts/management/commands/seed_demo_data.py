import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from suppliers.models import Supplier
from quotations.models import Quotation
from purchase_orders.models import PurchaseOrder
from inventory.models import InventoryItem, StockMovement
from sales.models import Bill, BillItem, Payment


class Command(BaseCommand):
    help = "Seeds the database with realistic demo data for a restaurant procurement system."

    def handle(self, *args, **options):
        admin = User.objects.filter(role="ADMIN").first()
        if not admin:
            self.stdout.write(self.style.ERROR("No ADMIN user found. Create one first with createsuperuser."))
            return

        self.stdout.write("Seeding suppliers...")
        suppliers_data = [
            ("Kathmandu Fresh Veggies", "Vegetables", "9801112233"),
            ("Himalayan Meat Supply", "Meat", "9802223344"),
            ("Valley Dairy Co.", "Dairy", "9803334455"),
            ("Everest Beverages Pvt. Ltd.", "Beverages", "9804445566"),
            ("Reliable Packaging Nepal", "Packaging", "9805556677"),
        ]
        suppliers = []
        for name, category, phone in suppliers_data:
            s, _ = Supplier.objects.get_or_create(
                name=name, defaults={"category": category, "phone_number": phone}
            )
            suppliers.append(s)

        self.stdout.write("Seeding inventory items...")
        items_data = [
            ("Tomatoes", "kg", 15), ("Onions", "kg", 20), ("Chicken", "kg", 10),
            ("Milk", "litre", 25), ("Cooking Oil", "litre", 8), ("Rice", "kg", 30),
        ]
        items = []
        for name, unit, threshold in items_data:
            i, _ = InventoryItem.objects.get_or_create(
                name=name, defaults={"unit": unit, "low_stock_threshold": threshold}
            )
            items.append(i)

        self.stdout.write("Seeding purchase orders (with delivery history)...")
        statuses_weighted = ["DELIVERED"] * 6 + ["PENDING"] * 2 + ["DELAYED"] * 1 + ["CANCELLED"] * 1
        for supplier in suppliers:
            for _ in range(random.randint(4, 8)):
                item = random.choice(items)
                qty = random.randint(10, 100)
                price = round(random.uniform(30, 250), 2)
                status = random.choice(statuses_weighted)
                days_ago = random.randint(1, 90)
                created = timezone.now() - timedelta(days=days_ago)
                expected = created.date() + timedelta(days=random.randint(2, 7))

                po = PurchaseOrder.objects.create(
                    supplier=supplier,
                    item_name=item.name,
                    quantity=qty,
                    unit_price=price,
                    status=status,
                    expected_delivery_date=expected,
                    created_by=admin,
                )
                po.created_at = created
                if status == "DELIVERED":
                    if random.random() < 0.7:
                        po.actual_delivery_date = expected - timedelta(days=random.randint(0, 1))
                    else:
                        po.actual_delivery_date = expected + timedelta(days=random.randint(1, 4))
                    StockMovement.objects.create(
                        item=item, movement_type="IN", quantity=qty,
                        reason=f"PO #{po.id} delivered", recorded_by=admin,
                    )
                po.save()

        self.stdout.write("Seeding bills and payments...")
        for _ in range(20):
            days_ago = random.randint(0, 60)
            bill = Bill.objects.create(
                customer_name=random.choice(["Walk-in", "Table 4", "Table 7", "Online Order", ""]),
                created_by=admin,
            )
            bill.created_at = timezone.now() - timedelta(days=days_ago)
            bill.save()

            for _ in range(random.randint(1, 4)):
                item = random.choice(items)
                if item.current_stock and float(item.current_stock) > 2:
                    qty = min(round(random.uniform(0.5, 3), 2), float(item.current_stock))
                    price = round(random.uniform(30, 250), 2)
                    BillItem.objects.create(bill=bill, item=item, quantity=qty, unit_price=price)

            bill.refresh_from_db()
            if bill.total_amount > 0 and random.random() < 0.8:
                pay_amount = bill.total_amount if random.random() < 0.7 else round(float(bill.total_amount) * random.uniform(0.3, 0.9), 2)
                Payment.objects.create(
                    bill=bill, amount=pay_amount,
                    method=random.choice(["CASH", "CARD", "ESEWA", "BANK_TRANSFER"]),
                    recorded_by=admin,
                )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully!"))