# from channels.generic.websocket import AsyncJsonWebsocketConsumer
# from asgiref.sync import async_to_sync
# from datetime import datetime

# class ChatConsumer(AsyncJsonWebsocketConsumer):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.user_room = None

#     async def connect(self):
#         try:
#             user = self.scope["user"]
#             if not user.is_authenticated:
#                 await self.close()
#                 return

#             # Use the authenticated user's username for the room
#             self.user_room = user.username

#             # Add the client to their personal room
#             await self.channel_layer.group_add(
#                 self.user_room,
#                 self.channel_name
#             )
            
#             await self.accept()
#             print(f"User {self.user_room} connected!")
            
#             await self.send_json({
#                 "type": "connection_established",
#                 "message": f"Connected as {self.user_room}!",
#             })
#         except Exception as e:
#             print(f"Error in connect: {str(e)}")
#             await self.close()

#     async def disconnect(self, close_code):
#         if self.user_room:
#             await self.channel_layer.group_discard(
#                 self.user_room,
#                 self.channel_name
#             )
#         print(f"Disconnected with code: {close_code}")

#     async def receive_json(self, content):
#         try:
#             if content.get('type') == 'chat_message':
#                 sender = content.get('sender')
#                 receiver = content.get('receiver')
#                 message = content.get('message')
#                 print(f"Received chat message: {message}")
#                 print(f"Sender: {sender}")
#                 print(f"Receiver: {receiver}")
#                 # Send to receiver's room
#                 await self.channel_layer.group_send(
#                     receiver,
#                     {
#                         'type': 'chat_message',
#                         'message': message,
#                         'sender': sender,
#                         'receiver': receiver,
#                         'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
#                     }
#                 )

#                 # Send confirmation back to sender
#                 await self.send_json({
#                     'type': 'message_sent',
#                     'message': message,
#                     'receiver': receiver,
#                     'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
#                 })
#         except Exception as e:
#             print(f"Error in receive_json: {str(e)}")




#     async def chat_message(self, event):
#         # Send message to WebSocket
#         await self.send_json(event)


from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import async_to_sync, sync_to_async
from datetime import datetime
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, Message  # Import your models

Profile = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_room = None

    @database_sync_to_async
    def get_or_create_chat_room(self, user1_username, user2_username):
        """Get or create a chat room between two users"""
        user1 = Profile.objects.get(username=user1_username)
        user2 = Profile.objects.get(username=user2_username)
        
        # Try to find existing room
        room = ChatRoom.objects.filter(participants=user1).filter(participants=user2).first()
        
        if not room:
            # Create new room if doesn't exist
            room = ChatRoom.objects.create(
                name=f"Chat between {user1_username} and {user2_username}"
            )
            room.participants.add(user1, user2)
        
        return room

    @database_sync_to_async
    def save_message(self, room, sender_username, content):
        """Save a message to the database"""
        sender = Profile.objects.get(username=sender_username)
        message = Message.objects.create(
            room=room,
            sender=sender,
            content=content
        )
        return message

    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return

            self.user_room = user.username

            await self.channel_layer.group_add(
                self.user_room,
                self.channel_name
            )
            
            await self.accept()
            print(f"User {self.user_room} connected!")
            
            await self.send_json({
                "type": "connection_established",
                "message": f"Connected as {self.user_room}!",
            })
        except Exception as e:
            print(f"Error in connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        if self.user_room:
            await self.channel_layer.group_discard(
                self.user_room,
                self.channel_name
            )
        print(f"Disconnected with code: {close_code}")

    async def receive_json(self, content):
        try:
            if content.get('type') == 'chat_message':
                sender = content.get('sender')
                receiver = content.get('receiver')
                message_content = content.get('message')
                
                # Get or create chat room
                chat_room = await self.get_or_create_chat_room(sender, receiver)
                
                # Save message to database
                message = await self.save_message(chat_room, sender, message_content)
                
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Send to receiver's room
                await self.channel_layer.group_send(
                    receiver,
                    {
                        'type': 'chat_message',
                        'message': message_content,
                        'sender': sender,
                        'receiver': receiver,
                        'timestamp': timestamp,
                        'message_id': message.id  # Include message ID from database
                    }
                )

                # Send confirmation back to sender
                await self.send_json({
                    'type': 'message_sent',
                    'message': message_content,
                    'receiver': receiver,
                    'timestamp': timestamp,
                    'message_id': message.id
                })

        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            # Send error message back to sender
            await self.send_json({
                'type': 'error',
                'message': 'Failed to send message',
                'error': str(e)
            })

    async def chat_message(self, event):
        await self.send_json(event)

    @database_sync_to_async
    def mark_messages_as_read(self, room, user):
        """Mark all messages in the room as read for the user"""
        Message.objects.filter(
            room=room,
            is_read=False
        ).exclude(
            sender__username=user.username
        ).update(is_read=True)