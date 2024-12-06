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

  const {
    messages,
    sendMessage,
    setUser,
    currentUser,
    unreadCounts,
    resetUnreadCount,
    setState,
    setActiveChat
  } = useWebSocketContext();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Fetch current user
        const userResponse = await Axios.get('/api/user_profile/');
        setUser(userResponse.data.username);

        // Fetch friends list
        const usersResponse = await Axios.get('/api/friends/');
        
        // Fetch initial unread messages
        const unreadMessagesResponse = await Axios.get('/chat/unread_messages/');
        console.log('Initial unread messages:', unreadMessagesResponse.data); // Debug log
        
        // Ensure we're working with an array and transform the data
        let usersArray = Array.isArray(usersResponse.data) 
          ? usersResponse.data 
          : usersResponse.data.data || [];
        
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
        
        setUsers(transformedUsers);

        // Update unread counts in WebSocketContext
        setState(prev => ({
          ...prev,
          unreadCounts: unreadMessagesResponse.data
        }));

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
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
        // setUnreadCounts(response.data);
      } catch (error) {
        console.error('Failed to fetch unread messages:', error);
      }
    };

    // Fetch unread messages initially and every 30 seconds
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);

    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      const markMessagesAsRead = async () => {
        try {
          // Mark messages as read on the backend
          await Axios.post(`/chat/mark_message_as_read/${selectedUser.name}/`);
          
          // Update local state to reflect read status
          setState(prev => ({
            ...prev,
            messages: {
              ...prev.messages,
              [selectedUser.name]: (prev.messages[selectedUser.name] || []).map(msg => ({
                ...msg,
                isRead: true
              }))
            },
            unreadCounts: {
              ...prev.unreadCounts,
              [selectedUser.name]: {
                ...prev.unreadCounts[selectedUser.name],
                count: 0
              }
            }
          }));
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      };

      markMessagesAsRead();

      // Set up interval to periodically mark messages as read while chat is active
      const interval = setInterval(markMessagesAsRead, 10000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [selectedUser]);

  const handleSendMessage = (messageContent) => {
    if (!selectedUser) return;
    sendMessage(messageContent, selectedUser.name);
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setIsUserListVisible(false);
    setActiveChat(user.name);

    try {
      // Load previous messages
      const response = await Axios.get(`/chat/messages/${user.name}/`);
      
      // Reset unread count for selected user
      resetUnreadCount(user.name);

      const historicMessages = response.data.map(msg => ({
        id: msg.id,
        content: msg.content,
        timestamp: msg.timestamp,
        isUser: msg.sender === currentUser,
        isRead: msg.is_read,
        sender: msg.sender,
        receiver: msg.receiver
      }));
      
      // Update messages in state
      historicMessages.forEach(msg => {
        if (!messages[user.name]?.some(existingMsg => existingMsg.id === msg.id)) {
          sendMessage(msg.content, user.name, {
            id: msg.id,
            timestamp: msg.timestamp,
            isRead: msg.isRead,
            sender: msg.sender,
            receiver: msg.receiver,
            isHistoric: true
          });
        }
      });
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

  // Add cleanup when component unmounts or user changes
  useEffect(() => {
    return () => {
      setActiveChat(null);  // Clear active chat when component unmounts
    };
  }, []);

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
        <div className="lg:hidden left-0 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 bg-[#222831] h-full z-10">
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
      {/* {selectedUser ? ( */}
        <div className="flex-1 flex flex-col">
          <div className="w-auto h-[8%] mb-2 text-white font-kreon text-lg">
            <ChatHeader 
              selectedUser={selectedUser} 
              toggleUserList={toggleUserList} 
            />
          </div>

          <div className="w-auto h-2/3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
            {selectedUser ? (
              <Chat messages={messages[selectedUser.name] || []} />
            ) : (
              <div className="flex-1 flex items-center justify-center mt-5 text-2xl">Please select a user to chat with</div>
            )}
          </div>

          {selectedUser && (
            <div className="lg:pr-5">
              <Input handleSendMessage={handleSendMessage} />
            </div>
          )}
        </div>
    </div>
  );
};

export default ChatApp;
