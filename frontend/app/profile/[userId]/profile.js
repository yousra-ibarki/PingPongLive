"use client";

import React from "react";
import Axios from "../../Components/axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import GameData from "./gameData";

const Profile = () => {
  // const [friendRequests, setFriendRequests] = useState([]);
  const { userId } = useParams();
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
  let myProfile = false;

  // const [FriendshipStatus, setFriendshipStatus] = useState(null);

  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // const friendRequestsResponse = await Axios.get("/api/friends/friend_requests/");
        // setFriendRequests(friendRequestsResponse.data);
        const response = await Axios.get("/api/user_profile/");
        currentUserId = response.data.id;
        const userResponse = await Axios.get(`/api/users/${userId}/`);
        if (toString(userId) === toString(currentUserId)) {
          myProfile = true;
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
            history: response.data.history,
          });
          console.log("MY RESPONSE", response.data);
        } else {
          myProfile = false;
          setUserData({
            id: userResponse.data.data.id,
            name: userResponse.data.data.username,
            profileImage: userResponse.data.data.profile_image,
            isOnline: userResponse.data.data.is_online,
            rank: null,
            level: null,
            winRate: null,
            gameWins: null,
            gameLosses: null,
            achievements: [],
            history: [],
            leaderboard_rank: null,
          });
          console.log("USER RESPONSE", userResponse.data);
        }
      } catch (error) {
        setError(error || "An error occurred");
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId)
      fetchUserData();
  }, [userId]);
  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  if (!userData) {
    return <div>Loading...</div>; // Handle loading state
  }
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
      <div className="md:h-[20%] h-[15%] flex relative">
        <div className="flex flex-row items-center justify-end h-full w-[14%] top-0 left-0 ml-2 mt-4">
          <img
            src={userData.profileImage || "../user_img.svg"}
            alt="user_img"
            className="w-32 h-32 rounded-full"
          />
        </div>
        <div className="ab w-[80%] mr-2 flex flex-col justify-between">
          <div className="block flex-grow"></div>
          <div className="mb-1 ml-10 text-base font-medium text-yellow-700 dark:text-[#FFD369]">
            {userData.name}
          </div>
          <div className="w-full ml-2 bg-gray-200 rounded-xl h-10 mb-6 dark:bg-gray-700">
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
      {myProfile && (
        <div className="container mx-auto p-4">
          {/* add button to send friend request  */}
          <button
            className="bg-blue-500 m-2 text-white p-2 rounded-md"
            onClick={() => {
              sendFriendRequest(userId);
            }}
          >
            Send Friend Request
          </button>
          {/* add button to see friendship status  */}
          <button
            className="bg-blue-500 m-2 text-white p-2 rounded-md"
            onClick={() => {
              friendshipStatus(userId);
            }}
          >
            Friendship Status
          </button>
          {/* button to block user */}
          <button
            className="bg-blue-500 m-2 text-white p-2 rounded-md"
            onClick={() => {
              blockUser(userId);
            }}
          >
            Block User
          </button>
          {/* button to unblock user */}
          <button
            className="bg-blue-500 m-2 text-white p-2 rounded-md"
            onClick={() => {
              unblockUser(userId);
            }}
          >
            Unblock User
          </button>
          {/* {userData && (
         <FriendsInfo
           friend={userData} // Pass userData as friend prop
           history={[]} // Pass empty history or actual history if available
         />
       )} */}
          {/* <FriendsInfo userId={userId} /> */}
        </div>
      )}
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
