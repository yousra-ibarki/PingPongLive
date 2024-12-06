import React, { useEffect } from 'react';

const UserChat = ({ messages, messagesEndRef }) => {
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white rounded-md p-2"
    style={{backgroundColor: '#393E46'}}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((message, index) => {
          const isSmallMessage = message.content.length < 50;
          const maxWidthClass = isSmallMessage ? 'max-w-[35%]' : 'max-w-[40%]';

          return (
            <div
              key={index}
              className={`mb-2 p-2 rounded-2xl mr-2 ${maxWidthClass} ${
                message.isUser ? ' ml-auto rounded-tr-none' : ' mr-auto rounded-tl-none'
              }`}
              style={{
                alignSelf: message.isUser ? 'flex-end' : 'flex-start',
                backgroundColor: message.isUser ? '#FFD369' : '#222831',
              }}
            >
              <span className="block butblock break-all text-lg text-center break-words"
                style={{ color: message.isUser ? '#222831' : '#FFD369' }}
              >{message.content}</span>
              <span className="text-xs text-gray-500 mt-1 block text-right">{message.timestamp}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default UserChat;
