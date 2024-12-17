// Send chat notification
sendNotification({
    type: 'send_chat_notification',
    to_user_id: userId,
    message: 'Hello!'
});

// Send game request
sendNotification({
    type: 'send_game_request',
    to_user_id: userId
});

// Send game response
sendNotification({
    type: 'send_game_response',
    to_user_id: userId,
    accepted: true
});

// Send friend request
sendNotification({
    type: 'send_friend_request',
    to_user_id: userId
});


// Change in ChatApp.js
// Instead of calling API endpoint
const handleSendMessage = async (messageContent) => {
    if (!selectedUser) return;
    const res = await Axios.get(`/api/friends/friendship_status/${selectedUser.id}/`);
    
    // Remove this HTTP call
    // Axios.post(`/api/chat/notify_chat_message/${selectedUser.id}/`, {
    //   message: messageContent
    // });
    
    // Instead, send via WebSocket
    sendNotification(JSON.stringify({
      type: 'send_chat_notification',
      to_user_id: selectedUser.id,
      message: messageContent
    }));
  
    if (res.data.is_blocked) {
      toast.error('You are blocked by this user or you blocked this user');
      return;
    }
    sendMessage(messageContent, selectedUser.name);
  };



  // Change in userProfile.js
const sendGameRequest = async (userId) => {
    try {
      // Remove this API call
      // const response = await Axios.post(`/api/game/send_game_request/${userId}/`);
      
      // Instead, send via WebSocket
      sendNotification(JSON.stringify({
        type: 'send_game_request',
        to_user_id: userId
      }));
      
      toast.success('Game request sent!');
    } catch (error) {
      toast.error("Failed to send game request");
    }
  };




  // Change in WebSocketContext.js
const handleGameResponse = async (notificationId, accepted, data) => {
    toast.dismiss();
  
    try {
      if (accepted) {
        // Remove API call
        // sendGameResponse(data.to_user_id, accepted);
        
        // Instead, send via WebSocket
        sendNotification(JSON.stringify({
          type: 'send_game_response',
          to_user_id: data.to_user_id,
          accepted: true
        }));
        
        toast.success('Joining game...', {
          duration: 2000
        });
      } else {
        // Remove API call
        // sendGameResponse(data.to_user_id, accepted);
        
        // Instead, send via WebSocket
        sendNotification(JSON.stringify({
          type: 'send_game_response',
          to_user_id: data.to_user_id,
          accepted: false
        }));
        
        toast.success('Game request declined', {
          duration: 2000
        });
      }
    } catch (error) {
      toast.error('Failed to process game request');
      console.error('Error handling game request:', error);
    }
  };

  // Change in userProfile.js
const sendFriendRequest = async (userId) => {
    console.log('CURRENT USER ID', currentUserId);
    console.log('USER ID', userId);
    if (String(userId) === String(currentUserId)) {
      toast.error('Cannot send friend request to yourself');
      return;
    }
    
    if (FriendshipStatu.can_send_request === true) {
      try {
        // Remove API call
        // const response = await Axios.post(`/api/friends/send_friend_request/${userId}/`);
        
        // Instead, send via WebSocket
        sendNotification(JSON.stringify({
          type: 'send_friend_request',
          to_user_id: userId
        }));
        
        await friendshipStatus(userId);
        toast.success('Friend request sent successfully');
      } catch (err) {
        toast.error('Cannot send friend request');
      }
    } else {
      toast.error('Cannot send friend request');
    }
  };