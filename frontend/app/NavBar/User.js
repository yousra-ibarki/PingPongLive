"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Axios from "../Components/axios";
import Avatar from "../../public/user_img.svg";
import "../globals.css";

const User = ({ isSmall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await Axios.post("/api/accounts/logout/");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await Axios.get("/api/user_profile/");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  console.log(user);

  return (
    <div
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      {loading ? (
        <div className="flex items-center justify-center w-16 h-16 max-w-16 max-h-16 rounded-full cursor-pointer border-2">
          <div className="h-[20px] w-[20px] flex items-center justify-center m-2 loader"></div>
        </div>
      ) : (
        <a>
          <img
            src={user.image || "../user_img.svg"}
            alt="avatar"
            className={`max-w-16 max-h-16 rounded-full cursor-pointer border-2 fade-in-global ${
              isSmall ? "lg:hidden" : "hidden lg:block"
            }`}
            style={{ borderColor: "#FFD369" }}
          />
        </a>
      )}
      {isMenuOpen && (
        <div
          className={`absolute z-50 w-auto rounded-md bg-white text-nowrap right-3 p-1 ${
            isSmall ? "lg:hidden" : "hidden lg:block"
          }`}
          style={{ backgroundColor: "#393E46" }}
        >
          <ul>
            <li
              className="menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black"
              onClick={() => router.push("/profile/")}
            >
              My Profile
            </li>
            <li
              className="menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black"
              onClick={() => router.push("/settings")}
            >
              Settings
            </li>
            <li
              className="menu px-4 py-2 cursor-pointer hover:bg-slate-300 text-sm rounded-md h-auto hover:text-black"
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default User;
