"use client";
import Axios from "../Components/axios";
import React, { useEffect, useState, useRef } from "react";
import FriendInfo from "./FriendInfo";
import Profile from "../Components/profile";
import UserList from "./usersList";

const Friends = () => {
  
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "John",
      profileImage: "./user_img.svg",
      winRate: 50,
      LeaderboardRank: 1,
      level: 5.3,
      achievements: [
        {
          name: "Achievement 1",
        },
        {
          name: "Achievement 2",
        },
      ],
      history: [
        {
          opponent: "youssra",
          result: "loss",
        },
        {
          user: "ahmad",
          opponent: "Jane",
          result: "Win",
        },
        {
          user: "abdellah",
          opponent: "Jane",
          result: "Win",
        },
      ],
    },
    {
      id: 2,
      name: "fatah",
      profileImage: "./user_img.svg",
      winRate: 50,
      LeaderboardRank: 1,
      level: 5.3,
      achievements: [
        {
          name: "Achievement 1",
        },
        {
          name: "Achievement 2",
        },
      ],
      history: [
        {
          user: "ayoub",
          opponent: "Jane",
          result: "Win",
        },
        {
          user: "abdo",
          opponent: "Jane",
          result: "Win",
        },
        {
          user: "abdellah",
          opponent: "Jane",
          result: "Win",
        },
      ],
    },
  ]);

  // useEffect(() => {
  //   try {
  //     const fetchFriends = async () => {
  //       const responseResp = await Axios.get(`/api/friends/`);
  //       setFriends(responseResp.data.data);
  //     };
  //     fetchFriends();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, []);

  return (
    <div className="">
      <UserList friends={friends} />
      <UserList friends={friends} />
      <UserList friends={friends} />

    </div>
  );
};

export default Friends;
