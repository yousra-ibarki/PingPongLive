import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Axios from '../Components/axios';
import toast from 'react-hot-toast';
import { useWebSocketContext } from '../Components/WebSocketContext';

const ChatHeader = ({ selectedUser, toggleUserList }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { sendGameRequest } = useWebSocketContext();

  const router = useRouter();

  const handleBlockUser = async () => {
    try {
      if (!selectedUser?.id) {
        console.error('No user selected');
        return;
      }
      // first check if the user is blocked
      const isBlocked = await Axios.get(`/api/friends/friendship_status/${selectedUser.id}/`);
      if (isBlocked.data.is_blocked) {
        toast.error('You are already blocked by this user');
        return;
      }
      await Axios.post(`/api/friends/block_user/${selectedUser.id}/`);

      setIsDropdownVisible(false); // Close dropdown after blocking
    } catch (error) {
      toast.error('Error blocking user');
      // console.error('Error blocking user:', error);
    }
  };

  useEffect(() => {
    const blockUser = async () => {
      try {
        const response = await Axios.post(`/api/friends/block_user/${selectedUser.id}`);
        console.log(response);
      } catch (error) {
        console.error('Error blocking user:', error); 
      }
    };

      const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown-menu') && 
          !event.target.closest('.three-dots-icon') &&
          !event.target.closest('.friend-management')) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleViewProfile = () => {
    router.push(`/userProfile/${selectedUser.id}`);
  };

  if (!selectedUser) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-full p-4 rounded-r-md bg-[#222831] relative">
          <FiMenu
            size={24}
            className="lg:hidden text-[#FFD369] cursor-pointer mr-2"
            onClick={toggleUserList}
          />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-full p-4 rounded-r-md bg-[#222831] relative">
        <div className="flex items-center">
          <div className="block lg:hidden">
            <FiMenu
              size={24}
              className="text-[#FFD369] cursor-pointer mr-2"
              onClick={toggleUserList}
            />
          </div>
          <img 
            src={selectedUser.image || "./user_img.svg"} 
            alt="user_img" 
            className="w-10 h-10 mr-4 rounded-full"
          />
          <div>
            <span className="text-lg font-kreon text-white">{selectedUser.name}</span>
            <span className={`block text-sm ${selectedUser.is_online ? 'text-[#FFD369]' : 'text-[#eb2e2e]'}`}>
              {selectedUser.is_online ? 'online' : 'offline'}
            </span>
          </div>
        </div>
        
        <div className="text-white text-2xl cursor-pointer relative three-dots-icon" onClick={() => setIsDropdownVisible(!isDropdownVisible)}>
          <img src='https://127.0.0.1:8001/3dots.svg' alt='3dots_img' />
          {isDropdownVisible && (
            <div className="dropdown-menu absolute right-0 top-12 mt-2 w-48 bg-[#222831] border border-gray-600 rounded-md shadow-lg z-10">
              <ul>
                <li className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer" onClick={handleViewProfile}>
                  View Profile
                </li>
                <li className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer"
                  onClick={() => sendGameRequest(selectedUser.id)}
                >
                  Invite to Game
                </li>
                <li 
                  className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer text-red-500" 
                  onClick={handleBlockUser}
                >
                  Block User
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;