import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useRouter } from 'next/navigation';


const ChatHeader = ({ selectedUser, toggleUserList }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const router = useRouter();

  // Function to toggle the dropdown menu
  const toggleDropdown = () => {
    setIsDropdownVisible(prevState => !prevState);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.three-dots-icon')) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle profile view navigation
  const handleViewProfile = () => {
    router.push('/profile'); // Assuming '/profile' is the path for your profile page
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-r-md bg-[#222831] relative">
      <div className="flex items-center">
        <div className="block lg:hidden">
          <FiMenu
            size={24}
            className="text-[#FFD369] cursor-pointer mr-2"
            onClick={toggleUserList}
          />
        </div>
        <img src="./user_img.svg" alt="user_img" className="w-10 h-10 mr-4 rounded-full" />
        <div>
          <span className="text-lg font-kreon text-white">{selectedUser.name}</span>
          <span className={`block text-sm ${selectedUser.isOnline ? 'text-[#FFD369]' : 'text-[#eb2e2e]'}`}>
            {selectedUser.isOnline ? 'online' : 'offline'}
          </span>
        </div>
      </div>
      <div className="text-white text-2xl cursor-pointer relative three-dots-icon" onClick={toggleDropdown}>
        <img src='./3dots.svg' alt='3dots_img' />
        {isDropdownVisible && (
          <div className="dropdown-menu absolute right-[-16px] top-12 mt-2 w-48 bg-[#222831] border border-gray-600 rounded-md shadow-lg z-10">
            <ul>
              <li
                className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer"
                onClick={handleViewProfile} // Add click handler
              >
                View Profile
              </li>
              <li className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer">Mute</li>
              <li className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer">Block</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
