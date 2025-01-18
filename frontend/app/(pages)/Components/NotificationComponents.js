import React from 'react';
import { useRouter } from "next/navigation";
import Axios from "./axios";
import { toast } from "react-hot-toast";

// Helper function for timestamp formatting
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  try {
    return timestamp.replace("T", " ").split(".")[0];
  } catch (error) {
    toast.error("Error formatting timestamp");
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
export const ChatMessageToast = ({ data }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/chat');
  };

  return (
    <NotificationWrapper  >
      <p className="font-kreon text-white"  >Chat Message from</p>
      <p className="text-[#FFD369] font-medium">{data.from_user}</p>
      <p className="text-white">
        {data.message.length > 100 ? `${data.message.substring(0, 40)}...` : data.message}
      </p>
      <p className="text-sm text-gray-400 mt-2">
        {formatTimestamp(data.timestamp)}
      </p>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-[#FFD369] text-[#222831] rounded-md 
                 hover:bg-[#FFD369]/90 transition-colors font-medium mt-3"
      >
        View Chat
      </button>
    </NotificationWrapper>
  );
};


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
        onClick={() => handleGameResponse(true, data)}
        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md 
                 hover:bg-green-600 transition-colors font-medium"
      >
        Accept
      </button>
      <button
        onClick={() => handleGameResponse(false, data)}
        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md 
                 hover:bg-red-600 transition-colors font-medium"
      >
        Decline
      </button>
    </div>
  </NotificationWrapper>
);

// Friend Request Notification
export const FriendRequestToast = ({ data }) => {

  const handleRequest = async (accepted) => {

    //remove toast
    toast.dismiss(data.id);

    // geting all friend requests
    const friendRequests = await Axios.get("/api/friends/friend_requests/");
    // check if the request id is in the list of friend requests
    if (!friendRequests.data.find((request) => request.id === data.friend_request_id)) {
      toast.error("Invalid friend request. the request does not exist, please refresh the page");
      return;
    }
    await Axios.post(`/api/friends/friend_requests/`, {
      request_id: data.friend_request_id,
      action: accepted,
    })
      .then((res) => {
          toast.success(res.data.message);
      })
      .catch((error) => {
        toast.error("An error occurred while processing your request"  || error.message);
      });
  }

  return (
    <NotificationWrapper>
      <p className="font-kreon text-white">Friend Request</p>
      <p className="text-white">{data.message}</p>
      <p className="text-sm text-gray-400 mt-2">
        {formatTimestamp(data.timestamp)}
      </p>
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => handleRequest('accept')}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md 
                   hover:bg-green-600 transition-colors font-medium"
        >
          Accept
        </button>
        <button

          onClick={() => handleRequest('reject')}  
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md 
                   hover:bg-red-600 transition-colors font-medium"
        >
          Decline
        </button>
      </div>
    </NotificationWrapper>
  );
};

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

// Achievement Notification
export const AchievementToast = ({ data }) => (
  <NotificationWrapper>
    <p className="font-kreon text-white">Achievement Unlocked</p>
    <p className="text-[#FFD369] font-medium">{data.achievement}</p>
    <p className="text-white">{data.message}</p>
    <p className="text-sm text-gray-400 mt-2">
      {formatTimestamp(data.timestamp)}
    </p>
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
      duration = 4000;
      break;

    case "notify_friend_request":
      content = <FriendRequestToast data={data} />;
      duration = 4000;
      break;

    case "game_response":
      content = <GameResponseToast data={data} />;
      duration = 2000;
      break;
    
      case "achievement":
      content = <AchievementToast data={data} />;
      duration = 3000;
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