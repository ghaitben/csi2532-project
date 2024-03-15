from django.db import connection
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt

# Set of authenticated users
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
                # Insert address
                cursor.execute(
                    "INSERT INTO adress (street, city, country_id, postalcode) VALUES (%s, %s, %s, %s) RETURNING id",
                    [address_street, address_city, address_country, address_postal_code]
                )
                address_id = cursor.fetchone()[0]
                
                # Insert client
                cursor.execute(
                    "INSERT INTO client (fullname, adress_id, ssn) VALUES (%s, %s, %s)",
                    [fullname, address_id, ssn]
                )
                return JsonResponse({"message": "Client registered successfully"}, status=201)
        else:
            return JsonResponse({"message": "Missing required fields"}, status=400)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


@csrf_exempt
def login_client(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        fullname = data.get('fullname')
        ssn = data.get('ssn')
        
        user_id = authenticate(fullname, ssn)
        
        if user_id:
            login(user_id)  
            return JsonResponse({"message": "Client login successful", "user_id": user_id}, status=200)
        else:
            return JsonResponse({"message": "Client login failed"}, status=401)
    else:
        return JsonResponse({"message": "Method not allowed"}, status=405)


def search_rooms(request):
    if request.method == 'GET':
        data = json.loads(request.body)
        
        if is_authenticated(data.get("user_id")):
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
                INNER JOIN reservation ON reservation.room_id = room.id
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
                
                  AND start_date NOT BETWEEN %s AND %s
                  AND end_date NOT BETWEEN %s AND %s
                  AND NOT %s < (SELECT MIN(start_date) FROM reservation)
                  AND NOT %s > (SELECT MAX(end_date) FROM reservation)
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
            return row[0] 
        return None
    
def login(user_id):
    auth_users.add(user_id)

def logout(user_id):
    auth_users.remove(user_id)
    
def is_authenticated(user_id):
    return user_id in auth_users
