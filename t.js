const handleNotification = (data) => {
    // Ensure we have a notification ID
    const notificationId = data.notification_id || data.id;
    
    if (!notificationId) {
      toast.error("Invalid notification ID");
      return;
    }
  
    // If it's a chat notification and user is on chat page, mark it as read immediately
    if (data.type === "notify_chat_message" && window.location.pathname.includes("/chat")) {
      // Mark the notification as read
      Axios.post(`/api/notifications/${notificationId}/mark-read/`)
        .then(() => {
          // Update local state to mark notification as read
          setState((prev) => ({
            ...prev,
            notifications: prev.notifications.map((notif) => {
              return (notif.id === notificationId || notif.notification_id === notificationId)
                ? { ...notif, is_read: true }
                : notif;
            }),
          }));
        })
        .catch((error) => {
          console.error("Failed to mark chat notification as read:", error);
        });
      
      // Skip showing the notification toast
      return;
    }
  
    // Update notifications state
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          id: notificationId,
          notification_id: notificationId,
          type: data.type,
          message: data.message,
          created_at: data.timestamp,
          is_read: data.type === "notify_chat_message" && window.location.pathname.includes("/chat"),
          sender: data.from_user,
          // Additional fields for game responses
          ...(data.type === "game_response" && {
            accepted: data.accepted,
            room_name: data.room_name,
          }),
        },
        ...prev.notifications,
      ].slice(0, 50),
    }));
  
    // Handle game response redirection
    if (data.type === "game_response" && data.accepted) {
      window.location.assign(`../game?room_name=${data.room_name}&mapNum=${state.mapNbr}`);
    }
  
    // Display notification toast (except for chat messages when on chat page)
    const notification = handleNotificationDisplay(data, handleGameResponse);
    if (notification) {
      toast.custom(notification.content, notification.options);
    }
  };