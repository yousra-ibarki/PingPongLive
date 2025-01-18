"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import toast, { Toaster } from "react-hot-toast";
import Axios from "../Components/axios";
import { config } from "../Components/config";
import { useRouter } from "next/navigation";
import { Task } from "../Components/task";
import { handleNotificationDisplay } from '../Components/NotificationComponents';


// Create a context to share WebSocket state across components
const WebSocketContext = createContext(null);

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
    mapNbr: 1,
  });
  const [loggedInUser, setLoggedInUser] = useState({});

  // Fetch user on mount
  useEffect(() => {
    const task = new Task(1);
    const fetchUser = async () => {
      try {
        const userResponse = await Axios.get("/api/user_profile/");
        
        setState((prev) => ({
          ...prev,
          currentUser: userResponse.data.username,
          isLoading: false,
        }));
        task.start();
        setLoggedInUser(userResponse.data);
      } catch (error) {
        toast.error("Failed to fetch user data");
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    fetchUser();
    return () => {
      task.stop();
    }
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (state.currentUser) {
        try {
          const response = await Axios.get("/api/notifications/");
          setState((prev) => ({
            ...prev,
            notifications: response.data,
          }));
        } catch (error) {
          toast.error("Failed to fetch notifications");
        }
      }
    };

    fetchNotifications();
  }, [state.currentUser]);

  // WebSocket URLs for chat
  const chatWsUrl = state.currentUser
    ? `${config.wsUrl}/chat/${state.currentUser}/`
    : null;

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
        if (data.sender === 'Tournament System') {
          toast.success(data.message, {
            duration: 4000,
         });
        }
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
    onError: (error) => toast.error("WebSocket Error: " + error.message),
  });

  const handleChatMessage = (data) => {
    if (data.type === "chat_message") {
      setState((prev) => {
        // For system messages, store them in the receiver's message list
        const messageKey = data.is_system_message ? data.receiver : data.sender;
        
        // Don't update unread counts for system messages
        if (data.sender === prev.activeChat) {
          // mark the message as read
          Axios.post(`/chat/mark_message_as_read/${data.sender}/`, {
            message_id: data.message_id,
          }).catch((error) => {
            toast.error("Failed to mark message as read");
          });
        }

        if (!data.is_system_message && (
          data.sender === prev.currentUser ||
          data.sender === prev.activeChat)
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
  
        // Create the new message object
        const newMessage = {
          id: data.message_id,
          content: data.message,
          timestamp: data.timestamp,
          isUser: data.sender === prev.currentUser,
          isRead: true,
          sender: data.sender,
          receiver: data.receiver,
          isSystemMessage: data.is_system_message || data.sender === 'Tournament System'
        };
  
        // Update messages state
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [messageKey]: [
              ...(prev.messages[messageKey] || []),
              newMessage
            ]
          },
          // Only update unread counts for non-system messages
          unreadCounts: data.is_system_message ? prev.unreadCounts : {
            ...prev.unreadCounts,
            [data.sender]: {
              count: (prev.unreadCounts[data.sender]?.count || 0) + 1,
              user_id: data.sender_id,
              last_message: {
                content: data.message,
                timestamp: data.timestamp,
              },
            },
          }
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

  // Set the users
  const setUsers = (users) => {
    setState((prev) => ({ ...prev, users }));
  };

  // Add this function to set active chat
  const setActiveChat = (username) => {
    setState((prev) => ({ ...prev, activeChat: username }));
  };


  const setMapNbr = (mapNum) => {
    setState ((prev) => ({ ...prev, mapNbr: mapNum}))
  };

  const notificationWsUrl = state.currentUser
    ? `${config.wsUrl}/notifications/`
    : null;

  // Notification WebSocket
  const {
    sendMessage: sendNotification, // Function to send notifications
    readyState: notificationReadyState, // Connection status
  } = useWebSocket(notificationWsUrl, {
    shouldReconnect: (closeEvent) => {
      return closeEvent.code !== 1000; // Reconnect if close wasn't clean (code 1000)
    },
    reconnectInterval: 3000,
    onOpen: () => {
      setState((prev) => ({ ...prev, connectionStatus: "Connected" }));
      sendNotification(JSON.stringify({ type: "get_notifications" }));
    },
    onMessage: (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        handleNotification(parsedData);
      } catch (error) {
        toast.error("Failed to parse notification data");
      }
    },
    onClose: () => {
      setState((prev) => ({ ...prev, connectionStatus: "Disconnected" }));
    },
    onError: (error) => {
      toast.error("WebSocket Error: " + error.message);
    },
  });


  // Handle responses to game requests
  const handleGameResponse = async (accepted, data) => {
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
        state.mapNbr = Math.floor(Math.random() * 6) + 1;
        window.location.assign(`../game?room_name=${data.room_name}&mapNum=${state.mapNbr}`);
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
      toast.error(error.response?.data?.error || "Failed to process game request");
    }
  };

  const handleNotification = (data) => {
    // Ensure we have a notification ID
    const notificationId = data.notification_id || data.id;
  
    if (!notificationId) {
      toast.error("Invalid notification ID");
      return;
    }

    // Skip chat notifications if user is on chat page
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
          is_read: false,
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
  
    // Display notification toast
    const notification = handleNotificationDisplay(data, handleGameResponse);
    if (notification) {
      toast.custom(notification.content, notification.options);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      toast.error("Invalid notification ID");
      return;
    }
    try {
      // check if the notification is already read
      const notification = state.notifications.find(
        (notif) => notif.id === notificationId
      );
      if (notification.is_read) {
        return;
      }
      await Axios.post(`/api/notifications/${notificationId}/mark-read/`);
      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notif) => {
          // Check both notification_id and id
          return notif.id === notificationId ||
            notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif;
        }),
      }));
    } catch (error) {
      toast.error("Failed to mark notification as read");
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      await Axios.post("/api/notifications/mark-all-read/");
      setState((prev) => {
        const updatedNotifications = prev.notifications.map((notif) => ({
          ...notif,
          is_read: true,
        }));
        return {
          ...prev,
          notifications: updatedNotifications,
        };
      });
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  // this function check if the user is blocked
  const checkBlockedUser = async (userId) => {
    try {
      const response = await Axios.get(`/api/friends/block_check/${userId}/`);
      return response.data.is_blocked;
    } catch (error) {
      toast.error("Failed to check if user is blocked");
      throw error;
    }
  }

  // function to send game request
  const sendGameRequest = async (userId) => {
    if (await checkBlockedUser(userId)) {
      toast.error("Cannot send game request to blocked user");
      return;
    }
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

  const sendFriendRequest = async (userId) => {
    try {
      sendNotification(JSON.stringify({
        type: 'send_friend_request',
        to_user_id: userId
      }));
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

  // Create the context value object with all necessary data and functions
  const contextValue = {
    ...state, // used in chat page
    setState, // used in chat page
    sendNotification, // used in chat page and profile page
    sendMessage, // used in chat page
    resetUnreadCount, // used in chat page
    setActiveChat, // set active chat used in chat page
    sendGameRequest, // used in profile page
    setLoggedInUser,
    markAsRead,
    setUser,
    setUsers,
    chatReadyState,
    notificationReadyState,
    sendFriendRequest, // used in profile page
    handleGameResponse,
    loggedInUser,
    markAllAsRead,
    isLoading: state.isLoading,
    setMapNbr
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
