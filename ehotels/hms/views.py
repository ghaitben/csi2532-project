# views.py

from django.db import connection
from django.http import JsonResponse
import django.urls
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import *


auth_users = set()

@csrf_exempt
def register_client(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fullname = data.get('fullname')
        ssn = data.get('ssn')
        
        
        address_street = data.get('street')
        address_city = data.get("city")
        address_country = data.get("country")
        address_postal_code = data.get("postal_code")
        
       

        if fullname and ssn:
            with connection.cursor() as cursor:
                
                cursor.execute(
                    "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
                    [address_street, address_city, address_country, address_postal_code]
                )
                
                cursor.execute(
                    "INSERT INTO client (fullname, adress_id, ssn) VALUES (%s, %s, %s)",
                    [fullname, cursor.fetchone()[0], ssn]
                )
                return JsonResponse({"message": "Client registered successfully"}, status=201)
        else:
            return JsonResponse({"message": "Missing required fields"}, status=400)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


# TODO: login client
@csrf_exempt
def login_client(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fullname = data.get('fullname')
        ssn = data.get('ssn')
        
        
        user_id = authenticate(fullname, ssn)
        
        if user_id:
            login(user_id)  # Initiates a session for the authenticated user
            return JsonResponse({"message": "Client login successful",
                                 "user_id" : user_id
                                 }, status=200)
        # Redirect to a success page or return a response indicating successful login
        else:
            return JsonResponse({"message": "Client login failed"}, status=401)
            # Return a response indicating failed login
            
def search_rooms(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        if is_authenticated(data.user_id):
            
            
            
            pass
            
        else:
            return JsonResponse({"message": "Client login failed"}, status=401)
    
    


def authenticate(fullname, ssn):
    query = """
            SELECT c.id, c.fullname
            FROM client c
            WHERE c.fullname = %s AND c.ssn = %s
        """
    with connection.cursor() as cursor:
        cursor.execute(query, [fullname, ssn])
        row = cursor.fetchone()
        if row:
            # If a matching client is found, create or retrieve the corresponding User object
            # user, created = User.objects.get_or_create(username=row[1])
            # Associate any additional data from the client table with the User object if needed
            # For example: user.client_id = row[0]
            # return {
            #         'id': row[0],
            #         'fullname': row[1],
            #         # Add other fields as needed
            #     }      
            #  
            return row[0] #return id
            # return user
        return None
    
def login(user_id):
    auth_users.add(user_id)

def logout(user_id):
    auth_users.remove(user_id)
    
def is_authenticated(user_id):
    return user_id in auth_users
    
    
    
    

