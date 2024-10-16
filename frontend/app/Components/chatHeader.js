import React from 'react';
import { HiDotsVertical } from "react-icons/hi";

const ChatHeader = ({ selectedUser }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-r-md bg-[#222831]">
      <div className="flex items-center">
        <img src="./user_img.svg" alt="user_img" className="w-10 h-10 mr-4 rounded-full" />
        <div>
          <span className="text-lg font-semibold text-white">{selectedUser.name}</span>
          <span className={`block text-sm ${selectedUser.isOnline ? 'text-green-500' : 'text-red-500'}`}>
            {selectedUser.isOnline ? 'online' : 'offline'}
          </span>
        </div>
      </div>
      <div className="text-white text-2xl cursor-pointer">
        <img src='./3dots.svg' alt='3dots_img'/>
      </div>
    </div>
  );
};

export default ChatHeader;
