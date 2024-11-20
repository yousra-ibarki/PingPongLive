from django.urls import path
from . import views

urlpatterns = [
    path('messages/<str:username>/', views.get_user_messages, name='user-messages'),
    path('messages/<str:username>/read/', views.mark_messages_read, name='mark-messages-read'),
    path('friendship-status/<str:username>/', views.get_friendship_status),
    path('accept-friend-request/<str:username>/', views.accept_friend_request),
    path('reject-friend-request/<str:username>/', views.reject_friend_request),
    path('unblock-user/<str:username>/', views.unblock_user),
]