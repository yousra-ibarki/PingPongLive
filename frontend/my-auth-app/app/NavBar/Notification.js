import React, { useEffect, useState } from "react";

const Notif = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState([]);
  const [hasNewNotif, setHasNewNotif] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("wss://echo.websocket.org");

    socket.onmessage = (event) => {
      const newNotif = event.data;
      setNotification((prevNotification) => [...prevNotification, newNotif]);
      setHasNewNotif(true);
    };

    socket.onopen = () => {
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
        socket.send("hello from another world");
    }

    return () => {
      socket.close();
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseLeave={() => setIsMenuOpen(false)}
      onMouseEnter={() => {
        setIsMenuOpen(true);
        setHasNewNotif(false);
      }}
    >
      <div>
        <img
          src="./bell.svg"
          divlt="notification"
          className={`w-5 cursor-pointer ${
            isSmall ? "lg:hidden " : " hidden lg:block"
          } `}
        />
        {hasNewNotif && (
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
            {notification.map((notif, index) => (
              <li
                className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black "
                key={index}
              >
                {notif}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notif;




