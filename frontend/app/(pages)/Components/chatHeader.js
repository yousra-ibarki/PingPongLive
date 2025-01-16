import React, { useState, useEffect } from "react";
import { FiMenu } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Axios from "./axios";
import toast from "react-hot-toast";
import { useWebSocketContext } from "./WebSocketContext";
import { data } from "../home/Carousel";


const ChatHeader = ({ selectedUser, toggleUserList }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { sendGameRequest, setMapNbr } = useWebSocketContext();
  const [ isWaiting, setIsWaiting ] = useState(false);
  const [ activeImg, setActiveImg ] = useState(false);

  const router = useRouter();

  console.log("selectedUser7899", selectedUser);

  const handleBlockUser = async () => {
    try {
      if (!selectedUser?.id) {
        console.error("No user selected");
        return;
      }
      // first check if the user is blocked
      const isBlocked = await Axios.get(
        `/api/friends/friendship_status/${selectedUser.id}/`
      );
      if (isBlocked.data.is_blocked) {
        toast.error("You are already blocked by this user");
        return;
      }
      await Axios.post(`/api/friends/block_user/${selectedUser.id}/`);

      setIsDropdownVisible(false); // Close dropdown after blocking
    } catch (error) {
      toast.error("Error blocking user");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".three-dots-icon") &&
        !event.target.closest(".friend-management")
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleViewProfile = () => {
    router.push(`/user-profile/${selectedUser.id}`);
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
    );
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
            className="w-14 h-14 mr-4 rounded-full"
          />
          <div>
            <span className="text-lg font-kreon text-white">
              {selectedUser.name}
            </span>
            <span
              className={`block text-sm ${
                selectedUser.is_online ? "text-[#FFD369]" : "text-[#eb2e2e]"
              }`}
            >
              {selectedUser.is_online ? "online" : "offline"}
            </span>
          </div>
        </div>
        {selectedUser.name !== "Tournament System" && (
        <div
          className="text-white text-2xl cursor-pointer relative three-dots-icon"
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          <img src="/3dots.svg" alt="3dots_img" />
          {isDropdownVisible && (
            <div className="dropdown-menu absolute right-0 top-12 mt-2 w-48 bg-[#222831] border border-gray-600 rounded-md shadow-lg z-10">
              <ul>
                <li
                  className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer"
                  onClick={handleViewProfile}
                >
                  View Profile
                </li>
                <li
                  className="p-2 text-lg font-kreon hover:bg-[#393E46] cursor-pointer"
                  onClick={() => {setIsWaiting(true)}}
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



          {isWaiting  && (
            <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-25 flex justify-center items-center z-50 text-center pt-8">
              <div className="border w-3/4 md:2/4 h-auto max-h-[80vh] overflow-y-auto text-center pt-8 border-white bg-blue_dark p-5">
                <div>
                  <span className="tracking-widest text-xl">
                    Please choose your map
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 cursor-pointer mt-10">
                  {data.map((image) => (
                    <img
                      key={image.num}
                      src={image.cover}
                      alt={`MapNum ${image.num}`}
                      className={`transition-transform duration-300 ${
                        activeImg == image.num
                          ? "scale-105 border-2 border-[#FFD369]"
                          : "hover:scale-105"
                      }`}
                      onClick={() => {
                        setMapNbr(image.num);
                        setActiveImg(image.num);
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-around md:justify-center items-center">
                  <button
                    onClick={() => {
                        setIsWaiting(false);
                    }}
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      
                        sendGameRequest(selectedUser.id)}
                    }
                    className="text-xl tracking-widest bg-[#FFD369] p-2 m-10 rounded-[50px] w-48 border flex justify-center hover:shadow-2xl hover:bg-slate-300 text-black"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}  




          












        </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
