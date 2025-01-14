// import React, { useEffect } from 'react';

// const formatTimestamp = (timestamp) => {
//   // Check if timestamp exists and is valid
//   if (!timestamp) return '';
  
//   try {
//     // Remove the microseconds and 'Z' and replace 'T' with space
//     return timestamp.replace('T', ' ').split('.')[0];
//   } catch (error) {
//     console.error('Error formatting timestamp:', error);
//     return timestamp; // Return original timestamp if formatting fails
//   }
// };

// const UserChat = ({ messages, messagesEndRef }) => {
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   // Scroll to bottom when new messages arrive
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   return (
//     <div className="flex flex-col h-full bg-gray-800 text-white rounded-md p-2"
//     style={{backgroundColor: '#393E46'}}
//     >
//       <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
//         {messages.map((message, index) => {
//           const isSmallMessage = message.content.length < 50;
//           const maxWidthClass = isSmallMessage ? 'max-w-[35%]' : 'max-w-[40%]';

//           return (
//             <div
//               key={index}
//               className={`mb-2 p-2 rounded-2xl mr-2 ${maxWidthClass} ${
//                 message.isUser ? ' ml-auto rounded-tr-none' : ' mr-auto rounded-tl-none'
//               }`}
//               style={{
//                 alignSelf: message.isUser ? 'flex-end' : 'flex-start',
//                 backgroundColor: message.isUser ? '#FFD369' : '#222831',
//               }}
//             >
//               <span className="block butblock break-all text-lg text-center break-words"
//                 style={{ color: message.isUser ? '#222831' : '#FFD369' }}
//               >{message.content}</span>
//               <span className="text-xs text-gray-500 mt-1 block text-right">
//                 {formatTimestamp(message.timestamp)}
//               </span>
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>
//     </div>
//   );
// };

// export default UserChat;


import React, { useEffect } from 'react';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    console.log("timestamp ====)) ", timestamp)
    console.log("timestamp ====)) ", timestamp.replace('T', ' ').split('.')[0])
    return timestamp.replace('T', ' ').split('.')[0];
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return timestamp;
  }
};

const UserChat = ({ messages, messagesEndRef }) => {
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      className="flex flex-col h-full bg-gray-800 text-white rounded-md p-2"
      style={{backgroundColor: '#393E46'}}
    >
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {messages.map((message, index) => {
          // Handle system messages differently
          if (message.sender === 'Tournament System' || message.isSystemMessage) {
            return (
              <div
                key={index}
                className="mb-2 mx-auto p-2 rounded-lg max-w-[60%] text-center"
                style={{
                  backgroundColor: '#2C3333',
                  border: '1px solid #FFD369'
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span role="img" aria-label="tournament">🎮</span>
                  <span className="font-semibold text-[#FFD369]">Tournament System</span>
                </div>
                <span className="block text-white text-lg break-words">
                  {message.content}
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
            );
          }

          // Regular user messages
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
              <span 
                className="block butblock break-all text-lg text-center break-words"
                style={{ color: message.isUser ? '#222831' : '#FFD369' }}
              >
                {message.content}
              </span>
              <span className="text-xs text-gray-500 mt-1 block text-right">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default UserChat;