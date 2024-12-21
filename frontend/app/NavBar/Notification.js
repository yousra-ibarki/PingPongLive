import React, { useEffect, useState } from "react";
import { useWebSocketContext } from "../Components/WebSocketContext";
import Axios from "../Components/axios";

const Notif = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const [notification, setNotification] = useState([]);
  // const [hasNewNotif, setHasNewNotif] = useState(false);
  const { notificationReadyState, notifications, markAsRead, markAllAsRead, loggedInUser } = useWebSocketContext();
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  console.log("loggedInUser . . . ", loggedInUser);
  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      if (loggedInUser.username) {
        const response = await Axios.get(`/api/notifications/unread/`);
        setUnreadNotifications(response.data);
      }
    };
    fetchUnreadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    setUnreadNotifications(prevNotifications => prevNotifications.filter(notif => notif.id !== notificationId));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setUnreadNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    handleMarkAsRead(notification.id);
    setIsMenuOpen(false);
  };

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsMenuOpen(false)}
      onMouseEnter={() => {
        setIsMenuOpen(true);
      }}
    >
      <div>
        <img
          src="https://127.0.0.1:8001/bell.svg"
          divlt="notification"
          className={`min-w-7 min-h-7 max-w-6 max-h-6  cursor-pointer  ${
            isSmall ? "lg:hidden " : " hidden lg:block"
          } `}
        />
        {unreadNotifications.length > 0 && (
          <div
            className={`absolute top-0 right-0 w-2 h-2 flex items-end bg-red-600 rounded-full ${
              isSmall ? "lg:hidden " : " hidden lg:block"
            }`}
          ></div>
        )}
      </div>
      {isMenuOpen && (
        <div
          className={`scroll absolute h-56 overflow-y-auto scrollbar scrollbar-thumb-current scrollbar-track scrollbar-w-2 -left-16 z-50 w-40 rounded-md p-1 ${
            isSmall ? "lg:hidden" : "hidden lg:block"
          }`}
          style={{ backgroundColor: "#393E46" }}
        >
          <ul className="">
            {notifications.map((notif, index) => (
              <li
                className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black "
                key={index}
              >
                {notif.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notif;
