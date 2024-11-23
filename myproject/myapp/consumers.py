from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Create a group name for the user
        self.user = self.scope['user']
        self.group_name = f'user_{self.user.id}'

        # Join user group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave user group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        pass

    # Receive message from room group
    async def send_notification(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps(event))


class AchievementConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # User-specific channel group
        self.user_group = f"achievements_{self.scope['user'].id}"
        
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.user_group,
            self.channel_name
        )

    async def achievement_notification(self, event):
        # Send achievement to WebSocket
        await self.send(text_data=json.dumps({
            'achievement': event['achievement'],
            'description': event['description'],
        }))