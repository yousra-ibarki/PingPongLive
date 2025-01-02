// At the top of your WebSocketContext.js, add this import:
import { handleNotificationDisplay } from '../Components/NotificationComponents';

// Then replace your handleNotification function with this:
const handleNotification = (data) => {
  console.log("handleNotification called with:", data);

  // Ensure we have a notification ID
  const notificationId = data.notification_id || data.id;

  if (!notificationId) {
    console.error("Notification received without ID:", data);
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
        is_read: false,
        sender: data.from_user,
        // Additional fields for specific notification types
        ...(data.type === "notify_friend_request" && {
          friend_request_id: data.friend_request_id,
        }),
        ...(data.type === "game_response" && {
          accepted: data.accepted,
          room_name: data.room_name,
        }),
      },
      ...prev.notifications,
    ].slice(0, 50),
  }));

  // Skip chat notifications if user is on chat page
  if (data.type === "notify_chat_message" && window.location.pathname.includes("/chat")) {
    return;
  }

  // Handle game response redirection
  if (data.type === "game_response" && data.accepted) {
    window.location.assign(`./../game?room_name=${data.room_name}`);
  }

  // Display notification toast
  const notification = handleNotificationDisplay(data, handleGameResponse);
  if (notification) {
    toast.custom(notification.content, notification.options);
  }
};