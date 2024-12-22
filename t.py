from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model

User = get_user_model()

class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'message', 'created_at', 'is_read', 'sender']
        
    def get_sender(self, obj):
        if obj.sender:
            return obj.sender.username
        return None