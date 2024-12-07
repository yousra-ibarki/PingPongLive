"use client";

import React from "react";
import "../../globals.css";
import Axios from "../../Components/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GameData from "./gameData";
import { sendFriendRequest, friendshipStatus, blockUser, unblockUser } from "./(profileComponents)/profileFunctions";

const Profile = ({ userId }) => {
  // const [friendRequests, setFriendRequests] = useState([]);
  let currentUserId = null;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: null,
    name: null,
    profileImage: null,
    rank: null,
    level: null,
    gameWins: null,
    gameLosses: null,
    achievements: [],
    history: [],
  });
  const [FriendshipStatus, setFriendshipStatus] = useState(null);
  let myProfile = false;

  // const [FriendshipStatus, setFriendshipStatus] = useState(null);

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // const friendRequestsResponse = await Axios.get("/api/friends/friend_requests/");
        // setFriendRequests(friendRequestsResponse.data);
        let response = await Axios.get("/api/user_profile/");
        currentUserId = response.data.id;
        if (toString(userId) !== toString(currentUserId)) {
          myProfile = true;
          response = await Axios.get(`/api/users/${userId}/`);
        } else {
          myProfile = false;
        }
        setUserData({
          id: response.data.id,
          isOnline: response.data.is_online,
          name: response.data.username,
          profileImage: response.data.image,
          rank: response.data.rank,
          level: response.data.level,
          winRate: response.data.winrate,
          LeaderboardRank: response.data.leaderboard_rank,
          gameWins: response.data.wins,
          gameLosses: response.data.losses,
          achievements: response.data.achievements,
          history: [],
        });
        console.log("MY RESPONSE", response.data);
        
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId)
      fetchUserData();
  }, [userId]);
  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  // if (!userData || isLoading) {
  //   return (
  //     <div className="h-[1000px] flex items-center justify-center m-2 bg-[#131313] fade-in-globale">
  //       <div className="h-[60px] w-[60px] loader"></div>
  //     </div>
  //   );
  // }
  if (error) {
    return <div>Error: {error}</div>;
  }

  // const handleFriendRequest = async (requestId, action) => {
  //   try {
  //     await Axios.post('/api/friends/friend_requests/', {
  //       request_id: requestId,
  //       action: action
  //     });

  //     // Refresh friend requests list
  //     const response = await Axios.get("/api/friends/friend_requests/");
  //     setFriendRequests(response.data);
  //   } catch (error) {
  //     console.error("Error handling friend request:", error);
  //   }
  // };
  return (
    <div className="h-[1000px] flex flex-col m-2 bg-[#131313] fade-in-globale">
      <div className="h-[30%] flex flex-col">
        <div className=" w-full flex flex-col items-center justify-center m-4">
          <img
            src={userData.profileImage || "../user_img.svg"}
            alt="user_img"
            width="130"
            height="130"
            className=" rounded-full"
          />
          <div className="text-base m-4 text-yellow-700 dark:text-[#FFD369]">
            {userData.name}
          </div>
        </div>
        <div className="w-full flex justify-center ">
          <div className="flex w-[95%] bg-gray-200 rounded-xl h-10 dark:bg-gray-700">
            <div
              className="bg-[#FFD369] h-10 rounded-xl"
              style={{ width: `${levelPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="h-[3%] flex flex-col">
        <span className="text-[#FFD369] text-center font-kreon text-2xl">
          Level : {Math.floor(userData.level)}
        </span>
      </div>

      <GameData userData={userData} />
      {
        <div className="flex items-center text-black text-center  justify-evenly">
          {/* add button to send friend request  */}
          <button
            className="bg-[#00D1FF] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              sendFriendRequest(userId, currentUserId);
            }}
          >
            Send Friend Request
          </button>
          {/* add button to see friendship status  */}
          {/* <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              friendshipStatus(userId);
            }}
          >
            Friendship Status
          </button> */}
          {/* button to block user */}
          <button
            className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              blockUser(userId);
            }}
          >
            Block User
          </button>
          {/* button to unblock user */}
          {/* <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              unblockUser(userId);
            }}
          >
            Unblock User
          </button> */}
        </div>
      }
    </div>
  );
};

export default Profile;

// ---------------------------------- friend requests ----------------------------------
{
  /* <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
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
</div> */
}
