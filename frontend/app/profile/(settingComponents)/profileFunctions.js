"use client";

import React from "react";
import FriendsInfo from "../../friends/FriendInfo";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Axios from "../../Components/axios";
import toast from "react-hot-toast";

const UserProfile = () => {
  const { userId } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [FriendshipStatu, setFriendshipStatu] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get(`/api/users/${userId}/`);
        setUserData(response.data.data);

        const userResponse = await Axios.get("/api/user_profile/");
        console.log("USER RESPONSE", userResponse.data);
        setCurrentUserId(userResponse.data.id);

        const friendshipResponse = await Axios.get(
          `/api/friends/friendship_status/${userId}/`
        );
        setFriendshipStatu(friendshipResponse.data);
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }


  return (
    <div className="container mx-auto p-4">
      <button
        className="bg-blue-500 m-2 text-white p-2 rounded-md"
        onClick={() => {
          sendFriendRequest(userId);
        }}
      >
        Send Friend Request
      </button>
      <button
        className="bg-blue-500 m-2 text-white p-2 rounded-md"
        onClick={() => {
          friendshipStatus(userId);
        }}
      >
        Friendship Status
      </button>
      <button
        className="bg-blue-500 m-2 text-white p-2 rounded-md"
        onClick={() => {
          blockUser(userId);
        }}
      >
        Block User
      </button>
      <button
        className="bg-blue-500 m-2 text-white p-2 rounded-md"
        onClick={() => {
          unblockUser(userId);
        }}
      >
        Unblock User
      </button>
      {/* remove friendship */}
      <button
        className="bg-blue-500 m-2 text-white p-2 rounded-md"
        onClick={() => {
          removeFriendship(userId);
        }}
      >
        Remove Friendship
      </button>
      {userData && (
        <FriendsInfo
          friend={userData} // Pass userData as friend prop
          history={[]} // Pass empty history or actual history if available
        />
      )}
    </div>
  );
};
















// Send friend request
export const sendFriendRequest = async (userId, currentUserId, FriendshipStatu) => {
  console.log("CURRENT USER ID", currentUserId);
  console.log("USER ID", userId);
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot send friend request to yourself");
    return;
  }
  // console.log('FRIENDSHIP STATUS', FriendshipStatu.can_send_request);
  if (FriendshipStatu.can_send_request === true) {
    try {
      const response = await Axios.post(
        `/api/friends/send_friend_request/${userId}/`
      );
      console.log(response.data);
      await friendshipStatus(userId);
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


// Friendship status
export const friendshipStatus = async (userId) => {
  try {
    const response = await Axios.get(
      `/api/friends/friendship_status/${userId}/`
    );
    console.log("FRIENDSHIP STATUS", response.data);
    // setFriendshipStatu(response.data);
  } catch (err) {
    console.error(err);
  }
};



// Friend requests
export const friendRequests = async (userId) => {
  try {
    const response = await Axios.get(`/api/friends/friend_requests/`);
    console.log("FRIEND REQUESTS", response.data);
  } catch (err) {
    console.error(err);
  }
};


// Block user
export const blockUser = async (userId, currentUserId, FriendshipStatu) => {
  console.log("CURRENT USER ID", currentUserId);
  console.log("USER ID", userId);
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot block yourself");
    return;
  }
  try {
    // Check if user is already blocked
    if (FriendshipStatu?.is_blocked) {
      toast.error("User is already blocked");
      return;
    }
    const response = await Axios.post(`/api/friends/block_user/${userId}/`);
    console.log(response.data);
    await friendshipStatus(userId);
    toast.success("User blocked successfully");
  } catch (err) {
    // If we get a 400 error but it's because the user is already blocked,
    // we can still show a success message
    if (
      err.response?.status === 400 &&
      err.response?.data?.error === "User is already blocked"
    ) {
      await friendshipStatus(userId);
      toast.success("User is blocked");
    } else if (err.response?.data?.error) {
      toast.error(err.response.data.error);
    }
  }
};


// Unblock user
export const unblockUser = async (userId) => {
  console.log("CURRENT USER ID", currentUserId);
  console.log("USER ID", userId);
  if (String(userId) === String(currentUserId)) {
    toast.error("Cannot unblock yourself");
    return;
  }
  if (FriendshipStatu?.is_blocked === true) {
    try {
      await Axios.post(`/api/friends/unblock_user/${userId}/`);
      await friendshipStatus(userId);
      toast.success("User unblocked successfully");
    } catch (err) {
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      }
    }
  } else {
    toast.error("User is not blocked");
  }
};

// Remove friendship
export const removeFriendship = async (userId, FriendshipStatu) => {
  if (FriendshipStatu.friendship_status === null) {
    toast.error("No friendship to remove");
    return;
  }
  try {
    const response = await Axios.delete(
      `/api/friends/remove_friendship/${userId}/`
    );
    console.log(response.data);
    await friendshipStatus(userId);
    toast.success("Friendship removed successfully");
  } catch (err) {
    console.error(err);
  }
};