"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios";

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get("/api/user/");
        // Sort users by rank in ascending order
        const sortedUsers = response.data.sort((a, b) => a.rank - b.rank);
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  const topThreeUsers = filteredUsers.slice(0, 3);

  return (
    <div className="flex flex-col h-[1100px] p-2 bg-[#393E46]">
      <div className="h-[10%] flex justify-center items-center bg-[#393E46]">
        <div className="h-[90%] w-1/3">
          <input
            type="text"
            placeholder="Search a player"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#222831] text-center text-white border pl-4 border-[#FFD369] p-2 rounded-lg"
          />
        </div>
      </div>
      <div className=" h-[35%] w-full bg-[#222831] rounded-md p-2">
        <div className="flex flex-row justify-center">
          <div className="text-[#222831] flex justify-center rounded-lg w-[90%] md:w-[20%] bg-[#FFD369] font-kreon text-2xl text-center">
            Top 3 Players
          </div>
        </div>
        <div className="flex items-center h-[20%] justify-between bg-[#222831] rounded-lg m-2">
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 rounded-l-lg font-kreon">
            Rank
          </span>
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 font-kreon">
            Player
          </span>
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 rounded-r-lg font-kreon">
            Level
          </span>
        </div>
        {topThreeUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center h-[15%] justify-between bg-[#222831] rounded-lg m-2"
          >
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">
              {user.rank}
            </span>
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">
              {user.username}
            </span>
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">
              {user.level}
            </span>
          </div>
        ))}
      </div>
      <div className=" h-[55%] w-full bg-[#222831] rounded-md p-2 pr-0 mt-8 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center h-[10%] justify-between bg-[#222831] rounded-lg m-2"
          >
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">
              {user.rank}
            </span>
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">
              {user.username}
            </span>
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">
              {user.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;