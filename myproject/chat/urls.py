from django.urls import path
from . import views

urlpatterns = [
    path('messages/<str:username>/', views.get_user_messages, name='user-messages'),
    path('messages/<str:username>/read/', views.mark_messages_read, name='mark-messages-read'),
]