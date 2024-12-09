"use client";

import React from "react";
import "../globals.css";
import Axios from "./axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GameData from "../userProfile/[userId]/gameData";
// import {
//   sendFriendRequest,
//   friendshipStatus,
//   blockUser,
//   unblockUser,
// } from "../userProfile/[userId]/(profileComponents)/profileFunctions";

const Profile = ({ userData , myProfile }) => {
  const userId = userData.id;
  const [currentUserId, setCurrentUserId] = useState(null);
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const [error, setError] = useState(null);
  const [Loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userResponse = await Axios.get("/api/user_profile/");
        setCurrentUserId(userResponse.data.id);

        const friendshipResponse = await Axios.get(
          `/api/friends/friendship_status/${userId}/`
        );
        setFriendshipStatus(friendshipResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);




  
  // friendship status -----------------------------------------------------------

  const friendshipStatusFunc = async (userId) => {
    try {
      // await Axios.get(`/api/friends/friendship_status/${userId}/`);
      const response = await Axios.get(
        `/api/friends/friendship_status/${userId}/`
      );
      console.log("FRIENDSHIP STATUS", response.data);
      setFriendshipStatus(response.data);
      console.log("FRIENDSHIP STATUS ---- useEffec", friendshipStatus);
    } catch (err) {
      console.error(err);
    }
  };



  // send friend request ---------------------------------------------------------
  const sendFriendRequest = async (userId) => {
    console.log("CURRENT USER ID", currentUserId);
    console.log("USER ID", userId);
    if (String(userId) === String(currentUserId)) {
      toast.error("Cannot send friend request to yourself");
      return;
    }
    // console.log('FRIENDSHIP STATUS', FriendshipStatu.can_send_request);
    if (friendshipStatus.can_send_request === true) {
      try {
        const response = await Axios.post(
          `/api/friends/send_friend_request/${userId}/`
        );
        console.log(response.data);
        await friendshipStatusFunc(userId);
        toast.success("Friend request sent successfully");
      } catch (err) {
        if (err.response?.data?.error) {
          toast.error(err.response.data.error);
        }
      }
    } else {
      // console.log(FriendshipStatu.can_send_request);
      toast.error("Cannot send friend request");
    }
  };
  
  // friend requests ------------------------------------------------------------- 

  const friendRequests = async (userId) => {
    try {
      const response = await Axios.get(`/api/friends/friend_requests/`);
      console.log("FRIEND REQUESTS", response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // block user ------------------------------------------------------------------

  // const blockUser = async (userId) => {
  //   console.log("CURRENT USER ID", currentUserId);
  //   console.log("USER ID", userId);
  //   if (String(userId) === String(currentUserId)) {
  //     toast.error("Cannot block yourself");
  //     return;
  //   }
  //   try {
  //     // Check if user is already blocked
  //     if (friendshipStatus?.is_blocked) {
  //       toast.error("User is already blocked");
  //       return;
  //     }

  //     const response = await Axios.post(`/api/friends/block_user/${userId}/`);
  //     console.log(response.data);
  //     await friendshipStatusFunc(userId);
  //     toast.success("User blocked successfully");
  //   } catch (err) {
  //     // If we get a 400 error but it's because the user is already blocked,
  //     // we can still show a success message
  //     if (
  //       err.response?.status === 400 &&
  //       err.response?.data?.error === "User is already blocked"
  //     ) {
  //       await friendshipStatusFunc(userId);
  //       toast.success("User is blocked");
  //     } else if (err.response?.data?.error) {
  //       toast.error(err.response.data.error);
  //     }
  //   }
  // };

  // // unblock user ---------------------------------------------------------------

  // const unblockUser = async (userId) => {
  //   console.log("CURRENT USER ID", currentUserId);
  //   console.log("USER ID", userId);
  //   if (String(userId) === String(currentUserId)) {
  //     toast.error("Cannot unblock yourself");
  //     return;
  //   }
  //   if (friendshipStatus?.is_blocked === true) {
  //     try {
  //       await Axios.post(`/api/friends/unblock_user/${userId}/`);
  //       await friendshipStatusFunc(userId);
  //       toast.success("User unblocked successfully");
  //     } catch (err) {
  //       if (err.response?.data?.error) {
  //         toast.error(err.response.data.error);
  //       }
  //     }
  //   } else {
  //     toast.error("User is not blocked");
  //   }
  // };

  // //remove friendship -----------------------------------------------------------

  // const removeFriendship = async (userId) => {
  //   if (friendshipStatus.friendship_status === null) {
  //     toast.error("No friendship to remove");
  //     return;
  //   }
  //   try {
  //     const response = await Axios.delete(
  //       `/api/friends/remove_friendship/${userId}/`
  //     );
  //     console.log(response.data);
  //     await friendshipStatusFunc(userId);
  //     toast.success("Friendship removed successfully");
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  //-------------------------------------------------------------------------------




  // if (error) {
  //   toast.error(error);
  // }
  if (Loading) {
    return (
      <div className="h-[100px] flex items-center justify-center m-2  fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
  }

  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  return (
    <div className="h-[1200px] flex flex-col m-2 bg-[#131313] fade-in-globale">
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
      {!myProfile && (
        <div className="flex items-center text-black text-center  justify-evenly">
          <button
            className="bg-[#00D1FF] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              sendFriendRequest(userId);
            } }
          >
            Send Friend Request
          </button>
          {/* <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              friendshipStatus(userId);
            }}
          >
            Friendship Status
          </button>

          <button
            className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              blockUser(userId);
              if (friendshipStatus.is_blocked) {
                toast.error("User is already blocked");
              }
            }}
          >
            Block User
          </button>
         
          <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => {
              unblockUser(userId);
            }}
          >
            Unblock User
          </button> */}
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
