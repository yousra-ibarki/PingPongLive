from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import async_to_sync
from datetime import datetime

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_room = None

    async def connect(self):
        try:
            user = self.scope["user"]
            if not user.is_authenticated:
                await self.close()
                return

            # Use the authenticated user's username for the room
            self.user_room = user.username

            # Add the client to their personal room
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
                message = content.get('message')
                print(f"Received chat message: {message}")
                print(f"Sender: {sender}")
                print(f"Receiver: {receiver}")
                # Send to receiver's room
                await self.channel_layer.group_send(
                    receiver,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'sender': sender,
                        'receiver': receiver,
                        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                    }
                )

                # Send confirmation back to sender
                await self.send_json({
                    'type': 'message_sent',
                    'message': message,
                    'receiver': receiver,
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                })
        except Exception as e:
            print(f"Error in receive_json: {str(e)}")

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send_json(event)