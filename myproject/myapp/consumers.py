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
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return

            # Create a unique room for user notifications
            self.user_room = f"notifications_{user.username}"

            # Add the client to their personal notification room
            await self.channel_layer.group_add(
                self.user_room,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send_json({
                "type": "connection_established",
                "message": "Connected to notification service!",
            })

            # Send any pending notifications
            await self.send_pending_notifications(user)

        except Exception as e:
            print(f"Error in notification connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if self.user_room:
            await self.channel_layer.group_discard(
                self.user_room,
                self.channel_name
            )

    async def receive_json(self, content):
        try:
            message_type = content.get('type')
            
            if message_type == 'mark_read':
                await self.mark_notification_as_read(content.get('notification_id'))
            
            elif message_type == 'game_action':
                await self.handle_game_action(
                    content.get('notification_id'),
                    content.get('action')
                )
            
            elif message_type == 'invitation_action':
                await self.handle_invitation_action(
                    content.get('notification_id'),
                    content.get('action')
                )
            
            elif message_type == 'get_notifications':
                await self.send_pending_notifications(self.scope["user"])

        except Exception as e:
            print(f"Error in notification receive_json: {str(e)}")
            await self.send_json({
                'type': 'error',
                'message': 'Failed to process notification action'
            })

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        try:
            # Add your database logic here
            # notification = Notification.objects.get(id=notification_id)
            # notification.mark_as_read()
            
            return True
        except Exception as e:
            print(f"Error marking notification as read: {str(e)}")
            return False

    @database_sync_to_async
    def handle_game_action(self, notification_id, action):
        try:
            # Add your game logic here
            # game_request = GameRequest.objects.get(notification__id=notification_id)
            if action == 'accept':
                # Handle game acceptance
                pass
            elif action == 'decline':
                # Handle game decline
                pass
            
            return True
        except Exception as e:
            print(f"Error handling game action: {str(e)}")
            return False

    @database_sync_to_async
    def handle_invitation_action(self, notification_id, action):
        try:
            # Add your invitation logic here
            # invitation = Invitation.objects.get(notification__id=notification_id)
            if action == 'accept':
                # Handle invitation acceptance
                pass
            elif action == 'decline':
                # Handle invitation decline
                pass
            
            return True
        except Exception as e:
            print(f"Error handling invitation action: {str(e)}")
            return False

    @database_sync_to_async
    def get_pending_notifications(self, user):
        # Add your database query logic here
        # return Notification.objects.filter(user=user, read=False)
        pass

    async def send_pending_notifications(self, user):
        try:
            notifications = await self.get_pending_notifications(user)
            
            if notifications:
                for notification in notifications:
                    await self.send_json({
                        'type': 'notification',
                        'notification_id': notification.id,
                        'message': notification.message,
                        'notification_type': notification.type,
                        'data': notification.data,
                        'timestamp': notification.created_at.strftime('%Y-%m-%d %H:%M')
                    })
        except Exception as e:
            print(f"Error sending pending notifications: {str(e)}")

    @classmethod
    async def broadcast_notification(cls, user_username, notification_data):
        """
        Class method to broadcast a notification to a specific user
        Usage examples:
        
        # For chat message:
        await NotificationConsumer.broadcast_notification(
            username,
            {
                "notification_type": "chat_message",
                "message": "New message from user",
                "data": {"chat_id": chat_id, "sender": sender_username}
            }
        )
        
        # For game request:
        await NotificationConsumer.broadcast_notification(
            username,
            {
                "notification_type": "game_request",
                "message": "User wants to play with you",
                "
                data": {"game_id": game_id, "sender": sender_username}
            }
        )
        """
        channel_layer = cls.channel_layer
        user_room = f"notifications_{user_username}"
        
        await channel_layer.group_send(
            user_room,
            {
                "type": "send.notification",
                "notification_data": notification_data
            }
        )