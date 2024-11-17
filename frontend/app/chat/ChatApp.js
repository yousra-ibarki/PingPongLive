"use client";

import React, { useState, useEffect } from "react";
import UserList from "../Components/UsersList";
import Chat from "../Components/UserChat";
import ChatHeader from "../Components/chatHeader";
import Input from "../Components/Input";
import Axios from "../Components/axios";
import { useWebSocketContext } from "../Components/WebSocketContext";

const ChatApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const {
    messages,
    sendMessage,
    setUser,
    currentUser,
    chatReadyState
  } = useWebSocketContext();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch current user
        const userResponse = await Axios.get('/api/user_profile/');
        setUser(userResponse.data.username);
        
        // Fetch users list
        const usersResponse = await Axios.get('/api/users/');
        console.log('Raw users response:', usersResponse); // Debug log
        console.log('Users data:', usersResponse.data); // Debug log
        
        // Ensure we're working with an array and transform the data
        let usersArray = Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : usersResponse.data.data || [];  // Handle potential nested data structure
        
        console.log('Users array before transformation:', usersArray); // Debug log
        
        // Transform the data to match your component's expectations
        const transformedUsers = usersArray.map(user => ({
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.image,
          firstName: user.first_name,
          lastName: user.last_name
        }));
        
        console.log('Transformed users:', transformedUsers); // Debug log
        
        setUsers(transformedUsers);
        
        // Set initial selected user if available
        if (transformedUsers.length > 0) {
          setSelectedUser(transformedUsers[0]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Raw error:', err); // Debug log
        setError('Failed to initialize chat');
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const handleSendMessage = (messageContent) => {
    if (!selectedUser) return;
    sendMessage(messageContent, selectedUser.name);
  };

  const handleUserSelect = (user) => {
    setIsUserListVisible(false);
    setSelectedUser(user);
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
  };

  // Filter users based on search query with null check
  const filteredUsers = users.length > 0 
    ? users.filter((user) => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#393E46]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#393E46]">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen p-2 bg-[#393E46]">
      {/* Mobile User List */}
      {isUserListVisible && (
        <div className="lg:hidden absolute left-0 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 bg-[#222831] h-full z-10">
          <div className="sticky top-0 bg-[#222831] z-20 p-2">
            <input
              type="text"
              placeholder='Search users...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full p-2 rounded bg-[#393E46] text-white'
            />
          </div>
          <UserList 
            users={filteredUsers} 
            onUserSelect={handleUserSelect} 
            selectedUser={selectedUser} 
          />
        </div>
      )}

      {/* Desktop User List */}
      <div className="hidden lg:block w-1/4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 bg-[#222831] rounded-l-lg">
        <div className="sticky top-0 bg-[#222831] z-20 p-2">
          <input
            type="text"
            placeholder='Search users...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full p-2 rounded bg-[#393E46] text-white'
          />
        </div>
        <UserList 
          users={filteredUsers} 
          onUserSelect={handleUserSelect} 
          selectedUser={selectedUser} 
        />
      </div>

      {/* Chat Section */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          <div className="w-auto h-[13%] text-white font-kreon text-lg">
            <ChatHeader 
              selectedUser={selectedUser} 
              toggleUserList={toggleUserList} 
            />
          </div>

          <div className="w-auto h-2/3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
            <Chat messages={messages[selectedUser.name] || []} />
          </div>

          <div className="lg:pr-5">
            <Input handleSendMessage={handleSendMessage} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Please select a user to chat with</div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;