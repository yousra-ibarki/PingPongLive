from rest_framework import serializers
from .models import Game, GameMove

class GameMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameMessage
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp', 'is_read']
        read_only_fields = ['timestamp']
