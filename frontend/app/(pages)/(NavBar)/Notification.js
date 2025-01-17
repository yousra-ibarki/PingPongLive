import React, { useEffect, useState, useCallback } from "react";
import { useWebSocketContext } from "../Components/WebSocketContext";
import { Bell } from "lucide-react";
import Axios from "../Components/axios";
import toast from "react-hot-toast";

const NotificationComponent = ({ isSmall = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    notificationReadyState 
  } = useWebSocketContext();

  // Sync notifications with local state and sort them
  useEffect(() => {
    if (notifications) {
      const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setLocalNotifications(sortedNotifications);
    }
  }, [notifications]);

  // Format timestamp with proper error handling
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      // If less than 24 hours ago, show relative time
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        if (hours < 1) {
          const minutes = Math.floor(diff / (60 * 1000));
          return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      }
      
      // Otherwise show date
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      toast.error("Error formatting timestamp");
      return "Invalid date";
    }
  }, []);

  // Handle notification click with optimistic update
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.notification_id && !notification.id) {
        toast.error("Invalid notification ID");
        return;
      }
      
      // Use notification_id if available, fallback to id
      const notificationId = notification.notification_id || notification.id;
      
      // Optimistically update local state
      setLocalNotifications(prev => 
        prev.map(n => {
          const currentId = n.notification_id || n.id;
          return currentId === notificationId ? { ...n, is_read: true } : n;
        })
      );
      // console.log("notificationId", notificationId);
      await markAsRead(notificationId);
    } catch (error) {
      toast.error("Failed to mark as read : " + error);
      // Revert on error
      setLocalNotifications(prev => 
        prev.map(n => {
          const currentId = n.notification_id || n.id;
          return currentId === (notification.notification_id || notification.id) 
            ? { ...n, is_read: false } 
            : n;
        })
      );
    }
  };

  // Handle mark all as read with optimistic update
  const handleMarkAllAsRead = async () => {
    try {
      // Optimistically update local state
      setLocalNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      // first check if the notification is already read
      await markAllAsRead();
      setIsMenuOpen(false);
    } catch (error) {
      toast.error("Failed to mark all as read : " + error);
      // Revert on error - we'll let the WebSocket context handle the revert
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await Axios.post("/api/notifications/delete/");
      setLocalNotifications([]);
    } catch (error) {
      toast.error("Failed to delete notifications " + error);
    }
  };

  const unreadCount = localNotifications.filter(n => !n.is_read).length;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      {/* Notification Icon */}
      <div className="relative">
        <Bell 
          className={`w-6 h-6 cursor-pointer text-[#FFD369] neon-shadow transition-colors
            ${isSmall ? "lg:hidden" : "hidden lg:block"}`
          }
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <div className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75" />
            <div className="relative h-2 w-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>

      {/* Notification Dropdown */}
      {isMenuOpen && (
        <div className={`
          absolute h-auto max-h-96 overflow-y-auto -left-80 z-50 w-96 rounded-md shadow-lg
          ${isSmall ? "lg:hidden" : "hidden lg:block"}
          bg-[#393E46] border border-gray-700
        `}>
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-medium">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-[#FFD369] hover:text-[#FFD369]/80 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={deleteAllNotifications}
              className="text-sm text-[#FFD369] hover:text-[#ff0000] transition-colors"
            >
              Delete them all
            </button>
          </div>

          {/* Notification List */}
          <div className="divide-y divide-gray-700">
            {localNotifications.length > 0 ? (
              localNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    px-4 py-3 cursor-pointer hover:bg-[#222831]/80 transition-colors
                    ${!notification.is_read ? 'bg-[#222831]' : ''}
                  `}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#FFD369] text-sm font-medium">
                        {notification.sender}
                      </span>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-[#FFD369]" />
                      )}
                    </div>
                    <p className="text-white text-sm">
                      {notification.message}
                    </p>
                    <span className="text-gray-400 text-xs">
                      {formatTimestamp(notification.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;