from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import async_to_sync
from datetime import datetime
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from myapp.models import Friendship, Block, User
from django.db.models import Q

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_room = None

    @database_sync_to_async
    def check_friendship_and_blocks(self, sender_username, receiver_username):
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)

            # Check if sender is blocked by receiver
            if Block.objects.filter(blocker=receiver, blocked=sender).exists():
                return False, "You are blocked by this user"

            # Check if sender has blocked receiver
            if Block.objects.filter(blocker=sender, blocked=receiver).exists():
                return False, "You have blocked this user"

            # Check friendship status
            friendship = Friendship.objects.filter(
                (Q(from_user=sender, to_user=receiver) | Q(from_user=receiver, to_user=sender)),
                status='accepted'
            ).first()

            if not friendship:
                return False, "Not friends. Send a friend request first."

            return True, None
        except Exception as e:
            print(f"Error checking friendship: {str(e)}")
            return False, "An error occurred"

    @database_sync_to_async
    def send_friend_request(self, sender_username, receiver_username):
        try:
            sender = User.objects.get(username=sender_username)
            receiver = User.objects.get(username=receiver_username)

            # Check if a friendship already exists
            existing_friendship = Friendship.objects.filter(
                Q(from_user=sender, to_user=receiver) | 
                Q(from_user=receiver, to_user=sender)
            ).first()

            if existing_friendship:
                if existing_friendship.status == 'blocked':
                    return False, "Cannot send friend request. User is blocked."
                elif existing_friendship.status == 'accepted':
                    return False, "You are already friends"
                elif existing_friendship.status == 'pending':
                    return False, "Friend request already sent"

            # Create new friend request
            Friendship.objects.create(
                from_user=sender, 
                to_user=receiver, 
                status='pending'
            )
            return True, "Friend request sent"
        except Exception as e:
            print(f"Error sending friend request: {str(e)}")
            return False, "Failed to send friend request"

    @database_sync_to_async
    def block_user(self, blocker_username, blocked_username):
        try:
            blocker = User.objects.get(username=blocker_username)
            blocked = User.objects.get(username=blocked_username)

            # Remove any existing friendship
            Friendship.objects.filter(
                Q(from_user=blocker, to_user=blocked) | 
                Q(from_user=blocked, to_user=blocker)
            ).delete()

            # Create or update block
            Block.objects.create(blocker=blocker, blocked=blocked)
            return True, "User blocked successfully"
        except Exception as e:
            print(f"Error blocking user: {str(e)}")
            return False, "Failed to block user"

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

            if message_type == 'send_friend_request':
                sender = content.get('sender')
                receiver = content.get('receiver')
                success, message = await self.send_friend_request(sender, receiver)
                print("Received friend request8888")
                
                await self.send_json({
                    'type': 'friend_request_result',
                    'success': success,
                    'message': message
                })

            elif message_type == 'block_user':
                print("Received block request777777")
                blocker = content.get('blocker')
                blocked = content.get('blocked')
                success, message = await self.block_user(blocker, blocked)
                
                await self.send_json({
                    'type': 'block_result',
                    'success': success,
                    'message': message
                })
            elif message_type == 'chat_message':
                sender = content.get('sender')
                receiver = content.get('receiver')
                message = content.get('message')
                timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')

                # Check if users can interact
                # can_interact, interaction_message = await self.check_friendship_and_blocks(sender, receiver)
                
                # if not can_interact:
                #     await self.send_json({
                #         'type': 'error',
                #         'message': interaction_message
                #     })
                #     return

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