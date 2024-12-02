"use client";

import React from 'react';
import FriendsInfo from '../../friends/FriendInfo';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Axios from '../../Components/axios';

const UserProfile = () => {
  const { userId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [FriendshipStatu  , setFriendshipStatu] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get(`/api/users/${userId}/`);
        setUserData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
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

const sendFriendRequest = async (userId) => {
  try {
    await Axios.post(`/api/friends/send_friend_request/${userId}/`);
  } catch (err) {
    console.error(err);
  }
};

  const friendshipStatus = async (userId) => {
    try {
      // await Axios.get(`/api/friends/friendship_status/${userId}/`);
      const response = await Axios.get(`/api/friends/friendship_status/${userId}/`);
      console.log('FRIENDSHIP STATUS', response.data);
      setFriendshipStatu(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const friendRequests = async (userId) => {
    try {
      const response = await Axios.get(`/api/friends/friend_requests/`);
      console.log('FRIEND REQUESTS', response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const blockUser = async (userId) => {
    try {
      await Axios.post(`/api/friends/block_user/${userId}/`);
    } catch (err) {
      console.error(err);
    }
  };

  const unblockUser = async (userId) => {
    try {
      await Axios.post(`/api/friends/unblock_user/${userId}/`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* add button to send friend request  */}
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        
        sendFriendRequest(userId);
      }}
      >
        Send Friend Request
      </button>
      {/* add button to see friendship status  */}
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        friendshipStatus(userId);
      }}
      
      >
        Friendship Status
      </button>
      {/* button to block user */}
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        blockUser(userId);
      }}
      >
        Block User
      </button>
       {/* button to unblock user */}
       <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        unblockUser(userId);
      }}
      >
        Unblock User
      </button>
      {userData && (
        <FriendsInfo 
          friend={userData}  // Pass userData as friend prop
          history={[]}      // Pass empty history or actual history if available
        />
      )}
      {/* <FriendsInfo userId={userId} /> */}
    </div>
  );
}

export default UserProfile; 