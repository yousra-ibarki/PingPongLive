"use client";
import Axios from "../Components/axios";
import React, { useEffect, useState, useRef } from "react";
import FriendInfo from "./FriendInfo";
import Profile from "../Components/profile";

const Friends = () => {
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Abdelfatah",
      profileImage: "./user_img.svg",
      rank: 2,
      level: 6,
      gameLosses: 5,
      gameWins: 10,
      history: [
        { opponent: "Abdelfatah", result: "WIN", date: "2024-08-08" },
        { opponent: "Yousra", result: "WIN", date: "2024-08-09" },
        { opponent: "Ayoub", result: "LOSE", date: "2024-08-10" },
        { opponent: "Abdellah", result: "WIN", date: "2024-08-11" },
      ],
      acheivements: [
        { name: "First Win", date: "2024-08-08" },
        { name: "First Loss", date: "2024-08-09" },
      ],
    },
    {
      id: 2,
      name: "Ayoub",
      profileImage: "./user_img.svg",
      rank: 2,
      level: 6,
      gameLosses: 5,
      gameWins: 10,
      history: [
        { opponent: "Abdelfatah", result: "WIN", date: "2024-08-08" },
        { opponent: "Yousra", result: "WIN", date: "2024-08-09" },
        { opponent: "Ayoub", result: "LOSE", date: "2024-08-10" },
        { opponent: "Abdellah", result: "WIN", date: "2024-08-11" },
      ],
      acheivements: [
        { name: "First Win", date: "2024-08-08" },
        { name: "First Loss", date: "2024-08-09" },
      ],
    },
    {
      id: 3,
      name: "Ahmad",
      profileImage: "./user_img.svg",
      rank: 2,
      level: 6,
      gameLosses: 5,
      gameWins: 10,
      history: [
        { opponent: "Abdelfatah", result: "WIN", date: "2024-08-08" },
        { opponent: "Yousra", result: "WIN", date: "2024-08-09" },
        { opponent: "Ayoub", result: "LOSE", date: "2024-08-10" },
        { opponent: "Abdellah", result: "WIN", date: "2024-08-11" },
      ],
      acheivements: [
        { name: "First Win", date: "2024-08-08" },
        { name: "First Loss", date: "2024-08-09" },
      ],
    },
  ]);
  const [selectedFriend, setSelectedFriend] = useState(friends[0]);
  const scrollRef = useRef(null);

  // useEffect(() => {
  //   try {
  //     const fetchFrinds = async () => {
  //       const responseResp = await Axios.get(`/api/friends/`);
  //       setFriends(responseResp.data.data);
  //     };
  //     fetchFrinds();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleWheel = (event) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col justify-between">
      <div className="bg-[#222831]  m-2 flex flex-row items-center relative rounded-2xl">
        <button
          className="absolute left-0 z-10 bg-gray-800 p-2 rounded-full"
          onClick={() => scroll("left")}
        >
          <img src="./left_arrow.svg" alt="Left Arrow" className="w-10 h-10" />
        </button>
        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="lg:w-[87%] w-[60%] ml-10 overflow-x-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800 flex items-center"
        >
          <div className="flex space-x-4 p-2">
            {friends.map((friend, index) => (
              <div
                key={index}
                className="flex-shrink-0 p-4 rounded shadow-md cursor-pointer"
                onClick={() => setSelectedFriend(friend)}
              >
                <img
                  src={friend.profileImage}
                  alt="user_img"
                  className="w-10 h-10 rounded-full"
                />
              </div>
            ))}
          </div>
        </div>
        <img
          src="./addFriend.svg"
          alt="add friend"
          className="w-10 h-10 ml-4 absolute lg:right-20 right-16"
        />
        <button
          className="absolute right-0 z-10 bg-gray-800 p-2 rounded-full"
          onClick={() => scroll("right")}
        >
          <img
            src="./right_arrow.svg"
            alt="Right Arrow"
            className="w-10 h-10"
          />
        </button>
      </div>
      <Profile userData={selectedFriend} myProfile={false} />
    </div>
  );
};

export default Friends;
