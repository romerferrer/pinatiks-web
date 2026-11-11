from django.contrib import admin
from .models import *

class OfferingImageInline(admin.TabularInline):
    model = OfferingImage
    extra = 1

@admin.register(Offering)
class OfferingAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_available", "requires_booking"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [OfferingImageInline]

admin.site.register(Category)
admin.site.register(Tag)