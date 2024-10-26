from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import ChatMessage
from .serializers import ChatMessageSerializer

class ChatMessageList(generics.ListCreateAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-timestamp')

class ChatMessageDetail(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['user_id']
        return ChatMessage.objects.filter(
            (Q(sender=user) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver=user))
        ).order_by('timestamp')