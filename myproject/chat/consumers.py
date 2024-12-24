from channels.generic.websocket import AsyncJsonWebsocketConsumer
from datetime import datetime
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from myapp.models import User
from django.utils import timezone

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Store user's room name for their personal channel
        self.user_room = None

    @database_sync_to_async  # Decorator to make sync database operations async
    def get_or_create_room(self, sender_username, receiver_username):
        """
        Find or create a chat room between two users.
        Uses a double filter to ensure the room contains exactly these two participants.
        """
        try:
            # Get User objects for both participants
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)
            
            # Try to find an existing room with both participants
            # The double filter ensures both users are in the same room
            room = ChatRoom.objects.filter(participants=sender)\
                                 .filter(participants=receiver)\
                                 .first()
            
            if not room:
                # If no room exists, create a new one
                room = ChatRoom.objects.create(
                    name=f"Chat between {sender_username} and {receiver_username}"
                )
                # Add both users as participants
                room.participants.add(sender, receiver)
            
            return room
        except Exception as e:
            print(f"Error in get_or_create_room: {str(e)}")
            return None

    @database_sync_to_async
    def save_message(self, room, sender_username, content):
        """
        Save a new message to the database.
        Links the message to the chat room and sender.
        """
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
        """
        Handle new WebSocket connections.
        Each user is added to their personal channel group named after their username.
        """
        try:
            # Get user from the connection scope
            user = self.scope["user"]
            if not user.is_authenticated:
                # Reject connection if user isn't authenticated
                await self.close()
                return

            # Set up user's personal room (named after their username)
            self.user_room = user.username

            # Add user to their personal channel group
            await self.channel_layer.group_add(
                self.user_room,
                self.channel_name
            )
            
            # Accept the WebSocket connection
            await self.accept()
            print(f"User {self.user_room} connected!")
            
            # Send connection confirmation to user
            await self.send_json({
                "type": "connection_established",
                "message": f"Connected as {self.user_room}!",
            })
        except Exception as e:
            print(f"Error in connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        Remove user from their personal channel group.
        """
        if self.user_room:
            await self.channel_layer.group_discard(
                self.user_room,
                self.channel_name
            )
        print(f"Disconnected with code: {close_code}")

    @database_sync_to_async
    def update_user_last_active(self):
        self.scope["user"].last_active = timezone.now()
        self.scope["user"].save()

    async def receive_json(self, content):
        """
        Handle incoming WebSocket messages.
        Main logic for processing chat messages and routing them to recipients.
        """
        # self.scope["user"].last_active = timezone.now()
        # self.scope["user"].save()
        await self.update_user_last_active()
        try:
            message_type = content.get('type')

            if message_type == 'chat_message':
                # Extract message details
                sender = content.get('sender')
                receiver = content.get('receiver')
                message = content.get('message')
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Get or create chat room for these users
                room = await self.get_or_create_room(sender, receiver)
                if room:
                    # Save message to database
                    saved_message = await self.save_message(room, sender, message)
                    message_id = saved_message.id if saved_message else None

                    # Send message to receiver's personal channel
                    await self.channel_layer.group_send(
                        receiver,  # This is the receiver's personal room name
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
        """
        Handler for chat_message type events.
        Forwards the message to the WebSocket.
        """
        await self.send_json(event)