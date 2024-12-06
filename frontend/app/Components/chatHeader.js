import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Axios from '../Components/axios';
import toast from 'react-hot-toast';

const ChatHeader = ({ selectedUser, toggleUserList, currentUser }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

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

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
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
    <div className="bg-[#222831] p-4 rounded-tr-lg flex items-center justify-between">
      <button 
        onClick={toggleUserList}
        className="lg:hidden text-2xl text-[#FFD369] mr-4"
      >
        <FiMenu />
      </button>

      {selectedUser ? (
        <div className="flex items-center flex-1">
          <div className="relative">
            <img
              src={selectedUser.image || "/default-avatar.png"}
              alt={selectedUser.name}
              className="w-10 h-10 rounded-full"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              selectedUser.is_online ? 'bg-green-500' : 'bg-gray-500'
            }`}></span>
          </div>
          <div className="ml-3">
            <h2 className="font-semibold">{selectedUser.name}</h2>
            <p className="text-sm text-gray-400">
              {selectedUser.is_online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-center">Select a conversation</div>
      )}
    </div>
  );
};

export default ChatHeader;