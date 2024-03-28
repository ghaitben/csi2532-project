from django.db import connection
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

# Set of authenticated users
auth_clients = set()
auth_employees = set()

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        #user type optional for client to maintain backwards compatibility
        user_type = data.get('user_type', None) 
        fullname = data.get('fullname')
        ssn = data.get('ssn')
        
        
        address_street = data.get('street')
        address_city = data.get("city")
        address_country = data.get("country")
        address_postal_code = data.get("postal_code")
        hotel_id = data.get("hotel_id", None)
        
        
        if fullname and ssn:
            with connection.cursor() as cursor:
                # Insert address
                cursor.execute(
                    "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
                    [address_street, address_city, address_country, address_postal_code]
                )
                address_id = cursor.fetchone()[0]
                
                # Insert client
                if user_type == "client" or not user_type:
                    cursor.execute(
                        "INSERT INTO client (fullname, adress_id, ssn) VALUES (%s, %s, %s)",
                        [fullname, address_id, ssn]
                    )
                    return JsonResponse({"message": "Client registered successfully"}, status=201)
                
                elif user_type == "employee": 
                    cursor.execute(
                        "INSERT INTO employee (fullname, adress_id, ssn, works_in) VALUES (%s, %s, %s, %s)",
                        [fullname, address_id, ssn, hotel_id]
                    )
                    return JsonResponse({"message": "Employee registered successfully"}, status=201)
                    
        else:
            return JsonResponse({"message": "Missing required fields"}, status=400)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        #user type optional for client to maintain backwards compatibility
        user_type = data.get("user_type", None)
        fullname = data.get('fullname')
        ssn = data.get('ssn')
        
        user_id = authenticate(fullname, ssn, user_type)
        
        if user_id:
            login(user_id, user_type)  
            return JsonResponse({"message": "User login successful", "user_id": user_id}, status=200)
        else:
            return JsonResponse({"message": "User login failed"}, status=401)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)
    

def search_rooms(request):
    if request.method == 'GET':
        data = json.loads(request.body)
        user_type = data.get("user_type", None)
        
        if is_authenticated(data.get("user_id"), user_type):
            # Extract search parameters
            country_name = data.get('country_name', '')
            city = data.get('city', '')
            hotel_chain_name = data.get('hotel_chain_name', None)
            hotel_rating = data.get('hotel_rating', None)
            capacity = data.get('capacity', None)
            room_price = data.get('room_price', None)
            total_rooms = data.get('total_rooms', None)
            res_start_date = data.get('res_start_date')
            res_end_date = data.get('res_end_date')
            
            # Construct the SQL query with placeholders
            query = """
                SELECT DISTINCT room.id AS room_id, hotel.id AS hotel_id,
                                hotel_chain.name AS chain_name,
                                hotel.rating AS hotel_rating, room.price_per_day,
                                capacity, country.name AS country, city, street
                FROM room
                INNER JOIN hotel ON hotel_id = hotel.id
                INNER JOIN hotel_chain ON hotel_chain_id = hotel_chain.id
                INNER JOIN adress ON adress.id = hotel.adress_id
                INNER JOIN country ON adress.country_id = country.id
                LEFT JOIN reservation ON reservation.room_id = room.id
                WHERE country.name = %s
                  AND city = %s
                  AND (%s IS NULL OR hotel_chain.name = %s)
                  AND (%s IS NULL OR rating >= %s)
                  AND (%s IS NULL OR capacity = %s)
                  AND (%s IS NULL OR room.price_per_day <= %s)
                  AND (%s IS NULL OR hotel.id IN (
                        SELECT hotel.id AS num_rooms
                        FROM hotel
                        INNER JOIN room ON hotel.id = hotel_id
                        GROUP BY (hotel.id)
                        HAVING COUNT(room.id) = %s
                    ))
                
                  AND (start_date NOT BETWEEN %s AND %s OR start_date IS NULL)
                  AND (end_date NOT BETWEEN %s AND %s OR end_date IS NULL)
                """
    
            # Execute the query with parameters
            with connection.cursor() as cursor:
                cursor.execute(query, [country_name, city, 
                                        hotel_chain_name, hotel_chain_name,
                                        hotel_rating, hotel_rating,
                                        capacity, capacity,
                                        room_price, room_price,
                                        total_rooms, total_rooms,
                                        res_start_date, res_end_date,
                                        res_start_date, res_end_date,
                                        ])
                results = cursor.fetchall()
            
            # Format the results as needed
            response_data = []
            for row in results:
                room_id, hotel_id, chain_name, hotel_rating, price_per_day, capacity, country, city, street = row
                response_data.append({
                    'room_id': room_id,
                    'hotel_id': hotel_id,
                    'chain_name': chain_name,
                    'hotel_rating': hotel_rating,
                    'price_per_day': price_per_day,
                    'capacity': capacity,
                    'country': country,
                    'city': city,
                    'street': street
                })
            
            # Return the response
            return JsonResponse(response_data, safe=False)
        else:
            return JsonResponse({"message": "Client authentication failed"}, status=401)
        
def reserve_room(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_type = data.get("user_type", None)
        
        if is_authenticated(data.get("user_id"), user_type):
            # Extract search parameters
            room_id = data.get('room_id', None)
            client_id = data.get('client_id', None)
            start_date = data.get('start_date', None)
            end_date = data.get('end_date', None)
            
            if room_id and client_id and start_date and end_date:
                with connection.cursor() as cursor:
                # Insert address
                    cursor.execute(
                        "INSERT INTO reservation (client_id, room_id, start_date, end_date) VALUES (%s, %s, %s, %s) RETURNING id",
                        [client_id, room_id, start_date, end_date]
                    )
                    reservation_id = cursor.fetchone()[0]
            
                return JsonResponse({"message": "Reservation success", "reservation_id": reservation_id}, status=200)
            else:
                return JsonResponse({"message": "Missing required fields"}, status=400)
        else:
            return JsonResponse({"message": "Client authentication failed"}, status=401)
            
def rent_room(request):
    
    if request.method == 'POST':
        data = json.loads(request.body)
        user_type = data.get("user_type", None)
        
        # Only employees are able to change reservations into rentals anc accept payment
        if is_authenticated(data.get("user_id"), user_type) and user_type == "employee":
            # Extract rental parameters
            reservation_id = data.get('reservation_id', None)
            payment = data.get('payment', None)
        
            if reservation_id and payment:
                with connection.cursor() as cursor:
                # Insert rental
                    cursor.execute(
                        "INSERT INTO rental (reservation_id, payment) VALUES (%s, %s) RETURNING id",
                        [reservation_id, payment]
                    )
                    rental_id = cursor.fetchone()[0]
            
                return JsonResponse({"message": "Rental success", "rental": rental_id}, status=200)
            else:
                return JsonResponse({"message": "Missing required fields"}, status=400)
        else:
            return JsonResponse({"message": "Client authentication failed"}, status=401)

def add_room(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_type = data.get("user_type", None)
        
        # Only employees are able to add rooms
        if is_authenticated(data.get("user_id"), user_type) and user_type == "employee":
            # Extract rental parameters
            hotel_id = data.get('hotel_id', None)
            price_per_day = data.get('price_per_day', None)
            surface_area = data.get("surface_area")
            capacity = data.get("room_capacity")
            damage_description = data.get("damage_description")
            expansion_type = data.get("expansion_type")
            view_type = data.get("view_type")
        
            if hotel_id and price_per_day and surface_area and capacity and damage_description and expansion_type and view_type:
                    
                    with connection.cursor() as cursor:
                        # Insert rental
                        cursor.execute(
                            "INSERT INTO room (hotel_id, price_per_day, surface_area, capacity, damage_description, expansion, view_type) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id",
                            [hotel_id, price_per_day, surface_area, capacity, damage_description, expansion_type, view_type]
                        )
                        room_id = cursor.fetchone()[0]
            
                    return JsonResponse({"message": "Room addition success", "room_id": room_id}, status=200)
            else:
                return JsonResponse({"message": "Missing required fields"}, status=400)
        else:
            return JsonResponse({"message": "Client authentication failed"}, status=401)      


@csrf_exempt
def add_hotel(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_type = data.get("user_type", None)
        
        # Only employees are able to add rooms
        if is_authenticated(data.get("user_id"), user_type) and user_type == "employee":
            # Extract rental parameters
            rating = data.get('rating', None)
            hotel_chain_id = data.get('hotel_chain_id', None)
            
            address_street = data.get('street')
            address_city = data.get("city")
            address_country = data.get("country")
            address_postal_code = data.get("postal_code")
        
            if hotel_chain_id and rating:
                    
                    with connection.cursor() as cursor:
                        
                         # Insert address
                        cursor.execute(
                            "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
                            [address_street, address_city, address_country, address_postal_code]
                        )
                        address_id = cursor.fetchone()[0]
                        
                        # Insert rental
                        cursor.execute(
                            "INSERT INTO hotel (rating, hotel_chain_id, adress_id) VALUES (%s, %s, %s) RETURNING id",
                            [rating, hotel_chain_id, address_id]
                        )
                        hotel_id = cursor.fetchone()[0]
            
                    return JsonResponse({"message": "Hotel addition success", "hotel_id": hotel_id}, status=200)
            else:
                return JsonResponse({"message": "Missing required fields"}, status=400)
        else:
            return JsonResponse({"message": "Client authentication failed"}, status=401)      

    

def authenticate(fullname, ssn, user_type):
    
    if user_type == "employee":
        user_table = "employee"
    elif user_type == "client" or not user_type:
        user_table = "client"
    
    query = f"""
            SELECT id, fullname
            FROM {user_table}
            WHERE fullname = %s AND ssn = %s
        """
        
    with connection.cursor() as cursor:
        cursor.execute(query, [fullname, ssn])
        row = cursor.fetchone()
        if row:
            return row[0] 
        return None
    
def login(user_id, user_type):
    
    if user_type == "client" or not user_type:
        auth_clients.add(user_id)
    elif  user_type == "employee":
        auth_employees.add(user_id)
        

def logout(user_id, user_type):
    
    if user_type == "client" or not user_type:
        auth_clients.remove(user_id)
    elif  user_type == "employee":
        auth_employees.remove(user_id)
    
def is_authenticated(user_id, user_type=None):
    
    if user_type == "client" or not user_type:
        return user_id in auth_clients
    elif  user_type == "employee":
        return user_id in auth_employees
