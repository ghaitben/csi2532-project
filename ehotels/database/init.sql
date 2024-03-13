---------------------------- DATABASE SETUP ---------------------------------------------
-- Create the root superuser and database to supress PG's warnings.
CREATE USER root superuser;
CREATE DATABASE root;

-- Create a new database --
CREATE DATABASE maindb;
\connect maindb;

-------------------------------------- DATABASE RELATIONS -------------------------------
-- List of countries
CREATE TABLE IF NOT EXISTS country (
  id serial PRIMARY KEY,
  name varchar(80) NOT NULL
);

-- Adress entity
CREATE TABLE IF NOT EXISTS adress (
  id serial PRIMARY KEY,
  street text NOT NULL,
  city text NOT NULL,
  country_id smallint REFERENCES country(id) ON DELETE SET NULL,
  postalcode text
);

-- Hotel chain entity
CREATE TABLE IF NOT EXISTS hotel_chain (
    id serial PRIMARY KEY,
    name text NOT NULL
);

-- Hotel chain central offices.
CREATE TABLE IF NOT EXISTS hotel_chain_central_offices (
    hotel_chain_id serial REFERENCES hotel_chain(id) ON DELETE CASCADE,
    adress_id integer REFERENCES adress ON DELETE SET NULL 
);

-- Hotel chain contact emails.
CREATE TABLE IF NOT EXISTS hotel_chain_contact_emails (
    hotel_chain_id serial REFERENCES hotel_chain(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL
);

-- Hotel chain contact phone numbers.
CREATE TABLE IF NOT EXISTS hotel_chain_contact_numbers (
    hotel_chain_id serial REFERENCES hotel_chain(id) ON DELETE CASCADE,
    phone text UNIQUE NOT NULL CHECK (phone ~ '\+?\d+' AND length(phone) >= 8)
);

-- Hotel entity
CREATE TABLE IF NOT EXISTS hotel (
    id serial PRIMARY KEY,
    rating smallint CHECK (rating >= 1 AND rating <= 5),
    hotel_chain_id serial REFERENCES hotel_chain(id) ON DELETE CASCADE,
    adress_id integer REFERENCES adress(id) ON DELETE SET NULL
);

-- Hotel contact emails.
CREATE TABLE IF NOT EXISTS hotel_contact_emails (
    hotel_id serial REFERENCES hotel(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL
);

-- Hotel contact phone numbers.
CREATE TABLE IF NOT EXISTS hotel_contact_numbers (
    hotel_id serial REFERENCES hotel(id) ON DELETE CASCADE,
    phone text UNIQUE NOT NULL CHECK (phone ~ '\+?\d+' AND length(phone) >= 8 AND length(phone) <= 16)
);

-- Employee entity
CREATE TABLE IF NOT EXISTS employee (
    id serial PRIMARY KEY,
    ssn text UNIQUE NOT NULL CHECK (ssn ~ '\d+' AND length(ssn) = 9),
    fullname text NOT NULL,
    adress_id integer REFERENCES adress(id) ON DELETE SET NULL,
    works_in serial REFERENCES hotel(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX employee_ssn_idx ON employee (ssn);

-- employee roles table.
CREATE TYPE employee_role AS ENUM ('manager', 'director', 'receptionist');
CREATE TABLE IF NOT EXISTS employee_roles (
    employee_id serial REFERENCES employee(id) ON DELETE CASCADE,
    role employee_role,
    PRIMARY KEY (employee_id, role)
);

-- Hotel room entity
CREATE TYPE room_capacity AS ENUM ('simple', 'double');
CREATE TYPE room_view AS ENUM ('ocean', 'mountains');
CREATE TYPE expansion_type AS ENUM ('none', 'additional bed', 'private balcony');
CREATE TYPE amenity_type AS ENUM ('TV', 'Fridge', 'AC');
CREATE TABLE IF NOT EXISTS room (
    id serial PRIMARY KEY,
    hotel_id serial REFERENCES hotel(id) ON DELETE CASCADE,
    price_per_day integer NOT NULL CHECK (price_per_day > 0),
    surface_area integer CHECK (surface_area > 0),
    capacity room_capacity NOT NULL,
    damage_description text,
    expansion expansion_type DEFAULT 'none',
    view_type room_view
);

-- Room amenities
CREATE TABLE IF NOT EXISTS room_amenities (
    room_id serial REFERENCES room(id) ON DELETE CASCADE,
    amenity amenity_type NOT NULL,
    PRIMARY KEY (room_id, amenity)
);

-- Client entity
CREATE TABLE IF NOT EXISTS client (
    id serial PRIMARY KEY,
    fullname text NOT NULL,
    adress_id integer REFERENCES adress(id) ON DELETE SET NULL,
    ssn text UNIQUE NOT NULL CHECK (ssn ~ '\d+' AND length(ssn) = 9),
    registration_date DATE NOT NULL DEFAULT CURRENT_DATE
);
CREATE UNIQUE INDEX client_ssn_idx ON client (ssn);

-- Reservation entity
CREATE TABLE IF NOT EXISTS reservation (
    id serial PRIMARY KEY,
    client_id integer REFERENCES client(id) ON DELETE SET NULL,
    room_id integer REFERENCES room(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date)
);

-- Rental entity
CREATE TABLE IF NOT EXISTS rental (
    id serial PRIMARY KEY,
    reservation_id integer REFERENCES reservation(id) ON DELETE SET NULL
);

---------------------------- POPULATING THE DATABASE ------------------------
CREATE TABLE IF NOT EXISTS testing_constants (
    label text UNIQUE NOT NULL,
    value text NOT NULL
);
INSERT INTO testing_constants (label, value) VALUES 
('kNumHotelChains', 10::text),
('kNumHotelsPerHC', 8::text),
('kNumEmployeePerHotel', 10::text),
('kNumRoomsPerHotel', 20::text),
('kNumClients', 1200::text),
('kMaxReservationsPerRoom', 10::text),
('kNumHCCentralOffices', 4::text),
('kNumHCContactEmails', 4::text),
('kNumHCContactPhones', 4::text),
('kNumHotelContactEmails', 4::text),
('kNumHotelContactPhones', 4::text),
('kNumRentals', 31::text);

-- Helper functions --
CREATE OR REPLACE FUNCTION k(constant_name text) RETURNS text AS 
$$
DECLARE
    has_value integer;
    val text;
BEGIN
    SELECT COUNT(*) FROM testing_constants WHERE testing_constants.label=constant_name INTO has_value;

    IF has_value = 0 THEN
        RAISE EXCEPTION 'Constant % not found.', constant_name;
    END IF;
    SELECT value FROM testing_constants WHERE testing_constants.label=constant_name INTO val;

    RETURN val;
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION validate_new_reservation() RETURNS TRIGGER AS
$$
DECLARE
    conflicting_reservations integer;
    conflicting_start_date DATE;
    conflicting_end_date DATE;
BEGIN
    SELECT COUNT(*) FROM reservation WHERE
    reservation.room_id = NEW.room_id AND
    (
        (NEW.start_date >= reservation.start_date AND NEW.start_date < reservation.end_date)
    OR 
        (NEW.end_date > reservation.start_date AND NEW.end_date <= reservation.end_date)
    )
    INTO conflicting_reservations;

    SELECT start_date, end_date FROM reservation WHERE
    reservation.room_id = NEW.room_id 
    AND
    (
        (NEW.start_date >= reservation.start_date AND NEW.start_date < reservation.end_date)
    OR 
        (NEW.end_date > reservation.start_date AND NEW.end_date <= reservation.end_date)
    )
    LIMIT 1
    INTO conflicting_start_date, conflicting_end_date;

    IF conflicting_reservations > 0 THEN
        RAISE EXCEPTION 'reservation [%, %] conflicts with reservation [%, %]. Room id: %', NEW.start_date, NEW.end_date, conflicting_start_date, conflicting_end_date, NEW.room_id;

    END IF;

    RETURN NEW;
END;
$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION rand_int_between(lo integer, hi integer) RETURNS integer AS
$$
    SELECT lo + FLOOR(random() * (hi - lo + 1))
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION ndigit_randint(ndigits integer, times integer DEFAULT 1) RETURNS TABLE(num integer) AS 
$$
    SELECT LPAD(FLOOR(random()*10^$1)::text, $1, '1')::integer FROM (
        SELECT GENERATE_SERIES(1, $2)
    )
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_date(times integer DEFAULT 1) RETURNS DATE AS 
$$
    SELECT NOW() - (random() * (interval '4242 days')) FROM (
        SELECT GENERATE_SERIES(1, $1)
    )
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION rand_email(times integer DEFAULT 1) RETURNS TABLE (email text) AS
$$
    SELECT (LEFT(md5(random()::text), 10) || '@' || LEFT(md5(random()::text), 4) || '.com') as email FROM (
        SELECT GENERATE_SERIES(1, $1)
    )
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION rand_str(sz integer, times integer DEFAULT 1) RETURNS TABLE(str text) AS
$$
    SELECT RPAD(md5(random()::text), $1, md5(CURRENT_TIMESTAMP::text)) FROM ( SELECT GENERATE_SERIES(1, $2) )
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION rand_country() RETURNS integer AS
$$
    SELECT id FROM country ORDER BY random() LIMIT 1
$$ 
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION rand_adress(times integer DEFAULT 1) RETURNS TABLE(id int) AS
$$
    WITH random_adresses AS (
        SELECT rand_country() as country_id,
               md5(RANDOM()::text) as street,
               md5(RANDOM()::text) as city,
               ndigit_randint(5) as postalcode
        FROM (
            SELECT GENERATE_SERIES(1, $1)
        )
    )
    INSERT INTO adress (street, city, country_id, postalcode)
        SELECT street, city, country_id, postalcode FROM random_adresses
    RETURNING id
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_non_manager_employee_roles() RETURNS TABLE (role employee_role) AS
$$
    WITH num_roles (cnt) AS (
        SELECT COUNT(*)::integer FROM pg_enum WHERE enumtypid = 'employee_role'::regtype
    )
    SELECT enumlabel::employee_role FROM pg_enum 
    WHERE enumtypid = 'employee_role'::regtype AND enumlabel <> 'manager' 
    ORDER BY random()
    LIMIT rand_int_between(1, (SELECT cnt FROM num_roles) - 1) 
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_set_of_amenities() RETURNS TABLE (item amenity_type) AS
$$
    WITH num_amenities (cnt) AS (
        SELECT COUNT(*)::integer FROM pg_enum WHERE enumtypid = 'amenity_type'::regtype
    )
    SELECT enumlabel::amenity_type FROM pg_enum 
    WHERE enumtypid = 'amenity_type'::regtype
    ORDER BY random()
    LIMIT rand_int_between(1, (SELECT cnt FROM num_amenities)) 
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_enum_variant(enum_type text) RETURNS text AS 
$$
    SELECT enumlabel FROM pg_enum
    WHERE enumtypid = enum_type::regtype
    ORDER BY random()
    LIMIT 1
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_enum_variants(enum_type text, times integer) RETURNS TABLE (variant text) AS
$$
    WITH RECURSIVE recurse (counter, enumlabel) AS ( 
        (
            SELECT 1 as counter, enumlabel FROM pg_enum
            WHERE enumtypid = $1::regtype
            LIMIT 1
        )

        UNION ALL

        (
            SELECT counter + 1, random_enum_variant($1) FROM recurse
            WHERE counter < $2
        )
    ) 
    SELECT enumlabel FROM recurse
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_room_capacity_variants(times integer) RETURNS TABLE (variant room_capacity) AS
$$
    SELECT variant::room_capacity FROM random_enum_variants('room_capacity', $1)
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_expansion_type_variants(times integer) RETURNS TABLE (variant expansion_type) AS
$$
    SELECT variant::expansion_type FROM random_enum_variants('expansion_type', $1)
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_room_view_variants(times integer) RETURNS TABLE (variant room_view) AS
$$
    SELECT variant::room_view FROM random_enum_variants('room_view', $1)
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_room_id() RETURNS integer AS 
$$
    SELECT room.id as random_rid FROM room ORDER BY random() LIMIT 1
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_client_id() RETURNS integer AS
$$
    SELECT client.id as random_cid FROM client ORDER BY random() LIMIT 1
$$
LANGUAGE SQL;

CREATE OR REPLACE FUNCTION random_start_and_end_dates(times integer) RETURNS TABLE (start_date DATE, end_date DATE) AS 
$$
    WITH RECURSIVE recurse AS (
        (
            SELECT d as start_date,
                   (d + (random() + 0.01) * (interval '100 days'))::DATE as end_date,
                   1 as counter
            FROM (
                SELECT random_date() as d
            )
        )

        UNION ALL

        (
            WITH recurse_inner AS (
                SELECT * FROM recurse
            )
            SELECT new_start_date as start_date,
                   (new_start_date + (random() + 0.01) * (interval '100 days'))::DATE as end_date,
                   counter + 1
            FROM (
                SELECT MAX(counter) as counter,
                       (MAX(end_date) + random() * (interval '10 days'))::DATE as new_start_date 
                FROM recurse_inner
            )
            WHERE counter < $1
        )
    )
    SELECT start_date, end_date FROM recurse
$$
LANGUAGE SQL;

------------------ Triggers ------------------------
CREATE OR REPLACE TRIGGER check_conflicting_reservation
    BEFORE INSERT OR UPDATE ON reservation
    FOR EACH ROW
        EXECUTE FUNCTION validate_new_reservation();

-- Creating the list of countries.
-- Credit to: https://gist.github.com/adhipg/1600028
INSERT INTO country (name) VALUES
('AFGHANISTAN'),
('ALBANIA'),
('ALGERIA'),
('AMERICAN SAMOA'),
('ANDORRA'),
('ANGOLA'),
('ANGUILLA'),
('ANTARCTICA'),
('ANTIGUA AND BARBUDA'),
('ARGENTINA'),
('ARMENIA'),
('ARUBA'),
('AUSTRALIA'),
('AUSTRIA'),
('AZERBAIJAN'),
('BAHAMAS'),
('BAHRAIN'),
('BANGLADESH'),
('BARBADOS'),
('BELARUS'),
('BELGIUM'),
('BELIZE'),
('BENIN'),
('BERMUDA'),
('BHUTAN'),
('BOLIVIA'),
('BOSNIA AND HERZEGOVINA'),
('BOTSWANA'),
('BOUVET ISLAND'),
('BRAZIL'),
('BRITISH INDIAN OCEAN TERRITORY'),
('BRUNEI DARUSSALAM'),
('BULGARIA'),
('BURKINA FASO'),
('BURUNDI'),
('CAMBODIA'),
('CAMEROON'),
('CANADA'),
('CAPE VERDE'),
('CAYMAN ISLANDS'),
('CENTRAL AFRICAN REPUBLIC'),
('CHAD'),
('CHILE'),
('CHINA'),
('CHRISTMAS ISLAND'),
('COCOS (KEELING) ISLANDS'),
('COLOMBIA'),
('COMOROS'),
('CONGO'),
('CONGO, THE DEMOCRATIC REPUBLIC OF THE'),
('COOK ISLANDS'),
('COSTA RICA'),
('COTE D''IVOIRE'),
('CROATIA'),
('CUBA'),
('CYPRUS'),
('CZECH REPUBLIC'),
('DENMARK'),
('DJIBOUTI'),
('DOMINICA'),
('DOMINICAN REPUBLIC'),
('ECUADOR'),
('EGYPT'),
('EL SALVADOR'),
('EQUATORIAL GUINEA'),
('ERITREA'),
('ESTONIA'),
('ETHIOPIA'),
('FALKLAND ISLANDS (MALVINAS)'),
('FAROE ISLANDS'),
('FIJI'),
('FINLAND'),
('FRANCE'),
('FRENCH GUIANA'),
('FRENCH POLYNESIA'),
('FRENCH SOUTHERN TERRITORIES'),
('GABON'),
('GAMBIA'),
('GEORGIA'),
('GERMANY'),
('GHANA'),
('GIBRALTAR'),
('GREECE'),
('GREENLAND'),
('GRENADA'),
('GUADELOUPE'),
('GUAM'),
('GUATEMALA'),
('GUINEA'),
('GUINEA-BISSAU'),
('GUYANA'),
('HAITI'),
('HEARD ISLAND AND MCDONALD ISLANDS'),
('HOLY SEE (VATICAN CITY STATE)'),
('HONDURAS'),
('HONG KONG'),
('HUNGARY'),
('ICELAND'),
('INDIA'),
('INDONESIA'),
('IRAN, ISLAMIC REPUBLIC OF'),
('IRAQ'),
('IRELAND'),
('ISRAEL'),
('ITALY'),
('JAMAICA'),
('JAPAN'),
('JORDAN'),
('KAZAKHSTAN'),
('KENYA'),
('KIRIBATI'),
('KOREA, DEMOCRATIC PEOPLE'),
('KOREA, REPUBLIC OF'),
('KUWAIT'),
('KYRGYZSTAN'),
('LAO PEOPLE'),
('LATVIA'),
('LEBANON'),
('LESOTHO'),
('LIBERIA'),
('LIBYAN ARAB JAMAHIRIYA'),
('LIECHTENSTEIN'),
('LITHUANIA'),
('LUXEMBOURG'),
('MACAO'),
('MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF'),
('MADAGASCAR'),
('MALAWI'),
('MALAYSIA'),
('MALDIVES'),
('MALI'),
('MALTA'),
('MARSHALL ISLANDS'),
('MARTINIQUE'),
('MAURITANIA'),
('MAURITIUS'),
('MAYOTTE'),
('MEXICO'),
('MICRONESIA, FEDERATED STATES OF'),
('MOLDOVA, REPUBLIC OF'),
('MONACO'),
('MONGOLIA'),
('MONTSERRAT'),
('MOROCCO'),
('MOZAMBIQUE'),
('MYANMAR'),
('NAMIBIA'),
('NAURU'),
('NEPAL'),
('NETHERLANDS'),
('NETHERLANDS ANTILLES'),
('NEW CALEDONIA'),
('NEW ZEALAND'),
('NICARAGUA'),
('NIGER'),
('NIGERIA'),
('NIUE'),
('NORFOLK ISLAND'),
('NORTHERN MARIANA ISLANDS'),
('NORWAY'),
('OMAN'),
('PAKISTAN'),
('PALAU'),
('PALESTINIAN TERRITORY, OCCUPIED'),
('PANAMA'),
('PAPUA NEW GUINEA'),
('PARAGUAY'),
('PERU'),
('PHILIPPINES'),
('PITCAIRN'),
('POLAND'),
('PORTUGAL'),
('PUERTO RICO'),
('QATAR'),
('REUNION'),
('ROMANIA'),
('RUSSIAN FEDERATION'),
('RWANDA'),
('SAINT HELENA'),
('SAINT KITTS AND NEVIS'),
('SAINT LUCIA'),
('SAINT PIERRE AND MIQUELON'),
('SAINT VINCENT AND THE GRENADINES'),
('SAMOA'),
('SAN MARINO'),
('SAO TOME AND PRINCIPE'),
('SAUDI ARABIA'),
('SENEGAL'),
('SERBIA AND MONTENEGRO'),
('SEYCHELLES'),
('SIERRA LEONE'),
('SINGAPORE'),
('SLOVAKIA'),
('SLOVENIA'),
('SOLOMON ISLANDS'),
('SOMALIA'),
('SOUTH AFRICA'),
('SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS'),
('SPAIN'),
('SRI LANKA'),
('SUDAN'),
('SURINAME'),
('SVALBARD AND JAN MAYEN'),
('SWAZILAND'),
('SWEDEN'),
('SWITZERLAND'),
('SYRIAN ARAB REPUBLIC'),
('TAIWAN, PROVINCE OF CHINA'),
('TAJIKISTAN'),
('TANZANIA, UNITED REPUBLIC OF'),
('THAILAND'),
('TIMOR-LESTE'),
('TOGO'),
('TOKELAU'),
('TONGA'),
('TRINIDAD AND TOBAGO'),
('TUNISIA'),
('TURKEY'),
('TURKMENISTAN'),
('TURKS AND CAICOS ISLANDS'),
('TUVALU'),
('UGANDA'),
('UKRAINE'),
('UNITED ARAB EMIRATES'),
('UNITED KINGDOM'),
('UNITED STATES'),
('UNITED STATES MINOR OUTLYING ISLANDS'),
('URUGUAY'),
('UZBEKISTAN'),
('VANUATU'),
('VENEZUELA'),
('VIET NAM'),
('VIRGIN ISLANDS, BRITISH'),
('VIRGIN ISLANDS, U.S.'),
('WALLIS AND FUTUNA'),
('WESTERN SAHARA'),
('YEMEN'),
('ZAMBIA'),
('ZIMBABWE');

-- Helper functions --

----------- Populate |hotel_chain| related tables ----------
-- |hotel_chain|
INSERT INTO hotel_chain (name) 
    SELECT ('Hotel-Chain-' || idx::text) as hotel_chain_id FROM (SELECT GENERATE_SERIES(1, k('kNumHotelChains')::integer) as idx);

-- |hotel_chain_central_offices|
INSERT INTO hotel_chain_central_offices (hotel_chain_id, adress_id)
    SELECT hotel_chain_id, rand_adress(k('kNumHCCentralOffices')::integer) FROM (SELECT id as hotel_chain_id FROM hotel_chain);

-- |hotel_chain_contact_emails|
INSERT INTO hotel_chain_contact_emails (hotel_chain_id, email)
    SELECT hotel_chain_id, rand_email(k('kNumHCContactEmails')::integer) FROM (SELECT id as hotel_chain_id FROM hotel_chain);

-- |hotel_chain_contact_phone|
INSERT INTO hotel_chain_contact_numbers (hotel_chain_id, phone)
    SELECT hotel_chain_id, ndigit_randint(9, k('kNumHCContactPhones')::integer) as phone FROM (SELECT id as hotel_chain_id FROM hotel_chain); 

-- |hotel|
WITH hotel_temp AS (
    SELECT id as hotel_chain_id,
    rand_adress(k('kNumHotelsPerHC')::integer) as adress_id,
    ndigit_randint(2, k('kNumHotelsPerHC')::integer) as rating FROM (SELECT id FROM hotel_chain)
)
INSERT INTO hotel (rating, hotel_chain_id, adress_id)
    SELECT (rating % 5) + 1, hotel_chain_id, adress_id FROM hotel_temp;

-- |hotel_contact_emails|
INSERT INTO hotel_contact_emails (hotel_id, email)
    SELECT hotel_id, rand_email(k('kNumHotelContactEmails')::integer) FROM (SELECT id as hotel_id FROM hotel);

-- |hotel contact numbers|
INSERT INTO hotel_contact_numbers (hotel_id, phone)
    SELECT hotel_id, ndigit_randint(9, k('kNumHotelContactPhones')::integer) as phone FROM (SELECT id as hotel_id FROM hotel); 

-- |employee|
INSERT INTO employee (works_in, ssn, fullname, adress_id)
    WITH employee_info AS (
        SELECT id as hotel_id,
               rand_str(9, k('kNumEmployeePerHotel')::integer) as fullname,
               rand_adress(k('kNumEmployeePerHotel')::integer) as adress_id
        FROM hotel
    ),
    numbered_employee_info AS (
        SELECT ROW_NUMBER() OVER () as r, hotel_id, fullname, adress_id FROM employee_info
    ),
    ssns AS (
        SELECT r, LPAD(r::text, 9, '0') as ssn FROM numbered_employee_info 
    )
    SELECT hotel_id, ssn, fullname, adress_id FROM numbered_employee_info JOIN ssns USING (r);

-- |employee_roles|
WITH insert_non_manager_roles AS (
    INSERT INTO employee_roles (employee_id, role)
        SELECT id as employee_id, random_non_manager_employee_roles() as role FROM (SELECT id from employee)
    RETURNING role
),
insert_manager_roles AS (
    INSERT INTO employee_roles (employee_id, role)
        SELECT id as employee_id, 'manager'::employee_role FROM (
            SELECT DISTINCT ON (works_in) id, works_in FROM employee
        )
    RETURNING role
) SELECT NULL;

-- |room|
INSERT INTO room (hotel_id, price_per_day, surface_area, capacity, damage_description, expansion, view_type)
    WITH room_info AS (
        SELECT id as hotel_id,
               ndigit_randint(rand_int_between(2, 4), k('kNumRoomsPerHotel')::integer) as price_per_day,
               ndigit_randint(rand_int_between(2, 4), k('kNumRoomsPerHotel')::integer) as surface_area,
               random_room_capacity_variants(k('kNumRoomsPerHotel')::integer) as room_capacity,
               random_expansion_type_variants(k('kNumRoomsPerHotel')::integer) as expansion,
               random_room_view_variants(k('kNumRoomsPerHotel')::integer) as view_type
        FROM (SELECT id from hotel)
    ) 
    SELECT hotel_id,
           price_per_day,
           surface_area,
           room_capacity,
           CASE WHEN random() < 0.11
            THEN (SELECT * FROM rand_str(rand_int_between(70, 400)))
            ELSE NULL
           END as damage_description,
           expansion,
           view_type
    FROM room_info;
           

-- |room_amenities|
INSERT INTO room_amenities (room_id, amenity)
    SELECT id, random_set_of_amenities() FROM (SELECT id from room);

-- |client|
INSERT INTO client (fullname, adress_id, ssn, registration_date)
    WITH client_info AS (
        SELECT rand_str(12) as fullname,
               rand_adress() as adress_id,
               ROW_NUMBER() OVER () as r,
               random_date() as registration_date
        FROM (
            SELECT GENERATE_SERIES(1, k('kNumClients')::integer)
        )
    ),
    ssns AS (
        SELECT ROW_NUMBER() OVER () as r, ('1' || LPAD(r::text, 8, '0')) as ssn FROM client_info
    )
    SELECT fullname, adress_id, ssn, registration_date FROM client_info JOIN ssns USING (r);

INSERT INTO reservation (client_id, room_id, start_date, end_date)
    WITH room_res AS (
        SELECT rid,
               start_date,
               end_date,
               ROW_NUMBER() OVER () as r
        FROM (
            SELECT id as rid,
                   (random_start_and_end_dates(rand_int_between(1, k('kMaxReservationsPerRoom')::integer))).*
            FROM (
                SELECT id FROM room ORDER BY random()
            )
        )
    ),
    cids AS (
        SELECT random_client_id() as cid,
               ROW_NUMBER() OVER () as r
        FROM (
            SELECT GENERATE_SERIES(1, (SELECT COUNT(*) FROM room_res))
        )
    )
    SELECT cid,
           rid,
           start_date,
           end_date
    FROM room_res JOIN cids USING (r);


-- |rental|
INSERT INTO rental (reservation_id) 
    SELECT id as reservation_id FROM reservation
    ORDER BY random()
    LIMIT k('kNumRentals')::integer
