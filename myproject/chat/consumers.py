from channels.generic.websocket import AsyncJsonWebsocketConsumer
from datetime import datetime
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from myapp.models import User

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_room = None

    @database_sync_to_async
    def get_or_create_room(self, sender_username, receiver_username):
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
            
            # Try to find existing room
            room = ChatRoom.objects.filter(participants=sender).filter(participants=receiver).first()
            
            if not room:
                # Create new room
                room = ChatRoom.objects.create(
                    name=f"Chat between {sender_username} and {receiver_username}"
                )
                room.participants.add(sender, receiver)
            
            return room
        except Exception as e:
            print(f"Error in get_or_create_room: {str(e)}")
            return None

    @database_sync_to_async
    def save_message(self, room, sender_username, content):
        try:
            sender = User.objects.get(username=sender_username)
            return Message.objects.create(
                room=room,
                sender=sender,
                content=content
            )
        except Exception as e:
            print(f"Error in save_message: {str(e)}")
            return None

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
            message_type = content.get('type')

            if message_type == 'chat_message':
                sender = content.get('sender')
                receiver = content.get('receiver')
                message = content.get('message')
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Get or create chat room
                room = await self.get_or_create_room(sender, receiver)
                if room:
                    # Save message to database
                    saved_message = await self.save_message(room, sender, message)
                    message_id = saved_message.id if saved_message else None

                    # Send to receiver's room
                    await self.channel_layer.group_send(
                        receiver,
                        {
                            'type': 'chat_message',
                            'message': message,
                            'sender': sender,
                            'receiver': receiver,
                            'timestamp': timestamp,
                            'message_id': message_id
                        }
                    )

                    # Send confirmation back to sender
                    await self.send_json({
                        'type': 'message_sent',
                        'message': message,
                        'receiver': receiver,
                        'timestamp': timestamp,
                        'message_id': message_id
                    })
                else:
                    # Handle room creation failure
                    await self.send_json({
                        'type': 'error',
                        'message': 'Failed to create or find chat room'
                    })

        except Exception as e:
            print(f"Error in receive_json: {str(e)}")
            # Send error message back to sender
            await self.send_json({
                'type': 'error',
                'message': 'Failed to process message',
                'error': str(e)
            })

    async def chat_message(self, event):
        await self.send_json(event)