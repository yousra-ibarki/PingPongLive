"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Axios from "../Components/axios";
import { useWebSocketContext } from "../Components/WebSocketContext";


const User = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [userPic, setUserPic] = useState(null);
  

  const { loggedInUser, isLoading } = useWebSocketContext();
  useEffect(() => {
    try {
      setUserPic(loggedInUser.image);
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  }, [loggedInUser]);


  const handleLogout = () => {
    try {
      Axios.post("/api/accounts/logout/");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }

  return (
    <div
      //   className="relative"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <a > 
          <img
            src={userPic || "/user_img.svg"}
            alt="avatar"
            className={`border-[1px] border-[#FFD369] h-16 max-w-16 max-h-16 rounded-full cursor-pointer ${isSmall ? "lg:hidden" : "hidden lg:block"} `}
            onClick={() => router.push("/profile")}
          />
      </a>
      {isMenuOpen && (
        <div
          className={`absolute z-50 w-auto rounded-md bg-white text-nowrap right-3 p-1 ${
            isSmall ? "lg:hidden" : "hidden lg:block"
          }`}
          style={{ backgroundColor: "#393E46" }}
        >
          <ul>
            <a
              onClick={() => {
                router.push("/profile");
              }}
            >
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                My Pofile
              </li>
            </a>
            <a
              onClick={() => {
                router.push("/settings");
              }}
            >
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                Settings
              </li>
            </a>
            <a
              onClick={handleLogout}
            >
              <li className=" menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black">
                Logout
              </li>
            </a>
          </ul>
        </div>
      )}
    </div>
  );
};

export default User;