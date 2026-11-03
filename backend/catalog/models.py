from django.db import models
from django.db.models import UniqueConstraint

class Category(models.Model):
    name = models.TextField(null=False)

    def __str__(self) -> str:
        return self.name

class Tag(models.Model):
    name = models.TextField(null=False)

    def __str__(self) -> str:
        return self.name

class Offering(models.Model):
    name = models.CharField(max_length=128)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(to=Category, on_delete=models.RESTRICT, related_name="offerings")
    tags = models.ManyToManyField(to=Tag, null=True)
    requires_booking = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    items = models.ManyToManyField(to="self", symmetrical=False, null=True, related_name="parent")  # bundle contents

    def __str__(self) -> str:
        return f"{self.name} ({self.is_available})"

class OfferingImage(models.Model):
    offering = models.ForeignKey(Offering, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="offerings/")
    alt_text = models.CharField(blank=True, max_length=64)
    position = models.IntegerField()

    class meta():
        constraints = [
            UniqueConstraint(
                fields=["offering", "position"],
                name="unique_position_per_offering"
            )
        ]

    def __str__(self) -> str:
        return f"{self.image.name}: {self.alt_text}"

class Promotion(models.Model):
    class Kind(models.TextChoices):
        DISCOUNT = "discount", "Descuento"
        RUSH     = "rush",     "Entrega rápida"
        OTHER    = "other",    "Otra"

    offerings = models.ManyToManyField(to=Offering, blank=False, related_name="promotions")
    title = models.CharField(blank=False, max_length=128)
    kind = models.CharField(max_length=10, choices=Kind.choices)
    description = models.TextField(max_length=256)
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    starts_at = models.DateField(null=True, blank=True)
    ends_at = models.DateField(null=True, blank=True)
    
    def __str__(self) -> str:
        return f"{self.title} ({self.kind}): {self.description[0:10]}"
