"use client";

import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import UserList from '../Components/UsersList';
import Chat from '../Components/Chat';
import ChatHeader from '../Components/chatHeader';
import Input from '../Components/Input';

const initialUsers = [
  { name: 'Ahmed', timestamp: '07:25', isOnline: true, hasNotification: true, unreadMessages: 0 },
  { name: 'Abdelfatah', timestamp: '09:21', isOnline: true, hasNotification: true, unreadMessages: 0 },
  { name: 'Yousra', timestamp: '12:43', isOnline: false, hasNotification: true, unreadMessages: 0 },
  { name: 'Ayoub', timestamp: '18:56', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdellah', timestamp: '14:07', isOnline: false, hasNotification: true, unreadMessages: 3 },
  { name: 'Ahmed1', timestamp: '07:25', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdelfatah1', timestamp: '09:21', isOnline: true, hasNotification: true, unreadMessages: 0 },
  { name: 'Yousra1', timestamp: '12:43', isOnline: false, hasNotification: true, unreadMessages: 0 },
  { name: 'Ayoub1', timestamp: '18:56', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdellah1', timestamp: '14:07', isOnline: false, hasNotification: true, unreadMessages: 13 },
];

const initialMessages = {
  Ahmed: [
    { content: 'Hello Ahmed!', timestamp: '2024-08-08 14:07', isUser: true },
    { content: 'Hi there, how are you?', timestamp: '2024-08-08 14:08', isUser: false },
  ],
  Abdelfatah: [
    { content: 'Hey Abdelfatah!', timestamp: '2024-08-08 14:09', isUser: false },
    { content: 'All good, you?', timestamp: '2024-08-08 14:10', isUser: true },
  ],
  Yousra: [
    { content: 'Hi Yousra!', timestamp: '2024-08-08 14:11', isUser: true },
    { content: 'Hello, how are you?', timestamp: '2024-08-08 14:12', isUser: false },
  ],
};

const ChatApp = ({ username }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedUser, setSelectedUser] = useState(initialUsers[0]);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [usersState, setUsersState] = useState(initialUsers);
  const socket = useRef(null);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io('http://localhost:8000');
      socket.current.emit('register', username);

      socket.current.on('message', (data) => {
        const newMessage = {
          content: data.message,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          isUser: false,
        };

        setMessages(prevMessages => ({
          ...prevMessages,
          [data.fromUser]: [...(prevMessages[data.fromUser] || []), newMessage],
        }));

        console.log(`from == ${data.fromUser}`);
        console.log(`selecteduser == ${selectedUser.name}`);
        if (data.fromUser !== selectedUser.name) {
          setUsersState(prevUsers => 
            prevUsers.map(user => 
              user.name === data.fromUser 
                ? { ...user, unreadMessages: user.unreadMessages + 1, hasNotification: true } 
                : user
            )
          );
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.off('message');
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [username]);

  const handleSendMessage = (messageContent) => {
    const newMessage = {
      content: messageContent,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isUser: true,
    };

    socket.current.emit('message', {
      message: messageContent,
      fromUser: username,
      toUser: selectedUser.name,
    });

    setMessages(prevMessages => ({
      ...prevMessages,
      [selectedUser.name]: [...(prevMessages[selectedUser.name] || []), newMessage],
    }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsUserListVisible(false);
    
    // Reset unread messages when user is selected
    if (user.unreadMessages > 0) {
      setUsersState(prevUsers => 
        prevUsers.map(u => 
          u.name === user.name 
            ? { ...u, unreadMessages: 0, hasNotification: false } 
            : u
        )
      );
    }
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
  };

  const filteredUsers = usersState.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen p-2 bg-[#393E46]">
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
          <UserList users={filteredUsers} onUserSelect={handleUserSelect} selectedUser={selectedUser} />
        </div>
      )}
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
        <UserList users={filteredUsers} onUserSelect={handleUserSelect} selectedUser={selectedUser} />
      </div>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="w-auto h-[13%] text-white font-kreon text-lg">
          <ChatHeader selectedUser={selectedUser} toggleUserList={toggleUserList} />
        </div>

        {/* Messages */}
        <div className="w-auto h-2/3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 ">
          <Chat messages={messages[selectedUser.name] || []} />
        </div>

        {/* Input Field */}
        <div className="lg:pr-5">
          <Input handleSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
