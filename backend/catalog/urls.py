from django.urls import path
from .views import categories, tags, offering, offerings

urlpatterns = [
    path('categories/', categories, name='categories'),
    path('tags/', tags, name='tags'),
    path('offerings/', offerings, name='offerings'),
    path('offering/<slug:slug>/', offering, name='offering')
]