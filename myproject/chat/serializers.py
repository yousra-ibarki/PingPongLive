from rest_framework import serializers
from .models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.CharField(source='sender.username')
    receiver = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'content', 'timestamp', 'is_read', 'sender', 'receiver']

    def get_receiver(self, obj):
        # Get the other participant in the room who isn't the sender
        participants = obj.room.participants.exclude(id=obj.sender.id)
        if participants.exists():
            return participants.first().username
        return None
