import React from 'react';
import { FaRegUserCircle } from "react-icons/fa";

const UserList = ({ users, onUserSelect, selectedUser }) => {
  return (
    <div className="p-4 text-white h-full"
      style={{ backgroundColor: '#222831' }}
    >
      <ul className="space-y-4">
        {users.map((user, index) => (
          <li 
            key={index} 
            className={`flex items-center p-1 bg-[#393E46] rounded-md cursor-pointer transition-colors ${user.name === selectedUser?.name ? 'border-b-4 border-[#FFD369]' : ''}`}
            onClick={() => onUserSelect(user)}
          >
            {/* <FaRegUserCircle className="text-[#FFD369] text-2xl mr-4" /> */}
            <img src="./user_img.svg" alt="user_img" className="mr-4" />
            <div className="flex-1">
              <span className="block font-medium">{user.name}</span>
              <span className="block text-sm text-gray-400">{user.timestamp}</span>
            </div>
            {user.unreadMessages && (
              <span className="bg-[#FFD369] text-gray-800 text-xs rounded-full px-2 py-1">
                {user.unreadMessages}
              </span>
            )}
            <span className={`ml-4 w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-[#FF0000]'}`}></span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
