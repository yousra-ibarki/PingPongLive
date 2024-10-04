import React, { useEffect, useRef} from 'react';

const Chat = ({ messages }) => {

  const messagesEndRef = useRef(null);

  //Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-[#393E46] text-white rounded-md p-2">
      {messages.map((message, index) => {
        const isSmallMessage = message.content.length < 50;
        const maxWidthClass = isSmallMessage ? 'max-w-[35%]' : 'max-w-[50%]';
        
        return (
          <div
          key={index}
          className={`mb-2 p-2 rounded-2xl mr-2 ${maxWidthClass} ${message.isUser ? ' ml-auto rounded-tr-none bg-[#FFD369] justify-end' : ' mr-auto rounded-tl-none bg-[#222831] justify-start'
          }`}
          >
            <span className={`block text-sm text-center font-kreon break-words ${message.isUser ? 'text-[#222831]' : 'text-[#FFD369]'}`}>
              {message.content}
            </span>
            <span className="text-xs text-gray-500 mt-1 block text-right">
              {message.timestamp}
            </span>
          </div>
        );
      })}
      {/* Dummy div to ensure scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default Chat;
