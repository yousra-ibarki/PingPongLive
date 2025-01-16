from rest_framework import serializers
from .models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username')
    receiver = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'is_read', 'sender', 'receiver']

