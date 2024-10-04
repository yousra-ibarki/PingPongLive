"use client";

import React, { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import UserList from '../Components/UsersList';
import Chat from '../Components/Chat';
import ChatHeader from '../Components/chatHeader';
import Input from '../Components/Input';

const users = [
  { name: 'Ahmed', timestamp: '07:25', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdelfatah', timestamp: '09:21', isOnline: true, hasNotification: true, unreadMessages: 0 },
  { name: 'Yousra', timestamp: '12:43', isOnline: false, hasNotification: true, unreadMessages: 0 },
  { name: 'Ayoub', timestamp: '18:56', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdellah', timestamp: '14:07', isOnline: false, hasNotification: true, unreadMessages: 3 },
  { name: 'Anas', timestamp: '8:26', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Ahmed1', timestamp: '07:25', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdelfatah1', timestamp: '09:21', isOnline: true, hasNotification: true, unreadMessages: 0 },
  { name: 'Yousra1', timestamp: '12:43', isOnline: false, hasNotification: true, unreadMessages: 0 },
  { name: 'Ayoub1', timestamp: '18:56', isOnline: true, hasNotification: false, unreadMessages: 0 },
  { name: 'Abdellah1', timestamp: '14:07', isOnline: false, hasNotification: true, unreadMessages: 13 },
  { name: 'Anas1', timestamp: '8:26', isOnline: true, hasNotification: false, unreadMessages: 0 },
];

const initialMessages = {
  Ahmed: [
    { content: 'Hello Ahmed!', timestamp: '2024-08-08 14:07', isUser: true },
    { content: 'Hi there, how are you?', timestamp: '2024-08-08 14:08', isUser: false },
    { content: 'Hello Ahmed!', timestamp: '2024-08-08 14:07', isUser: true },
    { content: 'Hi there, how are you?', timestamp: '2024-08-08 14:08', isUser: false },
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
  const [messages, setMessages] = useState(() => initialMessages);
  const [selectedUser, setSelectedUser] = useState(() => users[0]);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const socket = useRef(null);
  const [usersState, setUsersState] = useState(users);


  useEffect(() => {
    if (username) {
      // check if the socket has been inistialized 
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

          // check the message if is not from the selected user
          console.log(`FromUser === ${data.fromUser}`);
          console.log(`Selected === ${selectedUser.name}`);
          if (data.fromUser !== selectedUser.name)
          {
            setUsersState(prevUsers => {
              return prevUsers.map(user => {
                if (user.name === data.fromUser) {
                  return {
                    ...user,
                    unreadMessages: user.unreadMessages + 1,
                    hasNotification: true, 
                  };
                }
                return user;
              });
            });
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
    }
  }, [username], selectedUser);

  const handleSendMessage = (messageContent) => {
    const newMessage = {
      content: messageContent,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isUser: true,
    };

    // Send message to specific user
    socket.current.emit('message', {
      message: messageContent,
      fromUser: username,
      toUser: selectedUser.name,
    });

    setMessages({
      ...messages,
      [selectedUser.name]: [...(messages[selectedUser.name] || []), newMessage],
    });
  };

  const handleUserSelect = (user) => {
    if (!messages[user.name]) {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [user.name]: [],
      }));
    }
    setSelectedUser(user);
    console.log(`username :: ${user.name}`);    
    setIsUserListVisible(false);
    // check if the user has unread messages
    if (user.unreadMessages) {
      users.find((u) => u.name === user.name).unreadMessages = 0;
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
      {/* User List */}
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