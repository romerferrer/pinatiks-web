from django.db import models

class Category(models.Model):
    name = models.TextField(null=False)

class Offering(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)                   # shareable link
    description = models.TextField(blank=True)
    category = models.ForeignKey(to=Category, on_delete=models.PROTECT, related_name="offerings")
    requires_booking = models.BooleanField(default=False)   # does it need a date?
    is_available = models.BooleanField(default=True)       # is she taking it now?
    items = models.ManyToManyField("self", symmetrical=False, blank=True)  # bundle contents

class OfferingPhoto(models.Model):
    offering = models.ForeignKey(Offering, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="offerings/")
    