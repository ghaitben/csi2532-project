# myapp/backends.py

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from django.db import connection

class CustomBackend(BaseBackend):
    def authenticate(self, request, fullname=None, ssn=None):
        # Construct SQL query to validate fullname and ssn against the client table
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
                 return {
                    'id': row[0],
                    'fullname': row[1],
                    # Add other fields as needed
                }
                # return user
        return None
