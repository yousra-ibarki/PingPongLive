from django.urls import path
from chat.views import ChatMessageList, ChatMessageDetail

urlpatterns = [
    path('messages/', ChatMessageList.as_view(), name='message-list'),
    path('messages/<int:user_id>/', ChatMessageDetail.as_view(), name='message-detail'),
]