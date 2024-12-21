const handleNotification = (data) => {
    console.log("handleNotification called with:", data);
  
    // For game responses and friend requests, create a notification ID if none exists
    let notificationId = data.notification_id;
    if (!notificationId) {
      if (data.type === 'game_response' || data.type === 'notify_friend_request') {
        notificationId = data.id;
      }
    }
  
    // Log and return if still no notification ID
    if (!notificationId) {
      console.error("Notification received without ID:", data);
      return;
    }
  
    setState(prev => ({
      ...prev,
      notifications: [{
        id: notificationId,
        notification_id: notificationId,
        type: data.type,
        message: data.message,
        created_at: data.timestamp,
        is_read: false,
        sender: data.from_user,
        // Additional fields for specific notification types
        ...(data.type === 'notify_friend_request' && { friend_request_id: data.friend_request_id }),
        ...(data.type === 'game_response' && { 
          accepted: data.accepted,
          room_name: data.room_name 
        })
      }, ...prev.notifications].slice(0, 50)
    }));
  
    // Handle specific notification types...
    if (data.type === 'notify_chat_message') {
      // Existing chat message handler...
    } else if (data.type === 'notify_game_request') {
      // Existing game request handler...
    } else if (data.type === 'notify_friend_request') {
      // Existing friend request handler...
    } else if (data.type === 'game_response') {
      // Add specific handler for game responses
      if (data.accepted) {
        toast.success(`${data.from_user} accepted your game request`, {
          duration: 2000,
        });
      } else {
        toast.error(`${data.from_user} declined your game request`, {
          duration: 2000,
        });
      }
    }
  };