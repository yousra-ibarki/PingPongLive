// Create this file in your Components folder as NotificationComponents.js
import React from 'react';

// Helper function for timestamp formatting
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    return timestamp.replace("T", " ").split(".")[0];
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return timestamp;
  }
};

// Shared styles for all toasts
export const TOAST_STYLES = {
  background: "#ffffff",
  padding: "16px",
  borderRadius: "8px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

// Base wrapper for all notifications
const NotificationWrapper = ({ children }) => (
  <div className="flex items-start gap-3 bg-[#222831] p-4 rounded-lg min-w-[300px]">
    <div className="flex-1">{children}</div>
  </div>
);

// Chat Message Notification
export const ChatMessageToast = ({ data }) => (
  <NotificationWrapper>
    <p className="font-kreon text-white">Chat Message from</p>
    <p className="text-[#FFD369] font-medium">{data.from_user}</p>
    <p className="text-white">
      {data.message.length > 100 ? `${data.message.substring(0, 40)}...` : data.message}
    </p>
    <p className="text-sm text-gray-400 mt-2">
      {formatTimestamp(data.timestamp)}
    </p>
  </NotificationWrapper>
);

// Game Request Notification
export const GameRequestToast = ({ data, handleGameResponse }) => (
  <NotificationWrapper>
    <p className="font-kreon text-white">Game Request</p>
    <p className="text-white">{data.message}</p>
    <p className="text-sm text-gray-400 mt-2">
      {formatTimestamp(data.timestamp)}
    </p>
    <div className="flex gap-3 mt-3">
      <button
        onClick={() => handleGameResponse(data.notification_id, true, data)}
        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md 
                 hover:bg-green-600 transition-colors font-medium"
      >
        Accept
      </button>
      <button
        onClick={() => handleGameResponse(data.notification_id, false, data)}
        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md 
                 hover:bg-red-600 transition-colors font-medium"
      >
        Decline
      </button>
    </div>
  </NotificationWrapper>
);

// Friend Request Notification
export const FriendRequestToast = ({ data }) => (
  <NotificationWrapper>
    <p className="font-kreon text-white">Friend Request</p>
    <p className="text-white">{data.message}</p>
    <p className="text-sm text-gray-400 mt-2">
      {formatTimestamp(data.timestamp)}
    </p>
  </NotificationWrapper>
);

// Game Response Notification
export const GameResponseToast = ({ data }) => (
  <NotificationWrapper>
    <p className="font-kreon text-white">Game Response</p>
    <p className="text-[#FFD369] font-medium">{data.from_user}</p>
    <p className="text-white">
      {data.accepted ? "accepted" : "declined"} your game request
    </p>
    <p className="text-sm text-gray-400 mt-2">
      {formatTimestamp(data.timestamp)}
    </p>
    {data.accepted && (
      <div className="mt-3">
        <p className="px-4 py-2 bg-[#FFD369] text-[#222831] rounded-md 
                   hover:bg-[#FFD369]/90 transition-colors font-medium text-center">
          Joining Game...
        </p>
      </div>
    )}
  </NotificationWrapper>
);

// Main notification handler
export const handleNotificationDisplay = (data, handleGameResponse) => {
  let content;
  let duration;

  switch (data.type) {
    case "notify_chat_message":
      content = <ChatMessageToast data={data} />;
      duration = 4000;
      break;

    case "notify_game_request":
      content = <GameRequestToast data={data} handleGameResponse={handleGameResponse} />;
      duration = 30000;
      break;

    case "notify_friend_request":
      content = <FriendRequestToast data={data} />;
      duration = 20000;
      break;

    case "game_response":
      content = <GameResponseToast data={data} />;
      duration = 5000;
      break;

    default:
      return null;
  }

  return {
    content,
    options: {
      duration,
      style: TOAST_STYLES
    }
  };
};