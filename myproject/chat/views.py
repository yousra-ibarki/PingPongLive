from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import MessageSerializer
from myapp.models import Profile

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_messages(request, username):
    try:
        # Get the other user
        other_user = get_object_or_404(Profile, username=username)
        
        # Find the room between current user and other user
        room = ChatRoom.objects.filter(participants=request.user)\
                             .filter(participants=other_user)\
                             .first()
        
        if not room:
            return Response([])
        
        # Get all messages in the room
        messages = Message.objects.filter(room=room)\
                                .select_related('sender')\
                                .order_by('timestamp')
        
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, username):
    try:
        # Get the other user
        other_user = get_object_or_404(Profile, username=username)
        
        # Find the room
        room = ChatRoom.objects.filter(participants=request.user)\
                             .filter(participants=other_user)\
                             .first()
        
        if not room:
            return Response(
                {'error': 'Chat room not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mark all unread messages from the other user as read
        Message.objects.filter(
            room=room,
            sender=other_user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'status': 'Messages marked as read'})
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
