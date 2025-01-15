"use client";

import React, { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import { useWebSocketContext } from "../Components/WebSocketContext";

export default function Search({ isSmall, users }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [localUsers, setLocalUsers] = useState([]);
  const modalRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input element
  const router = useRouter();

  const { loggedInUser } = useWebSocketContext(); // Assuming socket is provided by context

  /**
   * Fetches the list of users from the API.
   */
  console.log("users: ", users);

  useEffect(() => {
    if (users) {
      setLocalUsers(users);
    } else {
      const fetchUsers = async () => {
        try {
          const response = await Axios.get("/api/users/");
          if (response.data.status === "success") {
            setLocalUsers(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [users]);

  /**
   * Filters the users based on the search query.
   */
  const filteredUsers = localUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handles user selection from the search results.
   * @param {object} user - The selected user object.
   */
  const onUserSelect = (user) => {
    setIsSearching(false);
    setSearchQuery("");
    if (user.id === loggedInUser.id) {
      return router.push("/profile");
    }
    router.push(`/user-profile/${user.id}`);
  };

  /**
   * Closes the search modal when clicking outside of it.
   * @param {MouseEvent} event - The mouse event.
   */
  const closeModal = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeModal);
    return () => {
      document.removeEventListener("mousedown", closeModal);
    };
  }, []);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus(); // Focus the input when the modal opens
    }
  }, [isSearching]);

  return (
    <div className={`relative ${isSmall ? "lg:hidden" : "hidden lg:block"}`}>
      {/* Search Icon */}
      <CiSearch
        className="w-8 h-8 cursor-pointer neon-shadow"
        onClick={() => setIsSearching(true)}
      />

      {/* Search Modal */}
      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div ref={modalRef} className="p-4 rounded-lg w-96 bg-white dark:bg-gray-800">
            {/* Search Input */}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD369] transition duration-300 ease-in-out"
            />

            {/* Search Results */}
            {searchQuery && (
              <ul className="max-h-52 bg-white dark:bg-gray-800 text-center overflow-y-auto scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 scrollbar-w-2 p-1 border-t border-[#FFD369]">
                {filteredUsers.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-gray-400">No users found</li>
                ) : (
                  filteredUsers.map((user) => (
                    <li
                      key={user.id}
                      className="px-4 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-gray-700 text-sm rounded-md flex items-center"
                      onClick={() => onUserSelect(user)}
                    >
                      <img
                        src={user.image || "./user_img.svg"}
                        alt="Profile"
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span>{user.username}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}