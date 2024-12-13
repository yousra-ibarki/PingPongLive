from django.urls import path
from . import views

urlpatterns = [
    path('messages/<str:username>/', views.UserMessagesView.as_view(), name='user-messages'),
    path('unread_messages/', views.UnreadMessagesView.as_view(), name='unread_messages'),
    path('mark_message_as_read/<str:username>/', views.MarkMessagesAsRead.as_view(), name='unread_messages'),
]