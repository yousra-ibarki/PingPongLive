    # path('api/friends/send_friend_request/<int:id>/', SendFriendRequestView.as_view(), name='send_friend_request'),


class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        """
        Send a friend request to another user
        """
        user = request.user
        try:
            other_user = User.objects.get(id=id)
            
            # Add debug logging
            print(f"Sending friend request from {user.username} to {other_user.username}")
            
            friendship = Friendship.objects.create(from_user=user, to_user=other_user)
            
            # Add more debug logging
            print(f"Created friendship with ID: {friendship.id}")
            
            channel_layer = get_channel_layer()
            notification_group = f"notifications_{other_user.username}"
            
            print(f"Sending notification to group: {notification_group}")
            
            notification_data = {
                "type": "notify_friend_request",
                "from_user": user.username,
                "notification_id": str(friendship.id),
                "timestamp": timezone.now().isoformat()
            }
            
            print(f"Notification data: {notification_data}")
            
            async_to_sync(channel_layer.group_send)(
                notification_group,
                notification_data
            )
            
            print("Notification sent successfully")
            
            return Response({"message": "Friend request sent successfully."}, status=200)
            
        except Exception as e:
            print(f"Error sending friend request: {str(e)}")
            return Response({"error": str(e)}, status=400)