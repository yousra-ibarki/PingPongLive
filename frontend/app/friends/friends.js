"use client";
import Axios from "../Components/axios";
import React, { useEffect, useState } from "react";
import UsersList from "./UsersList";
import { toast } from "react-hot-toast";

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

  const [friendRequests, setFriendRequests] = useState([]);
  
  useEffect(() => {
    try {
      const fetchFriendRequests = async () => {
        const response = await Axios.get("/api/friends/friend_requests/");
        setFriendRequests(response.data);
      };
      fetchFriendRequests();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleFriendRequest = async (requestId, action) => {
    try {
      await Axios.post("/api/friends/friend_requests/", {
        request_id: requestId,
        action: action,
      });

      // Refresh friend requests list
      const response = await Axios.get("/api/friends/friend_requests/");
      setFriendRequests(response.data);
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
  };

  useEffect(() => {
    try {
      const fetchFriends = async () => {
        const responseResp = await Axios.get(`/api/friends/`);
        setFriends(responseResp.data.data);
      };
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div className="">
      <UsersList users={friends} />
      <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
        <div className="text-white text-center font-kreon text-2xl mb-2">
          Friend Requests
        </div>
        {friendRequests.length === 0 ? (
          <div className="text-gray-400">No pending friend requests</div>
        ) : (
          friendRequests.map((request) => (
            <div
              key={request.id}
              className="bg-[#393E46] m-1 mt-2 p-3 w-full rounded-lg"
            >
              <div className="text-[#FFD369] font-kreon text-lg mb-2">
                {request.from_user.username}
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleFriendRequest(request.id, "accept")}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleFriendRequest(request.id, "reject")}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friends;
