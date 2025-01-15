"use client";

import React, { useEffect, useState } from "react";
import "../../globals.css";
import Axios from "./axios";
import toast from "react-hot-toast";
import GameData from "../user-profile/[userId]/(profileComponents)/gameData";
import { useRouter } from "next/navigation";
import {
  removeFriendship,
  blockUser,
  unblockUser,
} from "../user-profile/[userId]/(profileComponents)/profileFunctions";
import { useWebSocketContext } from "../Components/WebSocketContext";

/**
 * Custom hook to fetch user profile and block status.
 * @param {string} userId - The ID of the user whose profile is being fetched.
 * @param {object} loggedInUser - The currently logged-in user.
 * @returns {object} - Contains friendshipStatus, blockStatus, loading, and error states.
 */
const useUserProfile = (userId, loggedInUser) => {
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const [blockStatus, setBlockStatus] = useState({ is_blocked: false, message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches friendship status and block status concurrently.
   */
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const [friendshipResponse, blockResponse] = await Promise.all([
        Axios.get(`/api/friends/friendship_status/${userId}/`),
        Axios.get(`/api/friends/block_check/${userId}/`),
      ]);
      console.log("FRIENDSHIP RESPONSE", friendshipResponse.data);
      console.log("BLOCK RESPONSE", blockResponse.data);
      setFriendshipStatus(friendshipResponse.data);
      setBlockStatus(blockResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { friendshipStatus, blockStatus, loading, error, fetchUserProfile };
};

/**
 * Determines the relationship status between the current user and the profile user.
 * @param {object} friendshipStatus - The friendship status data.
 * @param {object} blockStatus - The block status data.
 * @param {object} currUser - The currently logged-in user.
 * @returns {string} - The relationship status.
 */
const determineUserRelationship = (friendshipStatus, blockStatus, currUser) => {
  if (blockStatus.is_blocked) {
    return blockStatus.message === "You have blocked this user" ? "blocked_by_me" : "blocked_by_him";
  }

  if (friendshipStatus.friendship_status === "accepted" && !friendshipStatus.can_send_request)
    return "friend";
  if (friendshipStatus.friendship_status === "pending" && friendshipStatus.from_user === currUser.username)
    return "pending";
  if (friendshipStatus.friendship_status === "pending" && friendshipStatus.from_user !== currUser.username)
    return "accept";
  if (friendshipStatus.can_send_request) return "stranger";

  return "unknown";
};

const Profile = ({ userData, myProfile }) => {
  //if userData is null, return null
  if (!userData) return null;
  const userId = userData.id;
  const { sendGameRequest, sendFriendRequest, loggedInUser } = useWebSocketContext();
  const router = useRouter();
  const currentUser = loggedInUser;
  
  // Using the custom hook to fetch profile data
  const { friendshipStatus, blockStatus, loading, error, fetchUserProfile } = useUserProfile(userId, loggedInUser);

  /**
   * Fetches the ID of a friend request sent by the user.
   * @param {string} userId - The ID of the user who sent the friend request.
   * @returns {string|null} - The friend request ID or null if not found.
   */
  const fetchFriendRequestId = async (userId) => {
    try {
      const response = await Axios.get("/api/friends/friend_requests/");
      const request = response.data.find((req) => req.from_user.id === userId);
      return request ? request.id : null;
    } catch (error) {
      toast.error("Failed to fetch friend request ID");
      return null;
    }
  };

  /**
   * Handles accepting or rejecting a friend request.
   * @param {string} userId - The ID of the user related to the friend request.
   * @param {string} action - The action to perform ("accept" or "reject").
   */
  const handleFriendRequest = async (userId, action) => {
    try {
      const requestId = await fetchFriendRequestId(userId);
      if (!requestId) {
        toast.error("Invalid friend request. Please refresh the page.");
        return;
      }
      await Axios.post("/api/friends/friend_requests/", { request_id: requestId, action });
      fetchUserProfile(); // Refresh the profile data after action
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  /**
   * Sends a friend request to the user.
   */
  const sendRequest = async () => {
    try {
      await sendFriendRequest(userId);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay for server processing
      fetchUserProfile(); // Refresh the profile data after sending request
      toast.success("Friend request sent successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      toast.error(errorMessage);
    }
  };

  /**
   * Renders action buttons based on the user's relationship status.
   * @returns {JSX.Element|null} - The appropriate buttons or null.
   */
  const renderButtons = () => {
    switch (userRelationship) {
      case "pending":
        return (
          <button
            className="bg-[#FF6347] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => removeFriendship(userId, friendshipStatus, fetchUserProfile)}
            disabled={loading}
          >
            Cancel Request
          </button>
        );
      case "accept":
        return (
          <>
            <button
              className="bg-green-600 m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() => handleFriendRequest(userId, "accept")}
              disabled={loading}
            >
              Accept Request
            </button>
            <button
              className="bg-red-600 m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() => handleFriendRequest(userId, "reject")}
              disabled={loading}
            >
              Reject Request
            </button>
          </>
        );
      case "stranger":
        return (
          <>
            <button
              className="bg-[#FFD360] m-2 p-2 h-[50px] w-[150px] rounded-lg text-[#131313]"
              onClick={sendRequest}
              disabled={loading}
            >
              Send Request
            </button>
            <button
              className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg text-[#131313]"
              onClick={() => blockUser(userId, currentUser.id, friendshipStatus, fetchUserProfile)}
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
              onClick={() => removeFriendship(userId, friendshipStatus, fetchUserProfile)}
              disabled={loading}
            >
              Remove Friendship
            </button>
            <button
              className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() => blockUser(userId, currentUser.id, friendshipStatus, fetchUserProfile)}
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
            onClick={() => unblockUser(userId, currentUser.id, friendshipStatus, fetchUserProfile)}
            disabled={loading}
          >
            Unblock User
          </button>
        );
      case "blocked_by_him":
        return (
          <button className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg" disabled>
            Blocked
          </button>
        );
      default:
        return null;
    }
  };

  // Determine the user's relationship status
  const userRelationship = determineUserRelationship(friendshipStatus, blockStatus, currentUser);

  // Calculate the user's level percentage for the progress bar
  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;
  const realLevel = (levelPercentage / 100 + Math.floor(userData.level)).toFixed(2);

  return (
    <div className=" flex flex-col m-2 bg-[#131313] font-semibold fade-in-globale rounded-xl border border-[#FFD369]">
      {/* User Information Section */}
      <div className="h-[30%] flex flex-col">
        <div className="flex flex-col items-center justify-center m-4">
          {!myProfile && userRelationship === "friend" && (
            <div className="relative">
              <div className="w-[130px] h-[130px] absolute">
                {/* Online Status Indicator */}
                <div
                  className={`absolute w-5 h-5 rounded-full right-20 bottom-1 bg-${
                    userData.is_online ? "green" : "red"
                  }-500 border border-[#FFD369]`}
                ></div>
              </div>
            </div>
          )}
          {/* User Avatar */}
          <img
            src={userData.image || "../user_img.svg"}
            alt="user_img"
            className="rounded-full h-[130px] w-[130px] border-2 border-[#FFD369]"
          />
          {/* Username */}
          <div className="m-2 text-lg dark:text-[#FFD369]">{userData.username}</div>
        </div>
        {/* Level Progress Bar */}
        <div className="w-full flex justify-center">
          <div className={`flex w-[95%] bg-gray-200 rounded-xl h-10 dark:bg-gray-700`}
               title={`Real Level: ${realLevel}`}
          >
            <div
              className="bg-[#FFD369] h-10 rounded-xl"
              style={{
                width: `${levelPercentage}%`,
                animation: "widthTransition 1s forwards",
                borderRadius: `${levelPercentage === 100 ? "10px" : "10px 0 0 10px"}`
              }}
            ></div>
          </div>
        </div>
            
        <style jsx>{`
          @keyframes widthTransition {
            from {
              width: 0;
            }
            to {
              width: ${levelPercentage}%;
            }
          }
        `}</style>
      </div>
      {/* Level Indicator */}
      <div className="h-[3%] flex flex-col">
        <span className="text-[#FFD369] text-center font-kreon text-2xl">
          Level : {Math.floor(userData.level)}
        </span>
      </div>
      {/* Game Data Component */}
      {userData && <GameData userData={userData} />}
      {/* Action Buttons Section */}
      {!myProfile && (
        <div className="h-[10%] flex flex-col md:flex-row items-center justify-center">
          {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default Profile;