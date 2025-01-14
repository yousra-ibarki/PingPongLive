"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios";

const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get("/api/users_list/");
        // Adjust sorting to move users with rank 0 to the end
        const sortedUsers = response.data.sort((a, b) => {
          if (a.rank === 0) return 1;
          if (b.rank === 0) return -1;
          return a.rank - b.rank;
        });
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

  // Filter users by search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Top three players
  const topThreeUsers = filteredUsers.slice(0, 3);

  return (
    <div className="flex flex-col h-[1100px] p-2 bg-[#393E46]">
      {/* Search bar */}
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

      {/* Top 3 players section */}
      <div className="h-[35%] w-full bg-[#222831] rounded-md p-2 border border-[#393E46]">
        <div className="flex flex-row justify-center">
          <div className="text-[#222831] flex justify-center rounded-lg w-[90%] md:w-[20%] bg-[#FFD369] font-kreon text-2xl text-center my-2">
            Top 3 Players
          </div>
        </div>

        {/* Table header for top 3 */}
        <div className="flex items-center h-[20%] justify-between bg-[#222831] rounded-lg m-2 border border-[#FFD369]">
          <span className="text-[#FFD369] flex justify-center items-center w-full font-kreon border-r border-[#FFD369] py-2">
            Rank
          </span>
          <span className="text-[#FFD369] flex justify-center items-center w-full font-kreon border-r border-[#FFD369] py-2">
            Player
          </span>
          <span className="text-[#FFD369] flex justify-center items-center w-full font-kreon py-2">
            Level
          </span>
        </div>

        {/* Top 3 players rows */}
        {topThreeUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center h-[15%] justify-between bg-[#393E46] rounded-lg m-2 border border-[#FFD369]"
          >
            <span className="text-[#FFD369] w-full flex justify-center items-center font-kreon border-r border-[#FFD369] py-2">
              {user.rank}
            </span>
            <span className="text-[#FFD369] w-full flex justify-center items-center font-kreon border-r border-[#FFD369] py-2">
              {user.username}
            </span>
            <span className="text-[#FFD369] w-full flex justify-center items-center font-kreon py-2">
              {user.level}
            </span>
          </div>
        ))}
      </div>

      {/* Full leaderboard section */}
      <div className="h-[55%] w-full bg-[#222831] rounded-md p-2 mt-8 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 border border-[#393E46]">
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            className="flex items-center h-[10%] justify-between bg-[#393E46] rounded-lg m-2 border border-[#FFD369]"
          >
            <span className="text-white w-full flex justify-center items-center font-kreon border-r border-[#FFD369] py-2">
              {user.rank}
            </span>
            <span className="text-white w-full flex justify-center items-center font-kreon border-r border-[#FFD369] py-2">
              {user.username}
            </span>
            <span className="text-white w-full flex justify-center items-center font-kreon py-2">
              {user.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;