from django.db import models
from django.utils import choices

class CalendarEntry(models.Model):
    class Slot(models.TextChoices):
        MORNING = "morning", "Mañana"
        EVENING = "evening", "Tarde/Noche"
    
    class Kind(models.TextChoices):
        BOOKING = "booking", "Reserva"
        BLOCKED = "blocked", "No Disponible"

    date = models.DateField(null=False,blank=False)
    slot = models.CharField(max_length=10, choices=Slot.choices)
    

    class Meta:
        abstract = True

class Booking(CalendarEntry):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmada"
        CANCELLED = "cancelled", "Cancelada"

    status = models.CharField(max_length=10, choices=Status.choices)
    customer_name = mode


    
