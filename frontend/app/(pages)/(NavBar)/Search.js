import React, { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import { useWebSocketContext } from "../Components/WebSocketContext";

export default function Search({ isSmall }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const modalRef = useRef(null);
  const inputRef = useRef(null); // Create a reference for the input element
  const router = useRouter();

  const { loggedInUser } = useWebSocketContext();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Axios.get('/api/users/');
        if (response.data.status === 'success') {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onUserSelect = (user) => {
    setIsSearching(false);
    setSearchQuery("");
    if (user.id === loggedInUser.id) {
      return router.push("/profile");
    }
    router.push(`/user-profile/${user.id}`);
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

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus(); // Focus the input element when the search modal is opened
    }
  }, [isSearching]);

  return (
    <div className={`relative ${isSmall ? "lg:hidden" : "hidden lg:block"}`}>
      <CiSearch
        className="w-8 h-8 cursor-pointer neon-shadow"
        onClick={() => setIsSearching(true)}
      />

      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="p-4 rounded-lg w-96"
          >
            <input
              ref={inputRef} // Attach the reference to the input element
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full px-4 py-2 text-sm border focus:outline-none focus:border-0 focus:ring-1 focus:ring-[#FFD369] transition duration-300 ease-in-out"
            />

            {searchQuery && (
              <ul
                className="max-h-52 bg-cover bg-customGray scroll w-auto text-center overflow-y-auto scrollbar scrollbar-thumb-current scrollbar-track scrollbar-w-2 p-1 border-t-0 border border-[#FFD369] "
              >
                {filteredUsers.length === 0 && (
                  <li className="px-4 py-2 text-sm text-gray-400">No users found</li>
                )}
                {filteredUsers.map((user) => (
                  // if there are no users, display a message
                  <li
                    key={user.id}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black flex items-center justify-between shadow-sm shadow-gray-700"
                    onClick={() => onUserSelect(user)}
                  >
                    <div className="flex items-center">
                      <img 
                        src={user.image || "./user_img.svg"} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{user.username}</span>
                    </div>
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