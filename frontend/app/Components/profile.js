// ---------------------------------------------------------------------------------------------------------------------------------------------------
//|                                                                                                                                                   |
//|               profile should have history of user matches with details and win & loses stats and game counter and level of user                   |
//|               if he's a stranger then send friend request and block user button should be there with just his win and lose stats and game counter |
//|               if he's a friend then remove friendship and block user button should be there with all the details of his game stats                |
//|                                                                                                                                                   |
// ---------------------------------------------------------------------------------------------------------------------------------------------------
"use client";

import React, { useEffect, useState } from "react";
import "../globals.css";
import Axios from "./axios";
import toast from "react-hot-toast";
import GameData from "../user-profile/[userId]/(profileComponents)/gameData";
import {
  sendFriendRequest,
  removeFriendship,
  blockUser,
  unblockUser,
} from "../user-profile/[userId]/(profileComponents)/profileFunctions";

import { useWebSocketContext } from "../Components/WebSocketContext";

const Profile = ({ userData, myProfile }) => {
  


  // --------------------------------------------------------------------------------------


  const userId = userData.id;
  let currentUserId;
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { sendGameRequest } = useWebSocketContext();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userResponse = await Axios.get("/api/user_profile/");
        currentUserId = userResponse.data.id;
        const friendshipResponse = await Axios.get(
          `/api/friends/friendship_status/${userId}/`
        );
        setFriendshipStatus(friendshipResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const getUserRelationship = () => {
    if (friendshipStatus.is_blocked_by_current_user) return "blocked_by_me";
    if (friendshipStatus.is_blocked_by_other_user) return "blocked_by_other";
    if (friendshipStatus.friendship_status === "accepted" && !friendshipStatus.is_blocked_by_current_user && !friendshipStatus.can_send_request) return "friend";
    if (friendshipStatus.friendship_status === "pending") return "pending";
    if (friendshipStatus.can_send_request) return "stranger";
    return "unknown"; // Fallback case
  };

  const userRelationship = getUserRelationship();

  console.log("relationship", userRelationship);

  const renderButtons = () => {
    switch (userRelationship) {
      case "pending":
        return (
          <button
            className="bg-[#FF6347] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() =>
              removeFriendship(userId, friendshipStatus, setFriendshipStatus)
            }
            disabled={loading}
          >
            Cancel Request
          </button>
        );
      case "stranger":
        return (
          <>
            <button
              className="bg-[#00D1FF] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() =>
                sendFriendRequest(
                  userId,
                  currentUserId,
                  friendshipStatus,
                  setFriendshipStatus
                )
              }
              disabled={loading}
            >
              Send Friend Request
            </button>
            <button
              className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() =>
                blockUser(
                  userId,
                  currentUserId,
                  friendshipStatus,
                  setFriendshipStatus
                )
              }
              disabled={loading}
            >
              Block User
            </button>
          </>
        );
      case "friend":
        return (
          <>
            <button
              className="bg-[#FF6347] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() =>
                removeFriendship(userId, friendshipStatus, setFriendshipStatus)
              }
              disabled={loading}
            >
              Remove Friendship
            </button>
            <button
              className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() =>
                blockUser(
                  userId,
                  currentUserId,
                  friendshipStatus,
                  setFriendshipStatus
                )
              }
              disabled={loading}
            >
              Block User
            </button>
            <button
              className="bg-blue-500 m-2 text-white p-2 rounded-md"
              onClick={() => sendGameRequest(userId)}
              disabled={loading}
            >
              Send Game Request
            </button>
          </>
        );
      case "blocked_by_me":
        return (
          <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() =>
              unblockUser(
                userId,
                currentUserId,
                friendshipStatus,
                setFriendshipStatus
              )
            }
            disabled={loading}
          >
            Unblock User
          </button>
        );
      case "blocked_by_other":
        return (
          <span className="text-red-500 m-2 p-2 h-[50px] w-[150px] rounded-lg">
            You are blocked by this user
          </span>
        );
      default:
        return (
          <span className="text-red-500 m-2 p-2 h-[50px] w-[150px] rounded-lg">
            Error: Unknown relationship
          </span>
        );
    }
  };


  // --------------------------------------------------------------------------------------


    const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;


    console.log("userData and friendshipStatus", userData, friendshipStatus);
    return (
      <div className="h-[1100px] flex flex-col m-2 bg-[#131313] fade-in-globale rounded-xl border border-[#FFD369]">
        <div className="h-[30%] flex flex-col">
          <div className="w-full flex flex-col items-center justify-center m-4">
            {!myProfile && (
              <div className="relative">
                <div className="w-[130px] h-[130px] absolute">
                  <div
                    className={`absolute w-5 h-5 rounded-full right-20 bottom-1 bg-${
                      userData.is_online ? "green" : "red"
                    }-500 border border-[#FFD369]`}
                  ></div>
                </div>
              </div>
            )}
            <img
              src={userData.image || "../user_img.svg"}
              alt="user_img"
              width="130"
              height="130"
              className="rounded-full border-2 border-[#FFD369]"
            />
            <div className="m-2 text-lg dark:text-[#FFD369]">
              {userData.username}
            </div>
          </div>
          <div className="w-full flex justify-center">
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
          <div className="h-[10%] flex  items-center justify-center">
            {renderButtons()}
          </div>
        )}
      </div>
    );
};

export default Profile;
