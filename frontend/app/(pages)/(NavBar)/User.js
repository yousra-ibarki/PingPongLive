"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Axios from "../Components/axios";


const User = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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
      <a>
        <img
          src="https://127.0.0.1:8001/avatar1.jpg"
          alt="avatar"
          className={` max-w-16 max-h-16  rounded-full cursor-pointer border-2 ${isSmall ? "lg:hidden" : "hidden lg:block"} `}
          style={{ borderColor: "#FFD369" }}
        />
        {/* <span>User</span> */}
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
