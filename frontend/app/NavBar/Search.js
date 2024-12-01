import React, { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

export default function Search({ isSmall }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState([]);
  const modalRef = useRef(null);
  const router = useRouter();

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
    router.push(`/userProfile/${user.id}`);
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
        className="w-8 h-8 cursor-pointer"
        onClick={() => setIsSearching(true)}
      />

      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            ref={modalRef}
            className="p-4 rounded-lg w-96"
          >
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full px-4 py-2 text-sm border rounded-full focus:outline-none focus:border-[#FFD369] focus:ring-1 focus:ring-[#FFD369] transition duration-300 ease-in-out"
            />

            {searchQuery && (
              <ul
                className="max-h-52 scroll w-auto text-center overflow-y-auto scrollbar scrollbar-thumb-current scrollbar-track scrollbar-w-2 rounded-md p-1"
                style={{ backgroundColor: "#393E46" }}
              >
                {filteredUsers.map((user) => (
                  <li
                    key={user.id}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black flex items-center justify-between"
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
                    <span className={`h-2 w-2 rounded-full ${user.is_online ? 'bg-green-500' : 'bg-red-500'}`}></span>
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
