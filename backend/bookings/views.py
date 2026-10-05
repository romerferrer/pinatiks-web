from django.http import JsonResponse, HttpRequest
from .models import CalendarEntry

def calendar_entries(request: HttpRequest, start, end):
    if request.method == 'GET':
        claims = (CalendarEntry.objects
          .filter(date__range=(start, end))
          .select_related("booking", "block"))
        slots = {(c.date, c.slot): c for c in claims}

        return JsonResponse({'status': 'success', 'data': slots})