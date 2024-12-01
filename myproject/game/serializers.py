from rest_framework import serializers
from .models import GameMessage, GameResult

class GameMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameMessage
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp', 'is_read']
        read_only_fields = ['timestamp']

class GameResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameResult
        fields = ['user', 'opponent', 'goals_scored', 'opponent_goals', 'result', 'timestamp']
        read_only_fields = ['timestamp']

