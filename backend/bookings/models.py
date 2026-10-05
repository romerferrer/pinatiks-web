from django.db import models

class CalendarEntry(models.Model):
    class Slot(models.TextChoices):
        MORNING = "morning", "Mañana"
        EVENING = "evening", "Tarde/Noche"

    date = models.DateField(null=False, blank=False)
    slot = models.CharField(max_length=10, choices=Slot.choices)
    
    class Meta:
        constraints = [models.UniqueConstraint(
            fields=["date", "slot"], name="one_entry_per_slot")]

    @property
    def kind(self):
        if hasattr(self, "booking"):
            return "booking"
        if hasattr(self, "block"):
            return "blocked"
        return None

class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmada"

    calendar_entry = models.OneToOneField(CalendarEntry, on_delete=models.CASCADE, related_name="booking")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    customer_name = models.CharField(max_length=120)
    offering = models.ForeignKey("catalog.Offering", null=True, blank=True, on_delete=models.SET_NULL)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Unavailability(models.Model):
    calendar_entry = models.OneToOneField(CalendarEntry, on_delete=models.CASCADE, related_name="booking")

    
