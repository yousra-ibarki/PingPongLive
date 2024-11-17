// WebSocketContext.js
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import toast, { Toaster } from 'react-hot-toast';
import { Bell, MessageSquare, GamepadIcon, Trophy, UserPlus } from "lucide-react";

const WebSocketContext = createContext(null);

const NOTIFICATION_TYPES = {
  CHAT_MESSAGE: 'chat_message',
  GAME_REQUEST: 'game_request',
  ACHIEVEMENT: 'achievement',
  INVITATION: 'invitation',
  SYSTEM: 'system'
};

const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.CHAT_MESSAGE]: {
    icon: MessageSquare,
    style: "bg-blue-50 border-blue-200",
    title: "New Message",
    duration: 5000
  },
  [NOTIFICATION_TYPES.GAME_REQUEST]: {
    icon: GamepadIcon,
    style: "bg-purple-50 border-purple-200",
    title: "Game Request",
    duration: 30000
  },
  [NOTIFICATION_TYPES.ACHIEVEMENT]: {
    icon: Trophy,
    style: "bg-yellow-50 border-yellow-200",
    title: "Achievement Unlocked!",
    duration: 5000
  },
  [NOTIFICATION_TYPES.INVITATION]: {
    icon: UserPlus,
    style: "bg-green-50 border-green-200",
    title: "New Invitation",
    duration: 5000
  },
  [NOTIFICATION_TYPES.SYSTEM]: {
    icon: Bell,
    style: "bg-gray-50 border-gray-200",
    title: "System Notification",
    duration: 5000
  }
};

export const WebSocketProvider = ({ children }) => {
  const [state, setState] = useState({
    notifications: [],
    messages: {},
    currentUser: null,
    connectionStatus: "Disconnected"
  });

  const notificationWsUrl = "ws://127.0.0.1:8000/ws/notifications/";
  const chatWsUrl = state.currentUser ? `ws://127.0.0.1:8000/ws/chat/${state.currentUser}/` : null;

  // Notification WebSocket
  const {
    sendMessage: sendNotification,
    lastMessage: lastNotificationMessage,
    readyState: notificationReadyState
  } = useWebSocket(notificationWsUrl, {
    shouldReconnect: true,
    reconnectInterval: 3000,
    onOpen: () => {
      setState(prev => ({ ...prev, connectionStatus: "Connected" }));
      sendNotification(JSON.stringify({ type: 'get_notifications' }));
    },
    onClose: () => setState(prev => ({ ...prev, connectionStatus: "Disconnected" }))
  });

  // Chat WebSocket
  const {
    sendJsonMessage: sendChatMessage,
    readyState: chatReadyState
  } = useWebSocket(chatWsUrl, {
    enabled: !!state.currentUser,
    shouldReconnect: true,
    reconnectInterval: 3000,
    onMessage: (event) => handleChatMessage(JSON.parse(event.data)),
    onError: (error) => console.error('Chat WebSocket error:', error)
  });

  // Message Handlers
  const handleChatMessage = (data) => {
    if (data.type === 'chat_message') {
        console.log('Chat message: = = = ', data); // Debug log
      setState(prev => ({
        ...prev,
        messages: {
          ...prev.messages,
          [data.sender]: [
            ...(prev.messages[data.sender] || []),
            {
              content: data.message,
              timestamp: data.timestamp,
              isUser: false
            }
          ]
        }
      }));
    }
  };

  const handleGameResponse = (notificationId, accepted) => {
    sendNotification(JSON.stringify({
      type: 'game_response',
      notification_id: notificationId,
      accepted
    }));
  };

  // Actions
  const sendMessage = (content, receiver) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    
    setState(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [receiver]: [
          ...(prev.messages[receiver] || []),
          { content, timestamp, isUser: true }
        ]
      }
    }));

    if (chatReadyState === ReadyState.OPEN) {
      sendChatMessage({
        type: 'chat_message',
        message: content,
        receiver,
        sender: state.currentUser
      });
    }
  };

  const markAsRead = (notificationId) => {
    sendNotification(JSON.stringify({
      type: 'mark_read',
      notification_id: notificationId
    }));
  };

  const setUser = (username) => {
    setState(prev => ({ ...prev, currentUser: username }));
  };

  // Notification Effects
  useEffect(() => {
    if (lastNotificationMessage) {
      try {
        const data = JSON.parse(lastNotificationMessage.data);
        handleNotification(data);
      } catch (error) {
        console.error("Failed to parse notification:", error);
        toast.error('Failed to process notification');
      }
    }
  }, [lastNotificationMessage]);

  const handleNotification = (data) => {
    const notificationHandlers = {
      connection_established: () => {
        toast.success('Connected to notification service!', {
          icon: '🔌',
          duration: 3000
        });
      },
      notification: () => {
        setState(prev => ({
          ...prev,
          notifications: [...prev.notifications, data]
        }));
        showNotificationToast(data);
      },
      notification_marked_read: () => {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.filter(n => n.notification_id !== data.notification_id)
        }));
        toast.success('Notification marked as read');
      },
      error: () => toast.error(data.message)
    };

    const handler = notificationHandlers[data.type];
    if (handler) handler();
  };

  const showNotificationToast = (data) => {
    const config = NOTIFICATION_CONFIG[data.notification_type];
    if (!config) return;

    const toastContent = (
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="font-medium">{config.title}</p>
          <p>{data.message}</p>
          <p className="text-sm text-gray-500 mt-1">{data.timestamp}</p>
          {data.notification_type === NOTIFICATION_TYPES.GAME_REQUEST && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleGameResponse(data.notification_id, true)}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleGameResponse(data.notification_id, false)}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Decline
              </button>
            </div>
          )}
        </div>
        {data.notification_id && data.notification_type !== NOTIFICATION_TYPES.GAME_REQUEST && (
          <button
            onClick={() => markAsRead(data.notification_id)}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            Mark as read
          </button>
        )}
      </div>
    );

    toast.custom(toastContent, {
      duration: config.duration,
      style: {
        background: '#ffffff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }
    });
  };

  const contextValue = {
    ...state,
    sendNotification,
    sendMessage,
    markAsRead,
    setUser,
    chatReadyState,
    notificationReadyState
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#333333'
          }
        }}
      />
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};