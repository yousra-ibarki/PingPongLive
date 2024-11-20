from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import MessageSerializer
from myapp.models import Profile


# views.py
# from .models import Profile, Friendship, Block
from myapp.models import Profile, Friendship, Block
from django.db.models import Q

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



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_friendship_status(request, username):
    target_user = get_object_or_404(Profile, username=username)
    current_user = request.user
    
    # Check if blocked
    if Block.objects.filter(
        (Q(blocker=current_user, blocked=target_user) | 
         Q(blocker=target_user, blocked=current_user))
    ).exists():
        return Response({'status': 'blocked'})
    
    # Check friendship status
    friendship = Friendship.objects.filter(
        (Q(from_user=current_user, to_user=target_user) | 
         Q(from_user=target_user, to_user=current_user))
    ).first()
    
    if not friendship:
        return Response({'status': 'none'})
    
    if friendship.status == 'accepted':
        return Response({'status': 'accepted'})
    
    if friendship.status == 'pending':
        if friendship.from_user == current_user:
            return Response({'status': 'pending'})
        return Response({'status': 'pending_received'})
    
    return Response({'status': friendship.status})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_friend_request(request, username):
    from_user = get_object_or_404(Profile, username=username)
    to_user = request.user
    
    friendship = get_object_or_404(
        Friendship,
        from_user=from_user,
        to_user=to_user,
        status='pending'
    )
    
    friendship.status = 'accepted'
    friendship.save()
    
    return Response({'status': 'accepted'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_friend_request(request, username):
    from_user = get_object_or_404(Profile, username=username)
    to_user = request.user
    
    friendship = get_object_or_404(
        Friendship,
        from_user=from_user,
        to_user=to_user,
        status='pending'
    )
    
    friendship.delete()
    
    return Response({'status': 'rejected'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unblock_user(request, username):
    blocked_user = get_object_or_404(Profile, username=username)
    blocker = request.user
    
    Block.objects.filter(blocker=blocker, blocked=blocked_user).delete()
    
    return Response({'status': 'unblocked'})