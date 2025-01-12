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
  friendshipStatusFunc,
} from "../user-profile/[userId]/(profileComponents)/profileFunctions";
import { useWebSocketContext } from "../Components/WebSocketContext";

const Profile = ({ userData, myProfile }) => {
  const userId = userData.id;
  const [friendshipStatus, setFriendshipStatus] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currUser, setCurrUser] = useState(null);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [blockedByHim, setBlockedByHim] = useState(false);
  const { sendGameRequest, sendFriendRequest, loggedInUser } = useWebSocketContext();
  const router = useRouter();

  useEffect(() => {
    setCurrUser(loggedInUser);
    fetchUserProfile();
    fetchBlockedUsers();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const friendshipResponse = await Axios.get(`/api/friends/friendship_status/${userId}/`);
      setFriendshipStatus(friendshipResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true);
      const blockedResponse = await Axios.get("/api/friends/blocked_users/");
      const blockedByResponse = await Axios.get("/api/friends/blocked_by_users/");
      updateBlockedStatus(blockedResponse.data, blockedByResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateBlockedStatus = (blockedUsers, blockedByUsers) => {
    const currentUserId = loggedInUser.id;
    const isBlockedByMe = blockedUsers.some(
      (user) => user.blocker.id === currentUserId && user.blocked.id === userId
    );
    const isBlockedByHim = blockedByUsers.some(
      (user) => user.blocker.id === userId && user.blocked.id === currentUserId
    );

    setBlockedByMe(isBlockedByMe);
    setBlockedByHim(isBlockedByHim);
    friendshipStatusFunc(userId, setFriendshipStatus);
  };

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

  const handleFriendRequest = async (userId, action) => {
    try {
      const requestId = await fetchFriendRequestId(userId);
      if (!requestId) {
        toast.error("Invalid friend request. The request does not exist, please refresh the page");
        return;
      }
      await Axios.post("/api/friends/friend_requests/", { request_id: requestId, action });
      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const sendRequest = async () => {
    try {
      await sendFriendRequest(userId);
      await new Promise((resolve) => setTimeout(resolve, 100));
      fetchUserProfile();
      toast.success("Friend request sent successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const getUserRelationship = () => {
    if (friendshipStatus.is_blocked) {
      if (blockedByMe) return "blocked_by_me";
      if (blockedByHim) return "blocked_by_him";
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

  const userRelationship = getUserRelationship();

  const renderButtons = () => {
    switch (userRelationship) {
      case "pending":
        return (
          <button
            className="bg-[#FF6347] m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => removeFriendship(userId, friendshipStatus, setFriendshipStatus)}
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
              onClick={() => blockUser(userId, loggedInUser.id, friendshipStatus, setFriendshipStatus)}
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
              onClick={() => removeFriendship(userId, friendshipStatus, setFriendshipStatus)}
              disabled={loading}
            >
              Remove Friendship
            </button>
            <button
              className="bg-[#FF0000] m-2 p-2 h-[50px] w-[150px] rounded-lg"
              onClick={() => blockUser(userId, loggedInUser.id, friendshipStatus, setFriendshipStatus)}
              disabled={loading}
            >
              Block User
            </button>
            <button
              className="bg-blue-500 m-2 text-white p-2 rounded-md"
              onClick={() => sendGameRequest(userId)}
            >
              Send Game Request
            </button>
          </>
        );
      case "blocked_by_me":
        return (
          <button
            className="bg-blue-500 m-2 p-2 h-[50px] w-[150px] rounded-lg"
            onClick={() => unblockUser(userId, loggedInUser.id, friendshipStatus, setFriendshipStatus)}
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

  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  return (
    <div className="h-[1100px] flex flex-col m-2 bg-[#131313] font-semibold fade-in-globale rounded-xl border border-[#FFD369]">
      <div className="h-[30%] flex flex-col">
        <div className="flex flex-col items-center justify-center m-4">
          {!myProfile && userRelationship === "friend" && (
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
            className="rounded-full h-[130px] w-[130px] border-2 border-[#FFD369]"
          />
          <div className="m-2 text-lg dark:text-[#FFD369]">{userData.username}</div>
        </div>
        <div className="w-full flex justify-center">
          <div className="flex w-[95%] bg-gray-200 rounded-xl h-10 dark:bg-gray-700">
            <div className="bg-[#FFD369] h-10 rounded-xl" style={{ width: `${levelPercentage}%` }}></div>
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
        <div className="h-[10%] flex items-center justify-center">
          {renderButtons()}
        </div>
      )}
    </div>
  );
};

export default Profile;