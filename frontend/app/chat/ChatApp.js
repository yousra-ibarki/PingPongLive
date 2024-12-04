"use client";

import React, { useState, useEffect } from "react";
import UserList from "../Components/UsersList";
import Chat from "../Components/UserChat";
import ChatHeader from "../Components/chatHeader";
import Input from "../Components/Input";
import Axios from "../Components/axios";
import { useWebSocketContext } from "../Components/WebSocketContext";

const SearchInput = ({ searchQuery, setSearchQuery }) => (
  <div className="sticky top-0 bg-[#222831] z-20 p-2">
    <input
      type="text"
      placeholder='Search users...'
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className='w-full p-2 rounded bg-[#393E46] text-white'
    />
  </div>
);

const ChatApp = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const {
    messages,
    sendMessage,
    setUser,
    currentUser,
    // chatReadyState
  } = useWebSocketContext();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch current user
        const userResponse = await Axios.get('/api/user_profile/');
        console.log('Raw user response///////////:', userResponse); // Debug log
        setUser(userResponse.data.username);

        // Fetch friends list
        const usersResponse = await Axios.get('/api/friends/');
        const rr = await Axios.get('/chat/unread_messages/');
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
          lastName: user.last_name,
          is_online: user.is_online,
        }));
        
        console.log('Transformed users:', transformedUsers); // Debug log

        console.log('Unread messages:', rr.data); // Debug log
        
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

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await Axios.get('/chat/unread_messages/');
        setUnreadCounts(response.data);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
      }
    };

    // Fetch unread messages initially and every 30 seconds
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const handleSendMessage = (messageContent) => {
    if (!selectedUser) return;
    sendMessage(messageContent, selectedUser.name);
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsUserListVisible(false);

    try {
      // Load previous messages
      const response = await Axios.get(`/chat/messages/${user.name}/`);
      
      // Mark messages as read
      await Axios.post(`/chat/mark_message_as_read/${user.name}/`);
      
      // Update unread counts by removing the count for selected user
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[user.name];
        return newCounts;
      });

      console.log('*************Raw messages response:', response); // Debug log
      const historicMessages = response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          isUser: msg.sender === currentUser,
          isRead: msg.is_read,
          sender: msg.sender,
          receiver: msg.receiver
      }));
      
      // Update the WebSocketContext messages using sendMessage for each historic message
      historicMessages.forEach(msg => {
        if (!messages[user.name]?.some(existingMsg => existingMsg.id === msg.id)) {
            sendMessage(msg.content, user.name, {
                id: msg.id,
                timestamp: msg.timestamp,
                isRead: msg.isRead,
                sender: msg.sender,
                receiver: msg.receiver,
                isHistoric: true // Add a flag to indicate this is a historic message
            });
        }
    });

      // Mark messages as read
      // await Axios.post(`/chat/messages/${user.name}/read/`);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
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
          <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <UserList 
            users={filteredUsers} 
            onUserSelect={handleUserSelect} 
            selectedUser={selectedUser} 
            unreadCounts={unreadCounts}
          />
        </div>
      )}

      {/* Desktop User List */}
      <div className="hidden lg:block w-1/4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 bg-[#222831] rounded-l-lg">
        <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <UserList 
          users={filteredUsers} 
          onUserSelect={handleUserSelect} 
          selectedUser={selectedUser} 
          unreadCounts={unreadCounts}
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
