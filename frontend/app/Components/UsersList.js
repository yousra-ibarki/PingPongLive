import React from "react";

const UserList = ({ users, onUserSelect, selectedUser, unreadCounts }) => {
  return (
    <div className="p-4 text-white h-full "
      style={{ backgroundColor: '#222831' }}
    >
      <ul className="space-y-4">
        {users.map((user, index) => {
          const unreadInfo = unreadCounts[user.name];
          return (
            <li 
              key={index} 
              className={`flex items-center p-1 bg-[#393E46] rounded-md cursor-pointer transition-colors ${user.name === selectedUser?.name ? 'border-b-4 border-[#FFD369]' : ''}`}
              onClick={() => onUserSelect(user)}
            >
              <img src="https://127.0.0.1:8001/user_img.svg" alt="user_img" className="mr-4" />
              <div className="flex-1">
                <span className="block font-medium">{user.name}</span>
              </div>
              {unreadInfo?.count > 0 && (
                <span className="bg-[#FFD369] text-gray-800 text-xs rounded-full px-2 py-1 ml-2">
                  {unreadInfo.count}
                </span>
              )}
              <span className={`ml-4 w-3 h-3 rounded-full ${user.is_online ? 'bg-[#FFD369]' : 'bg-[#FF0000]'}`}></span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserList;
