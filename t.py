from django.db.models import Q
from myapp.models import Friendship, Block, Profile

class ChatConsumer(AsyncJsonWebsocketConsumer):
    @database_sync_to_async
    def send_friend_request(self, sender_username, receiver_username):
        try:
            sender = Profile.objects.get(username=sender_username)
            receiver = Profile.objects.get(username=receiver_username)

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
            blocker = Profile.objects.get(username=blocker_username)
            blocked = Profile.objects.get(username=blocked_username)

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

    async def receive_json(self, content):
        message_type = content.get('type')

        if message_type == 'send_friend_request':
            sender = content.get('sender')
            receiver = content.get('receiver')
            success, message = await self.send_friend_request(sender, receiver)
            
            await self.send_json({
                'type': 'friend_request_result',
                'success': success,
                'message': message
            })

        elif message_type == 'block_user':
            blocker = content.get('blocker')
            blocked = content.get('blocked')
            success, message = await self.block_user(blocker, blocked)
            
            await self.send_json({
                'type': 'block_result',
                'success': success,
                'message': message
            })
        
        # ... existing code