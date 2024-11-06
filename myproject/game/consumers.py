# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# class GameConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         # Extract the username from the URL route
#         self.username = self.scope['url_route']['kwargs']['username']
#         print(self.username)
#         self.room_group_name = f"game_{self.username}"

#         # Join the room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         # Accept the WebSocket connection
#         await self.accept()

#         print(f"WebSocket connection established for user: {self.username}")

#     async def disconnect(self, close_code):
#         # Leave the room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#         print(f"WebSocket connection closed for user: {self.username}")

#     async def receive(self, text_data):
#         # Parse the incoming message
#         text_data_json = json.loads(text_data)
#         message = text_data_json.get('message', '')

#         # Broadcast the message to the group
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'game_message',  # You should define this method to handle the broadcast
#                 'message': message
#             }
#         )

#     # Define a method to handle the broadcasted message
#     async def game_message(self, event):
#         message = event['message']
        
#         # Send the message to WebSocket
#         await self.send(text_data=json.dumps({
#             'message': message
#         }))


from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import async_to_sync
from datetime import datetime

class GameConsumer(AsyncJsonWebsocketConsumer):
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
            if content.get('type') == 'game_message':
                sender = content.get('sender')
                receiver = content.get('receiver')
                message = content.get('message')
                print(f"Received game message: {message}")
                print(f"Sender: {sender}")
                print(f"Receiver: {receiver}")
                # Send to receiver's room
                await self.channel_layer.group_send(
                    receiver,
                    {
                        'type': 'game_message',
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

    async def game_message(self, event):
        # Send message to WebSocket
        await self.send_json(event)