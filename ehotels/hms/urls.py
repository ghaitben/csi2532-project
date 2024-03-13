from django.urls import path
from . import views

urlpatterns = [
        # path("", views.index, name="index"),
        path('register', views.register_client),
        path('login', views.login_client),
        path('search_rooms', views.search_rooms)
]
