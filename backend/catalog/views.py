import json

from django.http import JsonResponse
from django.db import Error, transaction, IntegrityError

from .models import Offering, OfferingImage, Category

def lacks_mandatory_fields(object: dict, fields: list[str]) -> str | None:
    for field in fields:
        if field not in object:
            return field
    return None


def offering_to_dict(o: Offering):
    return {
            "id": o.pk, "name": o.name, "slug": o.slug, "description": o.description,
            "category": o.category.name if o.category else None, "requires_booking": o.requires_booking, "is_available": o.is_available,
            "photos": [{"id": p.pk, "url": p.image.url, "alt_text": p.alt_text, "position": p.position} for p in o.photos.all()] #type: ignore
        }

def validate_and_create_offering(data: dict, append_text: str) -> Offering:
    #Verify the existence of all mandatory fields
    missing_field = lacks_mandatory_fields(data, ['name', 'slug', 'category'])
    if missing_field:
        raise Error(f'Missing field {append_text}: {missing_field}')
                    
    category = Category.objects.filter(pk=data['category']).first()
    if not category:
        raise Error(f'Unexistent category')

    #Create Offering
    args = {'name':data['name'], 'slug':data['slug'], 'category':category}
    for field in ["description", "is_available", "requires_booking"]:
        if field in data:
            args[field] = data[field]
    return Offering.objects.create(**args)



#--------- VIEWS ---------
#For individual offering page.
def get_offering_from_slug(request, slug: str):
    if request.method == "GET":
        query = Offering.objects.filter(slug=slug).first()
        if not query:
            return JsonResponse({'status': 'error', 'message': 'No offering found'}, status=404)
        #Status OK
        return JsonResponse({'status': 'success', 'data': query}, status=200)
    else:
        return JsonResponse({'status': 'error', 'message': 'Request method not allowed for this endpoint'}, status=405)

def offerings(request): 
    match request.method:
        #Arguments: page, category (optional), tags (optional)
        case "GET":
            #Get all offerings
            query = [offering_to_dict(offering) for offering in Offering.objects.select_related("category")]
            #Status OK
            return JsonResponse({'status': 'success', 'data': query}, status=200)
        case "POST":
            response_message: str = 'An unexpected error has occured'
            try:
                with transaction.atomic():
                    #Read HTTP request body
                    body: dict = json.loads(request.body)
                    
                    offering: Offering = validate_and_create_offering(body, "in offering")
                    
                    if 'tags' in body:
                        for tag in body['tags']:
                            if not isinstance(tag, str):
                                raise Error(f'One or more tags are not in the correct format')
                            
                    #Add Photos
                    if 'photos' in body:
                        for photo in body['photos']:
                            if not isinstance(photo,dict):
                                raise Error(f'One or more photos are not in the correct format')
                            
                            #Verificación de existencia de todos los campos requeridos
                            missing_field = lacks_mandatory_fields(photo, ['url', 'position'])
                            if missing_field:
                                raise Error(f'Missing field in photo: {missing_field}')
                            
                            OfferingImage.objects.create(offering=offering, image=photo["url"], position=photo["position"], alt_text=photo.get("alt_text",""))

                    if 'items' in body:
                        for item in body['items']:
                            if isinstance(item, str):
                                item_query = Offering.objects.filter(slug=item).first()
                                if not item_query:
                                    raise Error(f'One or more items do not exist')
                                offering.items.add(item_query)
                            elif isinstance(item, dict):
                                child_offering = validate_and_create_offering(item, "in item")
                                offering.items.add(child_offering)
                            else:
                                response_message = f'One or more items are not in the correct format (slug or full declaration)'
                                raise Error

                    #Status Created
                    return JsonResponse({'status': 'success', 'message': 'Offering sucessfully created', 'data': offering_to_dict(offering)}, status=201)

            #Excepciones de formato del json y datos
            except json.JSONDecodeError:
                return JsonResponse({'status': 'error', 'message': 'Provided body is not valid JSON'}, status=400)
            except IntegrityError:
                return JsonResponse({'status': 'error', 'message': 'Data in one or more fields is not valid'}, status=400)
            except Error as e:
                return JsonResponse({'status': 'error', 'message': e.args[0]}, status=400)

        case _:
            return JsonResponse({'status': 'error', 'message': 'Request method not allowed for this endpoint'}, status=405)

def offering(request, id: int):
    if not id:
        return JsonResponse({'status': 'error', 'message': 'No offering id was provided'}, status=400)
    
    offering = Offering.objects.filter(pk=id).select_related("category").first()
    if not offering:
        return JsonResponse({'status': 'error', 'message': f'Offering {id} no found.'}, status=404)

    match request.method:
        case "PATCH":
            try:
                #Read HTTP request body
                body: dict = json.loads(request.body)

                if 'category' in body:
                    category = Category.objects.filter(pk=body['category']).first()
                    if not category:
                        return JsonResponse({'status': 'error', 'message': f'Unexistent category'}, status=400)

                #Modify included fields
                offering.pk = body.get('id', offering.pk)
                offering.name = body.get('name', offering.name)
                offering.slug = body.get('slug', offering.slug)
                offering.category = body.get('category', offering.category)
                offering.description = body.get('description', offering.description)
                offering.is_available = body.get('is_available', offering.is_available)
                offering.requires_booking = body.get('requires_booking', offering.requires_booking)

                if "photos" in body:
                    for photo_dict in body['photos']:
                            if not isinstance(photo_dict,dict):
                                return JsonResponse({'status': 'error', 'message': f'UOne or more photos are not in the correct format'}, status=400)
                            
                            if lacks_mandatory_fields(photo_dict, ["id"]):
                                continue
                            
                            photo = OfferingImage.objects.filter(pk=photo_dict["id"]).first()
                            if not photo:
                                continue

                            photo.image = photo_dict.get('url', photo.image)
                            photo.position = photo_dict.get('position', photo.position)
                            photo.alt_text = photo_dict.get('alt_text', photo.alt_text)
                            photo.save()

                offering.save()

                #Status OK
                return JsonResponse({'status': 'success', 'message': 'Offerings updated.', 'data': offering_to_dict(offering)}, status=200)

            #Excepciones de formato del json y datos
            except json.JSONDecodeError:
                return JsonResponse({'status': 'error', 'message': 'Provided body is not valid JSON'}, status=400)
            except IntegrityError:
                return JsonResponse({'status': 'error', 'message': 'Data in one or more fields is not valid'}, status=400)
        case "DELETE":
            offering.delete()
            #Status OK
            return JsonResponse({'status': 'success', 'message': f'Offering {id} and photos deleted.'}, status=200)
        case _:
            return JsonResponse({'status': 'error', 'message': 'Request method not allowed for this endpoint'}, status=405)

def promotions(request):
    match request.method:
        case "GET":
            pass
        case "POST":
            pass
        case _:
            return JsonResponse({'status': 'error', 'message': 'Request method not allowed for this endpoint'}, status=405)

def promotion(request, id: int):
    match request.method:
        case "PATCH":
            pass
        case "DELETE":
            pass
        case _:
            return JsonResponse({'status': 'error', 'message': 'Request method not allowed for this endpoint'}, status=405)

# To do:
# Implementar tags