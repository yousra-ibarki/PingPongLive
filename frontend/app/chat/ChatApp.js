"use client";

import React, { useState, useEffect } from "react";
import UserList from "../Components/UsersList";
import Chat from "../Components/UserChat";
import ChatHeader from "../Components/chatHeader";
import Input from "../Components/Input";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Axios from "../Components/axios";
import { config } from "../Components/config";

const users = [
  { name: "aer-raou", timestamp: "07:25", isOnline: true, hasNotification: false },
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
  {name: "test", timestamp: "14:07", isOnline: false, hasNotification: true, unreadMessages: 13},
  {name: "test1", timestamp: "14:07", isOnline: false, hasNotification: true, unreadMessages: 13},
];

const initialMessages = {
  Ahmed: [
    { content: "Hello Ahmed!", timestamp: "2024-08-08 14:07", isUser: true },
    {
      content: "Hi there, how are you?",
      timestamp: "2024-08-08 14:08",
      isUser: false,
    },
    { content: "Hello Ahmed!", timestamp: "2024-08-08 14:07", isUser: true },
    {
      content: "Hi there, how are you?",
      timestamp: "2024-08-08 14:08",
      isUser: false,
    },
    { content: "Hello Ahmed!", timestamp: "2024-08-08 14:07", isUser: true },
    {
      content: "Hi there, how are you?",
      timestamp: "2024-08-08 14:08",
      isUser: false,
    },
  ],
  Abdelfatah: [
    {
      content: "Hey Abdelfatah!",
      timestamp: "2024-08-08 14:09",
      isUser: false,
    },
    { content: "All good, you?", timestamp: "2024-08-08 14:10", isUser: true },
  ],
  Yousra: [
    { content: "Hi Yousra!", timestamp: "2024-08-08 14:11", isUser: true },
    {
      content: "Hello, how are you?",
      timestamp: "2024-08-08 14:12",
      isUser: false,
    },
  ],
};

const ChatApp = () => {
  const [messages, setMessages] = useState(() => initialMessages);
  const [selectedUser, setSelectedUser] = useState(() => users[0]);
  const [isUserListVisible, setIsUserListVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await Axios.get('/api/user_profile/');
        setCurrentUser(response.data.username);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile');
        setLoading(false);
        console.error('Error fetching user profile:', err);
      }
    };

    fetchCurrentUser();
  }, []);
  console.log("currentUser===", currentUser);
  const wsUrl = `${config.wsUrl}/chat/${currentUser}/`;
  // const wsUrl = `ws://127.0.0.1:8000/ws/chat/exemple/`;
  const { readyState, sendJsonMessage } = useWebSocket(wsUrl, {
    onOpen: () => console.log("Connected!"),
    onClose: () => console.log("Disconnected!"),
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat_message') {
        // Handle incoming message
        setMessages(prev => ({
          ...prev,
          [data.sender]: [
            ...(prev[data.sender] || []),
            {
              content: data.message,
              timestamp: data.timestamp,
              isUser: false,
            }
          ]
        }));
      } else if (data.type === 'message_sent') {
        // Handle sent message confirmation
        console.log("Message sent successfully");
      }
    },
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];


  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#393E46" }}>
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: "#393E46" }}>
        <div className="text-white">{error}</div>
      </div>
    );
  }

  const handleSendMessage = (messageContent) => {
    const newMessage = {
      content: messageContent,
      timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      isUser: true,
    };

    // Update local state
    setMessages(prev => ({
      ...prev,
      [selectedUser.name]: [...(prev[selectedUser.name] || []), newMessage],
    }));

    // Send message through WebSocket
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        type: 'chat_message',
        message: messageContent,
        user: selectedUser.name,
        receiver: selectedUser.name,
        sender: currentUser,
      });
    }
  };

  const handleUserSelect = (user) => {
    setIsUserListVisible(false);
    if (!messages[user.name]) {
      setMessages((prevMessages) => ({
        ...prevMessages,
        [user.name]: [],
      }));
    }
    setSelectedUser(user);
  };

  const toggleUserList = () => {
    setIsUserListVisible(!isUserListVisible);
  };

  const filteredUsers = users.filter((user) =>
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
