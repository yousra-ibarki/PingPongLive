async def handle_game_response(self, content):
    """Handle game response messages"""
    to_user_id = content.get('to_user_id')
    accepted = content.get('accepted')
    
    to_user = await self.get_user_by_id(to_user_id)
    if not to_user:
        return
            
    room_name = f"room_{min(self.user.id, to_user.id)}_{max(self.user.id, to_user.id)}"
    notification_group = f"notifications_{to_user.username}"
    
    # Create notification in database
    message = f"{self.user.username} {'accepted' if accepted else 'declined'} your game request"
    notification = await database_sync_to_async(Notification.objects.create)(
        recipient=to_user,
        notification_type='game_response',
        message=message,
        sender=self.user
    )
    
    await self.channel_layer.group_send(
        notification_group,
        {
            "type": "notify_game_response",
            "from_user": self.user.username,
            "room_name": room_name,
            "accepted": accepted,
            "notification_id": notification.id,
            "timestamp": notification.created_at.isoformat()
        }
    )

async def notify_friend_request(self, event):
    """Handle friend request notifications"""
    await self.send_json({
        'type': 'notify_friend_request',
        'message': f"{event['from_user']} sent you a friend request",
        'from_user': event['from_user'],
        'notification_id': event['notification_id'],  # Changed from friend_request_id
        'friend_request_id': event['friend_request_id'],  # Keep this for processing the request
        'timestamp': event['timestamp']
    })

async def notify_game_response(self, event):
    """Handle game response notifications"""
    notification_data = {
        'type': 'game_response',
        'message': f"{event['from_user']} {'accepted' if event['accepted'] else 'declined'} your game request",
        'from_user': event['from_user'],
        'room_name': event['room_name'],
        'accepted': event['accepted'],
        'notification_id': event['notification_id'],
        'timestamp': event['timestamp']
    }
    
    await self.send_json(notification_data)