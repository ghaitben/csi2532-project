# csi2532-project

## Running the front end
Run `cd $PROJECT_ROOT/frontend && npm run dev`.

## ER diagram
TODO: miloudi

## SQL schemas
TODO: miloudi



 API Documentation

This documentation provides details on how to use the API endpoints for client registration, login, and room search functionalities.

## 1. Register user (client or employee)

- **URL:** `/register`
- **Method:** `POST`
- **Description:** Registers a new client or employee.
- **Request Body Parameters:**
  - `user_type` (string, optional): either "client" or "employee". Default is "client".
  - `fullname` (string, required): Full name of the client.
  - `ssn` (string, required): Social security number of the client.
  - `street` (string، required): Street address of the client.
  - `city` (string, required): City of residence of the client.
  - `country` (string, required): Country of residence of the client.
  - `postal_code` (string, required): Postal code of the client's address.
  - `hotel_id` (integer, optional): main hotel where new employee will be working. Required when `user_type` is "employee".
- **Response:**
  - `201 Created`: Client registered successfully.
  - `400 Bad Request`: Missing required fields.
  - `405 Method Not Allowed`: Only `POST` method allowed.
 
Register Endpoint

    Sample JSON Body:

    json

    {
        "fullname": "John Doe",
        "ssn": "123456789",
        "street": "123 Main Street",
        "city": "Exampleville",
        "country": "Exampleland",
        "postal_code": "12345",
        "user_type": "client",
        "hotel_id": 1 //does not affect behavior when user_type is "client"
    }

    This JSON body registers a new client named "John Doe" with the provided address details in Exampleville, Exampleland. The user is associated with a specific hotel identified by the hotel ID.

## 2. Login User

- **URL:** `/login`
- **Method:** `POST`
- **Description:** Logs in an existing client.
- **Request Body Parameters:**
  - `user_type` (string, optional): either "client" or "employee". Default is "client".
  - `fullname` (string, required): Full name of the client.
  - `ssn` (string, required): Social security number of the client.
- **Response:**
  - `200 OK`: Client login successful. Response includes `user_id`.
  - `401 Unauthorized`: Client login failed.
  - `405 Method Not Allowed`: Only `POST` method allowed.

Login Endpoint

    Sample JSON Body:

    json

    {
        "fullname": "John Doe",
        "ssn": "123456789",
        "user_type": "client"
    }

    This JSON body attempts to log in a client named "John Doe" with the provided SSN. If the credentials are correct, the user is logged in successfully.


## 3. Search Rooms

- **URL:** `/search_rooms`
- **Method:** `GET`
- **Description:** Search available rooms based on specified criteria.
- **Request Body Parameters:**
  - `user_type` (string, optional): User type inititating request. Either "client" or "employee". Default is "client".
  - `user_id` (string, required): ID of the authenticated user.
  - `country_name` (string): Name of the country.
  - `city` (string): City name.
  - `hotel_chain_name` (string): Name of the hotel chain (optional).
  - `hotel_rating` (integer): Minimum hotel rating (optional).
  - `capacity` (integer): Capacity of the room (optional).
  - `room_price` (integer): Maximum price per day of the room (optional).
  - `total_rooms` (integer): Total number of rooms available in the hotel (optional).
  - `res_start_date` (string, format: YYYY-MM-DD): Start date for reservation.
  - `res_end_date` (string, format: YYYY-MM-DD): End date for reservation.
- **Response:**
  - `200 OK`: List of available rooms matching the criteria.
  - `401 Unauthorized`: Client authentication failed.
  - `405 Method Not Allowed`: Only `GET` method allowed.
 
Search Rooms Endpoint

    Sample JSON Body:

    json

    {
        "user_id": 123,
        "user_type": "client",
        "country_name": "Exampleland",
        "city": "Exampleville",
        "hotel_chain_name": "Example Hotel Group",
        "hotel_rating": 4,
        "capacity": 2,
        "room_price": 100,
        "total_rooms": 5,
        "res_start_date": "2024-04-01",
        "res_end_date": "2024-04-05"
    }

    This JSON body represents a room search request by a client in Exampleville, Exampleland, looking for rooms in hotels owned by the "Example Hotel Group" with a rating of 4 or higher, having a capacity of 2 people, priced at $100 per day, with a total of 5 rooms available. The search is conducted for the specified reservation dates.


     Sample Json body with most optional criteria omitted
     
     json

    {
        "user_id": 123,
        "user_type": "client",
        "country_name": "Exampleland",
        "city": "Exampleville",
        "res_start_date": "2024-04-01",
        "res_end_date": "2024-04-05"
    }

 
### 4. Reserve Room
  - **URL:** `/reserve_room`
  - **Method:** `POST`
  - **Description:** `Reserves a room for a specified period.`
  - **Request Body Parameters:**
    - `user_id` (integer): The ID of the user making the reservation.
    - `user_type` (string, optional): The type of user making the reservation (optional). By default "client"
    - `room_id` (integer): The ID of the room to be reserved.
    - `client_id` (integer): The ID of the client making the reservation.
    - `start_date` (string): The start date of the reservation (YYYY-MM-DD format).
    - `end_date` (string): The end date of the reservation (YYYY-MM-DD format).
  - **Response:**
    - `200 OK`: Reservation successful. Response includes the `ID` of the newly created reservation.

Reserve Room Endpoint

    Sample JSON Body:

    json

    {
      "user_id": 123,
      "user_type": "client",
      "room_id": 456,
      "client_id": 789,
      "start_date": "2024-04-01",
      "end_date": "2024-04-05"
    }

This JSON body represents a room reservation request by a client with the specified room ID (456) and client ID (789) for the reservation period from April 1, 2024, to April 5, 2024.
