from django.db import models

class CalendarEntry(models.Model):
    class Slot(models.TextChoices):
        MORNING = "morning", "Mañana"
        EVENING = "evening", "Tarde/Noche"
    
    class Kind(models.TextChoices):
        BOOKING = "booking", "Reserva"
        BLOCKED = "blocked", "No Disponible"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        CONFIRMED = "confirmed", "Confirmada"
        CANCELLED = "cancelled", "Cancelada"
    
