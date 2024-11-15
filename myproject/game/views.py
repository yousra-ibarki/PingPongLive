from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import GameMessage
from .serializers import GameMessageSerializer

class GameMessageList(generics.ListCreateAPIView):
    serializer_class = GameMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return GameMessage.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).order_by('-timestamp')

class GameMessageDetail(generics.ListAPIView):
    serializer_class = GameMessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        other_user_id = self.kwargs['user_id']
        return GameMessage.objects.filter(
            (Q(sender=user) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver=user))
        ).order_by('timestamp')
