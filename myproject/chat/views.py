from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import ChatRoom, Message
from .serializers import MessageSerializer
from myapp.models import User
from rest_framework.views import APIView
from myapp.CustomJWTAuthentication import CustomJWTAuthentication
from myapp.models import User, Friendship, Block
from django.db.models import Q

class UnreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        """
        Get unread message counts for all chat rooms the user is in
        """
        try:
            user = request.user
            unread_counts = {}

            # Get all chat rooms the user is a participant in
            chat_rooms = ChatRoom.objects.filter(participants=user)

            for room in chat_rooms:
                # Get the other participant in the room
                other_user = room.participants.exclude(id=user.id).first()
                if other_user:
                    # Count unread messages from the other user
                    unread_count = Message.objects.filter(
                        room=room,
                        sender=other_user,
                        is_read=False
                    ).count()
                    
                    # Always include all users, even with 0 unread messages
                    unread_counts[other_user.username] = {
                        'count': unread_count,
                        'user_id': other_user.id,
                        'last_message': self.get_last_message(room, other_user)
                    }
            print(unread_counts)
            return Response(unread_counts, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
    def get_last_message(self, room, sender):
        """
        Helper method to get the last message details
        """
        last_message = Message.objects.filter(
            room=room,
            sender=sender,
            is_read=False
        ).order_by('-timestamp').first()

        if last_message:
            return {
                'content': last_message.content[:50] + '...' if len(last_message.content) > 50 else last_message.content,
                'timestamp': last_message.timestamp
            }
        return None



class MarkMessagesAsRead(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, username):
        """
        Mark messages as read for a specific user
        """
        try:
            user = request.user

            if not username:
                return Response(
                    {'error': 'Username is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find the chat room
            room = ChatRoom.objects.filter(participants=user)\
                                 .filter(participants__username=username)\
                                 .first()

            if not room:
                return Response(
                    {'error': 'Chat room not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Mark all messages from the other user as read
            updated = Message.objects.filter(
                room=room,
                sender__username=username,
                is_read=False
            ).update(is_read=True)

            return Response({
                'message': f'Marked {updated} messages as read',
                'updated_count': updated
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UserMessagesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, username):
        try:
            # Get the other user
            other_user = get_object_or_404(User, username=username)
            
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