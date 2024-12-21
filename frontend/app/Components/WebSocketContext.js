"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import toast, { Toaster } from "react-hot-toast";
import {
  Bell,
  MessageSquare,
  GamepadIcon,
  Trophy,
  UserPlus,
} from "lucide-react";
import Axios from "../Components/axios";
import { config } from "../Components/config";
import { useRouter } from "next/navigation";
import { useWebSocketContext as useGameWebSocket } from "../game/webSocket";

const formatTimestamp = (timestamp) => {
  // Check if timestamp exists and is valid
  if (!timestamp) return "";

  try {
    // Remove the microseconds and 'Z' and replace 'T' with space
    return timestamp.replace("T", " ").split(".")[0];
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return timestamp; // Return original timestamp if formatting fails
  }
};
// Create a context to share WebSocket state across components
const WebSocketContext = createContext(null);

// Define different types of notifications the app can handle
const NOTIFICATION_TYPES = {
  CHAT_MESSAGE: "notify_chat_message",
  GAME_REQUEST: "game_request",
  ACHIEVEMENT: "achievement",
  FRIEND_REQUEST: "friend_request",
  GAME_RESPONSE: "game_response",
};

// Configuration for how each notification type should be displayed
const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: {
    icon: MessageSquare,
    style: "bg-blue-50 border-blue-200",
    title: "New Message",
    duration: 4000,
  },
  [NOTIFICATION_TYPES.GAME_REQUEST]: {
    icon: GamepadIcon,
    style: "bg-purple-50 border-purple-200",
    title: "Game Request",
    duration: 30000,
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT]: {
    icon: Trophy,
    style: "bg-yellow-50 border-yellow-200",
    title: "Achievement Unlocked!",
    duration: 3000,
  },
  [NOTIFICATION_TYPES.FRIEND_REQUEST]: {
    icon: UserPlus,
    style: "bg-blue-50 border-blue-200",
    title: "Friend Request",
    duration: 20000,
  },
  [NOTIFICATION_TYPES.GAME_RESPONSE]: {
    icon: GamepadIcon,
    style: "bg-purple-50 border-purple-200",
    title: "Game Response",
    duration: 20000,
  },
};

// The main WebSocket Provider component that wraps the app
export const WebSocketProviderForChat = ({ children }) => {
  const router = useRouter();

  // Main state object containing all WebSocket-related data
  const [state, setState] = useState({
    notifications: [], // Array of active notifications
    messages: {}, // Object storing chat messages by user
    currentUser: null, // Currently logged in user
    connectionStatus: "Disconnected", // WebSocket connection status
    unreadCounts: {}, // Add unreadCounts to state
    activeChat: null, // Add this to track active chat
    isLoading: true, // Add loading state
  });
  const [loggedInUser, setLoggedInUser] = useState({});

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await Axios.get("/api/user_profile/");
        setState((prev) => ({
          ...prev,
          currentUser: userResponse.data.username,
          isLoading: false,
        }));
        setLoggedInUser(userResponse.data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (state.currentUser) {
        try {
          const response = await Axios.get('/api/notifications/unread/');
          console.log("Unread notifications: = ", response.data);
          setState(prev => ({
            ...prev,
            notifications: response.data
          }));
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };
  
    fetchNotifications();
  }, [state.currentUser]);

  // WebSocket URLs for notifications and chat
  const chatWsUrl = state.currentUser
    ? `${config.wsUrl}/chat/${state.currentUser}/`
    : null;
  console.log("Current User---", state.currentUser);

  // Set up chat WebSocket connection
  const {
    sendJsonMessage: sendChatMessage, // Function to send chat messages
    readyState: chatReadyState, // Chat connection status
  } = useWebSocket(chatWsUrl, {
    enabled: !!state.currentUser,
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000; // Reconnect if close wasn't clean (code 1000)
    },
    reconnectInterval: 3000,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        handleChatMessage(data);
      } else if (data.type === "message_sent") {
        // Update the sent message with the server-generated ID
        setState((prev) => ({
          ...prev,
          messages: {
            ...prev.messages,
            [data.receiver]: prev.messages[data.receiver].map((msg) =>
              msg.timestamp === data.timestamp && !msg.id
                ? { ...msg, id: data.message_id }
                : msg
            ),
          },
        }));
      }
    },
    onError: (error) => console.error("Chat WebSocket error:", error),
  });

  // Handle incoming chat messages
  const handleChatMessage = (data) => {
    if (data.type === "chat_message") {
      setState((prev) => {
        // If we're actively chatting with this user, send read receipt to backend
        if (data.sender === prev.activeChat) {
          // mark the message as read
          Axios.post(`/chat/mark_message_as_read/${data.sender}/`, {
            message_id: data.message_id,
          }).catch((error) => {
            console.error("Failed to mark message as read:", error);
          });
        }

        // Rest of the state update logic...
        // check if the message is from the current user or the active chat
        if (
          data.sender === prev.currentUser ||
          data.sender === prev.activeChat
        ) {
          return {
            ...prev,
            messages: {
              ...prev.messages,
              [data.sender]: [
                ...(prev.messages[data.sender] || []),
                {
                  id: data.message_id,
                  content: data.message,
                  timestamp: data.timestamp,
                  isUser: false,
                  isRead: true,
                  sender: data.sender,
                  receiver: data.receiver,
                },
              ],
            },
          };
        }

        // Handle messages for non-active chats...
        const newUnreadCounts = {
          ...prev.unreadCounts,
          [data.sender]: {
            count: (prev.unreadCounts[data.sender]?.count || 0) + 1,
            user_id: data.sender_id,
            last_message: {
              content: data.message,
              timestamp: data.timestamp,
            },
          },
        };

        return {
          ...prev,
          unreadCounts: newUnreadCounts,
          messages: {
            ...prev.messages,
            [data.sender]: [
              ...(prev.messages[data.sender] || []),
              {
                id: data.message_id,
                content: data.message,
                timestamp: data.timestamp,
                isUser: false,
                isRead: false,
                sender: data.sender,
                receiver: data.receiver,
              },
            ],
          },
        };
      });
    }
  };

  // Function to send a new chat message
  const sendMessage = (content, receiver, historicData = null) => {
    const timestamp =
      historicData?.timestamp ||
      new Date().toISOString().slice(0, 16).replace("T", " ");

    // If this is a historic message, just update the state
    if (historicData?.isHistoric) {
      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [receiver]: [
            ...(prev.messages[receiver] || []),
            {
              id: historicData.id,
              content,
              timestamp,
              isUser: historicData.sender === state.currentUser,
              isRead: historicData.isRead,
              sender: historicData.sender,
              receiver,
            },
          ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)), // Sort messages by timestamp
        },
      }));
      return;
    }

    // For new messages, send through WebSocket
    if (chatReadyState === ReadyState.OPEN) {
      sendChatMessage({
        type: "chat_message",
        message: content,
        receiver,
        sender: state.currentUser,
      });

      setState((prev) => ({
        ...prev,
        messages: {
          ...prev.messages,
          [receiver]: [
            ...(prev.messages[receiver] || []),
            {
              content,
              timestamp,
              isUser: true,
              sender: state.currentUser,
              receiver,
            },
          ],
        },
      }));
    }
  };

  // Set the current user
  const setUser = (username) => {
    setState((prev) => ({ ...prev, currentUser: username }));
  };

  // Add this function to set active chat
  const setActiveChat = (username) => {
    setState((prev) => ({ ...prev, activeChat: username }));
  };



  // Process different types of notifications !!!!!!!!!!!!!!!!!!!!


  const notificationWsUrl = state.currentUser
    ? `${config.wsUrl}/notifications/`
    : null;
  console.log("NOTIFICATION WS URL", notificationWsUrl);

  // Notification WebSocket
  const {
    sendMessage: sendNotification, // Function to send notifications
    // lastMessage: lastNotificationMessage, // Last received notification
    readyState: notificationReadyState, // Connection status
  } = useWebSocket(notificationWsUrl, {
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000; // Reconnect if close wasn't clean (code 1000)
    },
    reconnectInterval: 3000,
    onOpen: () => {
      console.log("WebSocket Connection Opened for notifications");
      console.log("Connected to:", notificationWsUrl);
      setState((prev) => ({ ...prev, connectionStatus: "Connected" }));
      sendNotification(JSON.stringify({ type: "get_notifications" }));
    },
    onMessage: (event) => {
      console.log(
        "Raw WebSocket message received in notifications:",
        event.data
      );
      try {
        const parsedData = JSON.parse(event.data);
        console.log("Parsed notification data:", parsedData);
        handleNotification(parsedData);
      } catch (error) {
        console.error("Failed to parse notification data:", error);
      }
    },
    onClose: () => {
      console.log("WebSocket Connection Closed for notifications");
      setState((prev) => ({ ...prev, connectionStatus: "Disconnected" }));
    },
    onError: (error) => {
      console.error("WebSocket Error:", error);
    },
  });

  // Handle responses to game requests
  const handleGameResponse = async (notificationId, accepted, data) => {
    // Dismiss any existing toast notifications
    toast.dismiss();

    try {
      if (accepted) {
        // inform the other player that he has accepted the game request
        sendNotification(
          JSON.stringify({
            type: "send_game_response",
            to_user_id: data.to_user_id,
            accepted: true,
          })
        );
        // router.push(`/game`);

        toast.success("Joining game...", {
          duration: 2000,
        });
        // router.push(`/game`);
      } else {
        // inform the other player that he has declined the game request
        sendNotification(
          JSON.stringify({
            type: "send_game_response",
            to_user_id: data.to_user_id,
            accepted: false,
          })
        );
        toast.success("Game request declined", {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error("Failed to process game request");
      console.error("Error handling game request:", error);
    }
  };

  const handleNotification = (data) => {
    console.log("handleNotification called with:", data);

    setState(prev => ({
      ...prev,
      notifications: [{
        id: data.notification_id,
        type: data.type,
        message: data.message,
        created_at: data.timestamp,
        is_read: false,
        sender: data.from_user
      }, ...prev.notifications].slice(0, 50) // Keep last 50 notifications
    }));

    // Add specific handler for chat messages
    if (data.type === "notify_chat_message") {
      // check if the user is in the chat page
      const isChatPage = window.location.pathname.includes("/chat");
      if (isChatPage) {
        return;
      }
      let message = data.message;
      // chck the message length
      if (message.length > 100) {
        message = message.substring(0, 40) + "...";
      }
      const toastContent = (
        <div className="flex items-start gap-3 bg-[#222831]">
          <div className="flex-1">
            <p className="font-kreon text-white">Chat Message from</p>
            <p className="text-[#FFD369]">{data.from_user}</p>
            <p className="text-white">{message}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTimestamp(data.timestamp)}
            </p>
          </div>
        </div>
      );

      toast.custom(toastContent, {
        duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.CHAT_MESSAGE].duration,
        style: {
          background: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });
      return;
    }else if (data.type === "notify_game_request") {
      const toastContent = (
        <div className="flex items-start gap-3 bg-[#222831]">
          <div className="flex-1">
            <p className="font-kreon">Game Request</p>
            <p>{data.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTimestamp(data.timestamp)}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleGameResponse(data.notification_id, true, data)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleGameResponse(data.notification_id, false, data)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      );

      toast.custom(toastContent, {
        duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.GAME_REQUEST].duration,
        style: {
          background: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });
      return;
    }else if (data.type === "notify_friend_request") {
      const toastContent = (
        <div className="flex items-start gap-3 bg-[#222831]">
          <div className="flex-1">
            <p className="font-kreon">Friend Request</p>
            <p>{data.message}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTimestamp(data.timestamp)}
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleFriendRequest(data, true)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleFriendRequest(data, false)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      );

      toast.custom(toastContent, {
        duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.FRIEND_REQUEST].duration,
        style: {
          background: "#ffffff",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        },
      });
      return;
    }

    // Handle other notification types
    const config = NOTIFICATION_CONFIG[data.type];
    if (config) {
      showNotificationToast(data);
    } else {
      console.log("No handler found for notification type:", data.type);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await Axios.post(`/api/notifications/${notificationId}/mark-read/`);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Axios.post('/api/notifications/mark-all-read/');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Display notification as a toast message
  const showNotificationToast = (data) => {
    const config = NOTIFICATION_CONFIG[data.type];

    if (data.accepted === true) {
      toast.success("Joining game...", {
        duration: 2000,
      });
      // router.push(`/game`);
    }
    if (!config) return;

    const toastContent = (
      <div className="flex items-start gap-3">
        <div className="flex-1 bg-[#222831]">
          <p className="font-kreon">{config.title}</p>
          <p>{data.message}</p>
          <p className="text-sm text-gray-500 mt-1">{data.timestamp}</p>
          {data.type === NOTIFICATION_TYPES.GAME_REQUEST && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  handleGameResponse(data.notification_id, true, data)
                }
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() =>
                  handleGameResponse(data.notification_id, false, data)
                }
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          )}
        </div>
        {data.notification_id &&
          data.type !== NOTIFICATION_TYPES.GAME_REQUEST && (
            <button
              onClick={() => markAsRead(data.notification_id)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Mark as read
            </button>
          )}
      </div>
    );

    // Show the toast notification
    toast.custom(toastContent, {
      duration: 1000,
      style: {
        background: "#222831",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
    });
  };

  // Add function to handle friend request responses
  const handleFriendRequest = async (data, accepted) => {
    try {
      // Dismiss the current toast notification

      toast.dismiss();
      await Axios.post("/api/friends/friend_requests/", {
        friend_request_id: data.friend_request_id,
        action: accepted ? "accept" : "reject",
      });
      // Show a brief success message
      toast.success(
        accepted ? "Friend request accepted!" : "Friend request declined",
        {
          duration: 2000, // Toast will disappear after 2 seconds
        }
      );
    } catch (error) {
      toast.error("Failed to process friend request");
      console.error("Error handling friend request:", error);
    }
  };

  // function to send game request
  const sendGameRequest = async (userId) => {
    try {
      sendNotification(
        JSON.stringify({
          type: "send_game_request",
          to_user_id: userId,
        })
      );
      toast.success("Game request sent!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send game request");
    }
  };

  // end of the notification code !!!!!!!!!!!!!!!!!!!!

  const sendFriendRequest = async (userId) => {
    try {
      const response = await Axios.post(`/api/friends/send_request/${userId}/`);
      // Handle success
    } catch (error) {
      if (Axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          // Handle blocked user error
          toast.error(
            error.response.data.error || "Cannot send friend request"
          );
        }
      }
    }
  };

  const blockUser = (userToBlock) => {
    if (chatReadyState === ReadyState.OPEN) {
      sendChatMessage({
        type: "block_user",
        blocker: state.currentUser,
        blocked: userToBlock,
      });
    }
  };

  // Add function to reset unread count
  const resetUnreadCount = (username) => {
    setState((prev) => ({
      ...prev,
      unreadCounts: {
        ...prev.unreadCounts,
        [username]: {
          ...prev.unreadCounts[username],
          count: 0,
        },
      },
    }));
  };

  const sendGameResponse = async (userId, accepted) => {
    const response = await Axios.post(`/api/game/response/${userId}/`, {
      accepted: accepted,
    });
    toast.success("Game response sent!");
  };


  // Create the context value object with all necessary data and functions
  const contextValue = {
    ...state, // used in chat page
    setState, // used in chat page
    sendNotification, // used in chat page and profile page
    sendMessage, // used in chat page
    resetUnreadCount, // used in chat page
    setActiveChat, // set active chat used in chat page
    sendGameRequest, // used in profile page
    markAsRead, 
    setUser,
    chatReadyState,
    notificationReadyState,
    sendFriendRequest,
    blockUser,
    handleGameResponse,
    loggedInUser,
  };

  // If still loading, you might want to show nothing or a loading indicator
  if (state.isLoading) {
    return null; // or return a loading spinner
  }

  // Provide the context to child components
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#333333",
          },
        }}
      />
    </WebSocketContext.Provider>
  );
};

// Custom hook to use the WebSocket context
export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  // Throw error if context is used outside of provider
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProviderForChat"
    );
  }
  return context;
};
