from django.urls import path
from .views import offering, offerings

urlpatterns = [
    path('offerings/', offerings, name='offerings'),
    path('offering/<slug:slug>/', offering, name='offering')
]