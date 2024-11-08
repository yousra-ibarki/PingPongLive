from django.urls import path
from . import views
from .views import GameMessageList, GameMessageDetail

urlpatterns = [
    path('messages/', GameMessageList.as_view(), name='message-list'),
    path('messages/<int:user_id>/', GameMessageDetail.as_view(), name='message-detail'),
]