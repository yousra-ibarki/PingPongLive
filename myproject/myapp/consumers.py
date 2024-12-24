from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from datetime import datetime
import json
from django.contrib.auth import get_user_model
import uuid
from myapp.models import Friendship, Notification
from django.utils import timezone


User = get_user_model()

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notifications.
    Handles game requests, chat messages, and friend requests.
    Each browser tab/window creates a new instance of this consumer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Used to track if user is in a specific room (e.g., game room)
        self.user_room = None

    async def connect(self):
        """
        Called when client establishes WebSocket connection.
        Steps:
        1. Verify user is authenticated
        2. Create notification group for user
        3. Add this connection to user's group
        4. Accept the connection
        """
        # Security check: Reject non-logged-in users
        if self.scope["user"].is_anonymous:
            print("Anonymous user connection rejected")
            await self.close()
            return

        # Store authenticated user and create their unique notification group name
        self.user = self.scope["user"]
        self.notification_group_name = f"notifications_{self.user.username}"
        
        # Add this connection to user's notification group
        # This allows sending notifications to all of user's open tabs/windows
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name  # Unique identifier for this connection
        )
        
        await self.accept()
        print(f"Connection accepted for user {self.user.username}")

    async def disconnect(self, close_code):
        """
        Called when WebSocket connection closes.
        Removes this connection from any groups it was part of.
        """
        if self.user_room:
            await self.channel_layer.group_discard(
                self.user_room,
                self.channel_name
            )
    
    @database_sync_to_async
    def get_user_by_id(self, user_id):
        """
        Async helper to fetch user from database.
        Converts synchronous database query to async operation.
        """
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
        
    @database_sync_to_async
    def update_user_last_active(self):
        self.scope["user"].last_active = timezone.now()
        self.scope["user"].save()
        
    async def receive_json(self, content):
        """
        Entry point for all incoming WebSocket messages.
        Routes different types of messages to their specific handlers.
        
        Message Types:
        - send_chat_notification: Direct chat messages
        - send_game_request: Game invitations
        - send_game_response: Accepting/declining game invites
        - send_friend_request: Friend requests
        handle_* functions are called based on the type field in the WebSocket message from the client
        """
        # self.scope["user"].last_active = timezone.now()
        # self.scope["user"].save()
        # print("HHHHHHH8", content)
        await self.update_user_last_active()
        message_type = content.get('type')
        
        handlers = {
            'send_chat_notification': self.handle_chat_notification,
            'send_game_request': self.handle_game_request,
            'send_game_response': self.handle_game_response,
            'send_friend_request': self.handle_friend_request,
        }
        
        handler = handlers.get(message_type)
        if handler:
            await handler(content)
        else:
            print(f"Unknown message type: {message_type}")

    async def handle_game_request(self, content):
        """
        Processes game request from sender (UserA) to recipient (UserB).
        
        Flow:
        1. Get recipient user from database
        2. Create unique room name for the game
        3. Send notification to recipient's group
        """
        to_user_id = content.get('to_user_id')
        to_user = await self.get_user_by_id(to_user_id)
        if not to_user:
            return
            
        # Create unique room name using sorted user IDs for consistency
        room_name = f"room_{min(self.user.id, to_user.id)}_{max(self.user.id, to_user.id)}"
        
        # Create notification in database
        notification = await database_sync_to_async(Notification.objects.create)(
            recipient=to_user,
            notification_type='notify_game_request',
            message=f"{self.user.username} invited you to play a game",
            sender=self.user
        )

        # Send to recipient's notification group
        await self.channel_layer.group_send(
            f"notifications_{to_user.username}",
            {
                "type": "notify_game_request",
                "from_user": self.user.username,
                "from_user_id": self.user.id,
                "notification_id": notification.id,  # Use the database-generated ID
                "timestamp": notification.created_at.isoformat(),
                "room_name": room_name,
                "to_user_id": self.user.id
            }
        )

    async def handle_chat_notification(self, content):
        """Handle chat notification messages"""
        to_user_id = content.get('to_user_id')
        message = content.get('message')
        
        to_user = await self.get_user_by_id(to_user_id)
        if not to_user:
            return
        

        # Create notification in database
        notification = await database_sync_to_async(Notification.objects.create)(
            recipient=to_user,
            notification_type='notify_chat_message',
            message=message,
            sender=self.user
        )
        
        notification_group = f"notifications_{to_user.username}"
        
        await self.channel_layer.group_send(
            notification_group,
            {
                "type": "notify_chat_message",
                "message": message,
                "from_user": self.user.username,
                "notification_id": notification.id,
                "timestamp": notification.created_at.isoformat()
            }
        )
        
        await self.accept()
        print(f"Connection accepted for user {self.user.username}")

    async def handle_game_response(self, content):
        """Handle game response messages"""
        to_user_id = content.get('to_user_id')
        accepted = content.get('accepted')
        
        to_user = await self.get_user_by_id(to_user_id)
        if not to_user:
            return
            
        room_name = f"room_{min(self.user.id, to_user.id)}_{max(self.user.id, to_user.id)}"
        notification_group = f"notifications_{to_user.username}"
        
        # Create notification in database
        message = f"{self.user.username} {'accepted' if accepted else 'declined'} your game request"
        notification = await database_sync_to_async(Notification.objects.create)(
            recipient=to_user,
            notification_type='game_response',
            message=message,
            sender=self.user
        )

        await self.channel_layer.group_send(
            notification_group,
            {
                "type": "notify_game_response",
                "from_user": self.user.username,
                "room_name": room_name,
                "accepted": accepted,
                "notification_id": notification.id,
                "timestamp": notification.created_at.isoformat(),
                "user_id": self.user.id
            }
        )

    async def handle_friend_request(self, content):
        """Handle friend request messages"""
        print("HHHHHHH7")
        to_user_id = content.get('to_user_id')
        
        to_user = await self.get_user_by_id(to_user_id)
        if not to_user:
            return
            
        notification_group = f"notifications_{to_user.username}"
        
        # Get the actual friendship ID
        friendship = await database_sync_to_async(Friendship.objects.create)(
            from_user=self.user,
            to_user=to_user
        )

        # Create notification in database
        notification = await database_sync_to_async(Notification.objects.create)(
            recipient=to_user,
            notification_type='notify_friend_request',
            message=f"{self.user.username} sent you a friend request",
            sender=self.user
        )

        await self.channel_layer.group_send(
            notification_group,
            {
                "type": "notify_friend_request",
                "from_user": self.user.username,
                "notification_id": notification.id,
                "friend_request_id": friendship.id,
                "timestamp": notification.created_at.isoformat()
            }
        )

    # 1. handle_* functions process incoming requests from sender
    # 2. notify_* functions deliver notifications to recipient(s)
    # 3. notify_* functions are called based on the type field in the group_send message
    # notify_* functions are called based on the type field in the group_send message

    async def notify_game_request(self, event):
        """
        Delivers game request to recipient (UserB).
        Runs on recipient's WebSocket connection(s).
        
        Formats the notification and sends it to the client's browser.
        """
        notification_data = {
            'type': 'notify_game_request',
            'message': f"{event['from_user']} invited you to play a game",
            'from_user': event['from_user'],
            'notification_id': event['notification_id'],
            'timestamp': event['timestamp'],
            'room_name': event['room_name'],
            'to_user_id': event['to_user_id']
        }
        
        # Send the notification to UserB's client
        await self.send_json(notification_data)

    async def notify_friend_request(self, event):
        """Handle friend request notifications"""
        await self.send_json({
            'type': 'notify_friend_request',
            'message': f"{event['from_user']} sent you a friend request",
            'from_user': event['from_user'],
            'notification_id': event['notification_id'],  # Changed from friend_request_id
            'friend_request_id': event['friend_request_id'],  # Keep this for processing the request
            'timestamp': event['timestamp']
        })


    async def notify_game_response(self, event):
        """Handle game response notifications"""
        if event['accepted']:
            message = f"{event['from_user']} accepted your game request"
        else:
            message = f"{event['from_user']} declined your game request"
        
        notification_data = {
            'type': 'game_response',
            'message': f"{event['from_user']} {'accepted' if event['accepted'] else 'declined'} your game request",
            'from_user': event['from_user'],
            'room_name': event['room_name'],
            'accepted': event['accepted'],
            'notification_id': event['notification_id'],
            'timestamp': event['timestamp'],
            'user_id': event['user_id']
            
        }

        await self.send_json(notification_data)

    async def notify_chat_message(self, event):
        """Handle chat message notifications"""
        print(f"Processing chat message notification: {event}")
        await self.send_json(event)

    async def notify_achievement(self, event):
        """Handle achievement notifications"""
        await self.send_json({
            'type': 'achievement',
            'message': f"Achievement Unlocked: {event['achievement']}",
            'achievement': event['achievement'],
            'description': event['description'],
            'timestamp': event['timestamp']
        })

