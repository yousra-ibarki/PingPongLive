"use client";

import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const Input = ({ handleSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  const handleInputSend = () => {
    // Check if the message is not empty
    if (newMessage.trim()) {
      handleSendMessage(newMessage);
      setNewMessage('');
    } 
  };

  const onEmojiClick = (emojiObject) => {
    // Append the selected emoji to the message
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Function to handle key down event
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default action of the Enter key (like submitting a form)
      handleInputSend();
    }
  }

  useEffect(() => {
    const inputElement = inputRef.current;

    // Attach the keydown event listener to the input element
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup the event listener on component unmount
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [newMessage]);

  return (
    <div className="flex items-center p-2 rounded-r-3xl relative bg-[#222831]">
      <button
        className="text-[#FFD369] text-2xl mr-2"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      >
        <img src="./face_icon.svg" alt="face_icon" />    
      </button>
      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <EmojiPicker onEmojiClick={onEmojiClick}
            pickerStyle={{ width: "70%" }}  
            reactionsDefaultOpen={true}
          />
        </div>
      )}
      <div className=" mr-2">
        <img src="./import_icon.svg" alt="import_icon" />
      </div>
      <input
        type="text"
        id = "message"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message here"
        className="flex-1  bg-[#3C3C3C] text-white p-2 rounded-2xl rounded-tr-none rounded-bl-none border border-gray-600 mr-2 w-1/2"
        ref={inputRef}
      />
      <button
        onClick={handleInputSend}
        className="text-gray-800 px-2 pb-1 rounded-lg"
      >
        <img src="./send_msg.svg" alt="send_msg" />
      </button>
    </div>
  );
};

export default Input;