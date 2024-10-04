import React, { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";

const users = [
  { name: "Ahmed", timestamp: "07:25", isOnline: true, hasNotification: false },
  {
    name: "Abdelfatah",
    timestamp: "09:21",
    isOnline: true,
    hasNotification: true,
  },
  {
    name: "Yousra",
    timestamp: "12:43",
    isOnline: false,
    hasNotification: true,
  },
  { name: "Ayoub", timestamp: "18:56", isOnline: true, hasNotification: false },
  {
    name: "Abdellah",
    timestamp: "14:07",
    isOnline: false,
    hasNotification: true,
    unreadMessages: 3,
  },
  { name: "Anas", timestamp: "8:26", isOnline: true, hasNotification: false },
  {
    name: "Ahmed1",
    timestamp: "07:25",
    isOnline: true,
    hasNotification: false,
  },
  {
    name: "Abdelfatah1",
    timestamp: "09:21",
    isOnline: true,
    hasNotification: true,
  },
  {
    name: "Yousra1",
    timestamp: "12:43",
    isOnline: false,
    hasNotification: true,
  },
  {
    name: "Ayoub1",
    timestamp: "18:56",
    isOnline: true,
    hasNotification: false,
  },
  {
    name: "Abdellah1",
    timestamp: "14:07",
    isOnline: false,
    hasNotification: true,
    unreadMessages: 13,
  },
  { name: "Anas1", timestamp: "8:26", isOnline: true, hasNotification: false },
];

export default function Search({ isSmall }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const modalRef = useRef(null);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // const [selectedUser, setSelectedUser] = useState(() => users[0]);
  const onUserSelect = (user) => {
    setIsSearching(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const closeModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", closeModal);
    return () => {
      document.removeEventListener("mousedown", closeModal);
    };
  }, []);

  return (
    <div className={`relative ${isSmall ? "lg:hidden" : "hidden lg:block"}`}>
      <CiSearch
        className="w-7 h-7 cursor-pointer"
        onClick={() => setIsSearching(true)}
      />

      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className=" p-4 rounded-lg w-96"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className=" w-full px-4 py-2 text-sm border rounded-full focus:outline-none focus:border-[#FFD369] focus:ring-1 focus:ring-[#FFD369] transition duration-300 ease-in-out"
            />

            {searchQuery && (
              <ul
                className=" max-h-52 scroll w-auto text-center overflow-y-auto scrollbar scrollbar-thumb-current scrollbar-track scrollbar-w-2 rounded-md p-1 "
                style={{ backgroundColor: "#393E46" }}
              >
                {filteredUsers.map((user) => (
                  <li
                    key={user.name}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black "
                    onClick={() => onUserSelect(user)}
                  >
                    {user.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
