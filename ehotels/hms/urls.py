from django.urls import path
from . import views

urlpatterns = [
        path('register', views.register),
        path('login', views.login_user),
        path('search_rooms', views.search_rooms),
        path("reserve_room", views.reserve_room),
        path("rent_room", views.rent_room),
        path("add_room", views.add_room),
        path("add_hotel", views.add_hotel)
]
