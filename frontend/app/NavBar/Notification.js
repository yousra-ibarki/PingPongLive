import React, { useEffect, useState } from "react";
import { useWebSocketContext } from "../Components/WebSocketContext";
import Axios from "../Components/axios";

const Notif = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notificationReadyState, notifications, markAsRead, markAllAsRead, loggedInUser } = useWebSocketContext();
  
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return timestamp;
    }
  };

  // Handle clicking a notification
  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    setIsMenuOpen(false);
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsMenuOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsMenuOpen(false)}
      onMouseEnter={() => setIsMenuOpen(true)}
    >
      <div className="relative">
        <img
          src="https://127.0.0.1:8001/bell.svg"
          alt="notification"
          className={`min-w-7 min-h-7 max-w-6 max-h-6 cursor-pointer ${
            isSmall ? "lg:hidden" : "hidden lg:block"
          }`}
        />
        {/* Show red dot only if there are unread notifications */}
        {notifications.some(notif => !notif.is_read) && (
          <div
            className={`absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full ${
              isSmall ? "lg:hidden" : "hidden lg:block"
            }`}
          />
        )}
      </div>

      {isMenuOpen && (
        <div
          className={`scroll absolute h-auto max-h-96 overflow-y-auto scrollbar scrollbar-thumb-current scrollbar-track scrollbar-w-2 -left-80 z-50 w-96 rounded-md p-1 ${
            isSmall ? "lg:hidden" : "hidden lg:block"
          }`}
          style={{ backgroundColor: "#393E46" }}
        >
          {/* Header with Mark All as Read button */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-600">
            <h3 className="text-white font-semibold">Notifications</h3>
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-[#FFD369] hover:text-[#FFD369]/80"
            >
              Mark all as read
            </button>
          </div>

          {/* Notifications list */}
          <ul className="divide-y divide-gray-600">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <li
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 cursor-pointer hover:bg-[#222831] transition-colors ${
                    !notif.is_read ? 'bg-[#222831]/50' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <p className="text-[#FFD369] text-sm font-medium">
                      {notif.sender}
                    </p>
                    <p className="text-white text-sm">{notif.message}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatTimestamp(notif.created_at)}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-center text-gray-400">
                No notifications
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notif;
