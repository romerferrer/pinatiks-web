import json

from django.http import JsonResponse
from django.db import Error, transaction, IntegrityError
from django.views.decorators.csrf import csrf_exempt

from django.core.paginator import EmptyPage, Paginator

from .models import Offering, OfferingImage, Category, Tag

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
                    
    category = Category.objects.filter(name=data['category']).first()
    if not category:
        raise Error(f'Unexistent category')

    #Create Offering
    args = {'name':data['name'], 'slug':data['slug'], 'category':category}
    for field in ["description", "is_available", "requires_booking"]:
        if field in data:
            args[field] = data[field]
    with transaction.atomic():
        offering = Offering.objects.create(**args)

        if 'tags' in data:
            for tag in data['tags']:
                if not isinstance(tag, str):
                    raise Error(f'One or more tags are not in the correct format')

                tag_query = Tag.objects.filter(name=tag).first()
                if not tag_query:
                    raise Error(f'One or more tags do not exist')
                
                offering.tags.add(tag_query)
                                
        #Add Photos
        if 'photos' in data:
            for photo in data['photos']:
                if not isinstance(photo,dict):
                    raise Error(f'One or more photos are not in the correct format')
                                
                #Verificación de existencia de todos los campos requeridos
                missing_field = lacks_mandatory_fields(photo, ['url', 'position'])
                if missing_field:
                    raise Error(f'Missing field in photo: {missing_field}')
                                
                OfferingImage.objects.create(offering=offering, image=photo["url"], position=photo["position"], alt_text=photo.get("alt_text",""))
    return offering

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

@csrf_exempt
def offerings(request): 
    match request.method:
        #Arguments: page, category (optional), tags (optional)
        case "GET":
            query = Offering.objects.filter(is_available=True).select_related("category")

            category =  request.GET.get("category")
            if category:
                query = query.filter(category__name=category)
            
            tags = set(request.GET.getlist("tag"))

            if tags:
                query = query.filter(tags__name__in=tags).distinct()

            q = request.GET.get("q")
            if q:
                query = query.filter(name__icontains=q)
            
            try:
                page_number = int(request.GET.get("page", 1))
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'page number has to be an integer'}, status=400)

            paginator = Paginator(query,12)
            try:
                page = paginator.page(page_number)
            except EmptyPage:
                return JsonResponse({'status': 'error', 'message': 'page out of range'}, status=404)
            
            response = {
                "count": paginator.count,
                "num_pages": paginator.num_pages,
                "page": page.number,
                "has_next": page.has_next,
                "has_previous": page.has_previous,
                "results": [offering_to_dict(o) for o in page.object_list]
            }

            #Status OK
            return JsonResponse({'status': 'success', 'data': response}, status=200)
        case "POST":
            try:
                with transaction.atomic():
                    #Read HTTP request body
                    body: dict = json.loads(request.body)
                    
                    offering: Offering = validate_and_create_offering(body, "in offering")

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
                                raise Error(f'One or more items are not in the correct format (slug or full declaration)')

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

def offering(request, slug: str):
    if not slug:
        return JsonResponse({'status': 'error', 'message': 'No offering slug was provided'}, status=400)
    
    offering = Offering.objects.filter(slug=slug).select_related("category").first()

    if not offering:
        return JsonResponse({'status': 'error', 'message': f'Offering "{slug}" no found.'}, status=404)

    match request.method:
        case "PATCH":
            try:
                #Read HTTP request body
                """body format:
                    {name?,slug?,category?,description?,is_available?,requires_booking?,
                    photos?:{
                        operation?: add/move/delete
                        image: url
                        position: (int)
                        target_position: (int)
                        alt_text: (str)
                        }
                    }
                """
                body: dict = json.loads(request.body)

                if 'category' in body:
                    category = Category.objects.filter(name=body['category']).first()
                    if not category:
                        return JsonResponse({'status': 'error', 'message': f'Unexistent category'}, status=400)

                #Modify included fields
                offering.name = body.get('name', offering.name)
                offering.slug = body.get('slug', offering.slug)
                offering.category = body.get('category', offering.category)
                offering.description = body.get('description', offering.description)
                offering.is_available = body.get('is_available', offering.is_available)
                offering.requires_booking = body.get('requires_booking', offering.requires_booking)

                if "photos" in body:
                    for photo_dict in body['photos']:
                            if not isinstance(photo_dict, dict):
                                return JsonResponse({'status': 'error', 'message': f'One or more photos are not in the correct format'}, status=400)
                            
                            if lacks_mandatory_fields(photo_dict, ["position"]):
                                return JsonResponse({'status': 'error', 'message': f'"position" parameter not specified for one or more photos'}, status=400)
                            
                            photo = offering.photos.filter(position=photo_dict["position"]).first()
                            if not photo:
                                return JsonResponse({'status': 'error', 'message': f'One or more photos do not exist in the specified offering'}, status=400)
                            
                            photo.alt_text = photo_dict.get('alt_text', photo.alt_text)
                            photo.save()

                            match photo_dict['operation']:
                                case 'add':
                                    missing_field = lacks_mandatory_fields(photo_dict, ['url'])
                                    if missing_field:
                                        return JsonResponse({'status': 'error', 'message': f'"url" parameter not specified for one or more photos'}, status=400)

                                    offering.photos.create(position=photo_dict['position'],image=photo_dict['url'],alt_text=photo_dict.get("alt_text",""))

                                case 'move':
                                    if lacks_mandatory_fields(photo_dict, ["target_position"]):
                                        return JsonResponse({'status': 'error', 'message': f'No "target_position" set for one or more photos set to move'}, status=400)

                                    photo.position = photo_dict['target_position']

                                    photo_to_swap = offering.photos.filter(position=photo_dict["target_position"]).first()
                                    if photo_to_swap:
                                        photo_to_swap.position = photo_dict['position']
                                        photo_to_swap.save()
                                    photo.save()
                                
                                case 'delete':
                                    photo.delete()

                offering.save()

                #Status OK
                return JsonResponse({'status': 'success', 'message': 'Offerings updated.', 'data': offering_to_dict(offering)}, status=200)

            #Excepciones de formato del json y datos
            except json.JSONDecodeError:
                return JsonResponse({'status': 'error', 'message': 'Provided body is not valid JSON'}, status=400)
            except IntegrityError:
                return JsonResponse({'status': 'error', 'message': 'Data in one or more fields is not valid'}, status=400)
            except:
                return JsonResponse({'status': 'error', 'message': 'An unexpected error has occured'}, status=400)

        case "DELETE":
            offering.delete()
            #Status OK
            return JsonResponse({'status': 'success', 'message': f'Offering "{slug}" and photos deleted.'}, status=200)
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

#To-Do:
#Maybe validate_and_create_offering need a try-except statement for the transaction.atomic()
