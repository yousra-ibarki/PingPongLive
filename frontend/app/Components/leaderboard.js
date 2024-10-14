"use client"

import React, { useState} from "react";
import Axios from "./axios";

const users = [
  { name: 'Ahmed', rank: 1, level: 7 },
  { name: 'Abdelfatah', rank: 2, level: 6 },
  { name: 'Yousra', rank: 3, level: 5 },
  { name: 'Ayoub', rank: 4, level: 4 },
  { name: 'Abdellah', rank: 5, level: 3 },
  { name: 'Ahmed1', rank: 7, level: 1 },
  { name: 'Abdelfatah1', rank: 8, level: 1 },
  { name: 'Yousra1', rank: 9, level: 1 },
  { name: 'Ayoub1', rank: 10, level: 1 },
  { name: 'Abdellah1', rank: 11, level: 1 },
];


const Leaderboard = () => {
  const [searchTerm, setSearchTerm] = useState("");




  const fetchUserData = async () => {
  try {
    const response = await Axios.get('/api/user_profile/');
  }
  catch (error) {
    console.error('Fetch error:', error);
  }
}

fetchUserData();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
  );

  const topThreeUsers = filteredUsers.slice(0, 3);
  return (
    <div className="flex flex-col h-screen p-2 bg-[#393E46]">
      <div className="h-[10%] flex justify-center items-center bg-[#393E46]">
        <div className="h-[90%] w-1/3">
          <input
            type="text"
            placeholder="Search a player"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#222831] text-white border pl-4 border-[#FFD369] p-2 rounded-lg"
          />
        </div>
      </div>
      <div className=" h-[35%] w-full bg-[#222831] rounded-md p-2">
        <div className="flex flex-row justify-center">
          <div className="text-[#222831] flex justify-center rounded-lg w-[90%] md:w-[20%] bg-[#FFD369] font-kreon text-2xl text-center">Top 3 Players</div>
        </div>
        <div className="flex items-center h-[15%] justify-between bg-[#222831] rounded-lg m-2">
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 rounded-l-lg font-kreon">Rank</span>
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 font-kreon">Player</span>
          <span className="text-[#FFD369] h-full flex justify-center items-center w-full mr-1 rounded-r-lg font-kreon">Level</span>
        </div>
        {topThreeUsers.map((user, index) => (
          <div key={index} className="flex items-center h-[15%] justify-between bg-[#222831] rounded-lg m-2">
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">{user.rank}</span>
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">{user.name}</span>
            <span className="text-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">{user.level}</span>
          </div>
        ))}
      </div>
      <div className=" h-[55%] w-full bg-[#222831] rounded-md p-2 pr-0 mt-8 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        {filteredUsers.map((user, index) => (
          <div key={index} className="flex items-center h-[10%] justify-between bg-[#222831] rounded-lg m-2">
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">{user.rank}</span>
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">{user.name}</span>
            <span className="text-white h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">{user.level}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Leaderboard;