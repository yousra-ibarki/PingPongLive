from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from datetime import datetime
import json

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_room = None

    async def connect(self):
        if self.scope["user"].is_anonymous:
            print("Anonymous user connection rejected")
            await self.close()
            return

        self.user = self.scope["user"]
        self.notification_group_name = f"notifications_{self.user.username}"
        
        print(f"User {self.user.username} connecting to group {self.notification_group_name}")
        
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"Connection accepted for user {self.user.username}")

    async def notify_friend_request(self, event):
        """Handle friend request notifications"""
        print(f"Processing friend request notification: {event}")
        
        notification_data = {
            'type': 'notification',
            'notification_type': 'friend_request',
            'message': f"{event['from_user']} sent you a friend request",
            'from_user': event['from_user'],
            'notification_id': event['notification_id'],
            'timestamp': event['timestamp']
        }
        
        print(f"Sending notification to client: {notification_data}")
        
        await self.send_json(notification_data)

    async def notify_game_request(self, event):
        """Handle game request notifications"""
        print(f"Processing game request notification: {event}")
        
        notification_data = {
            'type': 'notification',
            'notification_type': 'game_request',
            'message': f"{event['from_user']} invited you to play a game",
            'from_user': event['from_user'],
            'notification_id': event['notification_id'],
            'timestamp': event['timestamp'],
            'room_name': event['room_name'],
            'to_user_id': event['to_user_id']
        }
        
        print(f"Sending game request notification to client: {notification_data}")
        
        await self.send_json(notification_data)

    async def notify_game_response(self, event):
        """Handle game response notifications"""
        print(f"Processing game response notification: {event}")
        print(f"Sending game response notification to client  EE EE EEE : {event}")
        
        notification_data = {
            'type': 'notification',
            'notification_type': 'game_response',
            'message': f"{event['from_user']} accepted your game request",
            'from_user': event['from_user'],
            # 'notification_id': event['notification_id'],
            # 'timestamp': event['timestamp'],
            'room_name': event['room_name']
        }

        print(f"Sending game response notification to client: {notification_data}")

        await self.send_json(notification_data)

    async def disconnect(self, close_code):
        if self.user_room:
            await self.channel_layer.group_discard(
                self.user_room,
                self.channel_name
            )

    async def receive_json(self, content):
        pass

    async def notify_friend_request(self, event):
        """Handle friend request notifications"""
        await self.send_json({
            'type': 'notification',
            'notification_type': 'friend_request',
            'message': f"{event['from_user']} sent you a friend request",
            'from_user': event['from_user'],
            'notification_id': event['notification_id'],
            'timestamp': event['timestamp']
        })
