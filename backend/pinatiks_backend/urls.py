from django.contrib import admin
from django.urls import path, include

from catalog.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/catalog/', include('catalog.urls')),
    path('health/', health_check, name='health')
]
