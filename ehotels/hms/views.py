# # views.py

# from django.db import connection
# from django.http import JsonResponse
# import json
# from django.views.decorators.csrf import csrf_exempt
# from django.contrib.auth import *


# @csrf_exempt
# def register_client(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         fullname = data.get('fullname')
#         ssn = data.get('ssn')
        
        
#         address_street = data.get('street')
#         address_city = data.get("city")
#         address_country = data.get("country")
#         address_postal_code = data.get("postal_code")
        
       

#         if fullname and ssn:
#             with connection.cursor() as cursor:
                
#                 cursor.execute(
#                     "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
#                     [address_street, address_city, address_country, address_postal_code]
#                 )
                
#                 cursor.execute(
#                     "INSERT INTO client (fullname, adress_id, ssn) VALUES (%s, %s, %s)",
#                     [fullname, cursor.fetchone()[0], ssn]
#                 )
#                 return JsonResponse({"message": "Client registered successfully"}, status=201)
#         else:
#             return JsonResponse({"message": "Missing required fields"}, status=400)
#     else:
#         return JsonResponse({"message": "Method not allowed"}, status=405)


# # TODO: login client, and keep the session or something
# @csrf_exempt
# def login_client(request):
#     if request.method == 'POST':
#         data = json.loads(request.body)
#         fullname = data.get('fullname')
#         ssn = data.get('ssn')
        
        
#         user = authenticate(request, fullname=fullname, ssn=ssn)
#         if user:
#             login(request, user)  # Initiates a session for the authenticated user
#             return JsonResponse({"message": "Client login successful"}, status=200)
#         # Redirect to a success page or return a response indicating successful login
#         else:
#             return JsonResponse({"message": "Client login failed"}, status=401)
            # Return a response indicating failed login
            
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
import json


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated users to access this endpoint
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
            # You may want to replace User.objects.create_user with your own logic for creating users
            with connection.cursor() as cursor:
                
                cursor.execute(
                    "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
                    [address_street, address_city, address_country, address_postal_code]
                )
                
                cursor.execute(
                    "INSERT INTO client (fullname, adress_id, ssn) VALUES (%s, %s, %s)",
                    [fullname, cursor.fetchone()[0], ssn]
                )
            # Create token for the user
            token = Token.objects.create(user=user)

            # Your address insertion logic here

            return Response({"message": "Client registered successfully", "token": token.key}, status=201)
        else:
            return Response({"message": "Missing required fields"}, status=400)
    else:
        return Response({"message": "Method not allowed"}, status=405)


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated users to access this endpoint
def login_client(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fullname = data.get('fullname')
        ssn = data.get('ssn')

        user = authenticate(request, username=fullname, password=ssn)
        if user:
            # Create or get token for the user
            token, created = Token.objects.get_or_create(user=user)
            return Response({"message": "Client login successful", "token": token.key}, status=200)
        else:
            return Response({"message": "Client login failed"}, status=401)
    else:
        return Response({"message": "Method not allowed"}, status=405)
