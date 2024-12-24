<<<<<<< HEAD
// In WebSocketContext.js, update the handleNotification function:

const handleNotification = (data) => {
  console.log("handleNotification called with:", data);

  // Ensure we have a notification ID
  const notificationId = data.notification_id || data.id;

  if (!notificationId) {
      console.error("Notification received without ID:", data);
      return;
  }

  // Update notifications state
  setState(prev => ({
      ...prev,
      notifications: [{
          id: notificationId,
          notification_id: notificationId,
          type: data.type,
          message: data.message,
          created_at: data.timestamp,
          is_read: false,
          sender: data.from_user || data.sender_username,
          ...(data.type === 'notify_friend_request' && { friend_request_id: data.friend_request_id }),
          ...(data.type === 'game_response' && { 
              accepted: data.accepted,
              room_name: data.room_name 
          })
      }, ...prev.notifications].slice(0, 50)
  }));

  // Handle chat notifications
  if (data.type === "notify_chat_message") {
      // check if the user is in the chat page
      const isChatPage = window.location.pathname.includes("/chat");
      if (isChatPage) {
          return;
      }
      let message = data.message;
      if (message.length > 100) {
          message = message.substring(0, 40) + "...";
      }
      const toastContent = (
          <div className="flex items-start gap-3 bg-[#222831]">
              <div className="flex-1">
                  <p className="font-kreon text-white">Chat Message from</p>
                  <p className="text-[#FFD369]">{data.from_user}</p>
                  <p className="text-white">{message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                      {formatTimestamp(data.timestamp)}
                  </p>
              </div>
          </div>
      );

      toast.custom(toastContent, {
          duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.CHAT_MESSAGE].duration,
          style: {
              background: "#ffffff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
      });
      return;
  }
  
  // Handle game requests
  else if (data.type === "notify_game_request") {
      const toastContent = (
          <div className="flex items-start gap-3 bg-[#222831]">
              <div className="flex-1">
                  <p className="font-kreon">Game Request</p>
                  <p>{data.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                      {formatTimestamp(data.timestamp)}
                  </p>
                  <div className="flex gap-2 mt-2">
                      <button
                          onClick={() => handleGameResponse(data.notification_id, true, data)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                          Accept
                      </button>
                      <button
                          onClick={() => handleGameResponse(data.notification_id, false, data)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                          Decline
                      </button>
                  </div>
              </div>
          </div>
      );

      toast.custom(toastContent, {
          duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.GAME_REQUEST].duration,
          style: {
              background: "#ffffff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
      });
      return;
  }
  
  // Handle friend requests
  else if (data.type === "notify_friend_request") {
      const toastContent = (
          <div className="flex items-start gap-3 bg-[#222831]">
              <div className="flex-1">
                  <p className="font-kreon">Friend Request</p>
                  <p>{data.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                      {formatTimestamp(data.timestamp)}
                  </p>
                  <div className="flex gap-2 mt-2">
                      <button
                          onClick={() => handleFriendRequest(data, true)}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                          Accept
                      </button>
                      <button
                          onClick={() => handleFriendRequest(data, false)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                          Decline
                      </button>
                  </div>
              </div>
          </div>
      );

      toast.custom(toastContent, {
          duration: NOTIFICATION_CONFIG[NOTIFICATION_TYPES.FRIEND_REQUEST].duration,
          style: {
              background: "#ffffff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
      });
      return;
  }
  
  // Handle game responses - moved into the main notification handler
  else if (data.type === 'game_response') {
      const toastContent = (
          <div className="flex items-start gap-3 bg-[#222831]">
              <div className="flex-1">
                  <p className="font-kreon">Game Response</p>
                  <p className="text-[#FFD369] font-medium">{data.from_user}</p>
                  <p className="text-white">
                      {data.accepted 
                          ? "accepted your game request" 
                          : "declined your game request"
                      }
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                      {formatTimestamp(data.timestamp)}
                  </p>
                  {data.accepted && (
                      <div className="mt-2">
                          <button
                              onClick={() => router.push('/game')}
                              className="px-4 py-2 bg-[#FFD369] text-[#222831] rounded-md 
                                       hover:bg-[#FFD369]/90 transition-colors font-medium"
                          >
                              Join Game
                          </button>
                      </div>
                  )}
              </div>
          </div>
      );
          
      toast.custom(toastContent, {
          duration: 5000,
          style: {
              background: "#ffffff",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          },
      });
      return;
  }

  // Handle other notification types
  const config = NOTIFICATION_CONFIG[data.type];
  if (config) {
      showNotificationToast(data);
  } else {
      console.log("No handler found for notification type:", data.type);
  }
};
=======
"use client";

import React from 'react';
import FriendsInfo from '../../friends/FriendInfo';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Axios from '../../Components/axios';
import toast from 'react-hot-toast';
import { useWebSocketContext } from '../../Components/WebSocketContext';

const UserProfile = () => {
  const { userId } = useParams();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [FriendshipStatu, setFriendshipStatu] = useState(null);
  const { sendGameRequest, sendNotification } = useWebSocketContext();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get(`/api/users/${userId}/`);
        console.log('USER RESPONSE******', response.data);
        setUserData(response.data.data);

        const userResponse = await Axios.get('/api/user_profile/');
        console.log('USER RESPONSE', userResponse.data);
        setCurrentUserId(userResponse.data.id);
  
        const friendshipResponse = await Axios.get(`/api/friends/friendship_status/${userId}/`);
        setFriendshipStatu(friendshipResponse.data);
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
    console.log('CURRENT USER ID', currentUserId);
    console.log('USER ID', userId);
    if (String(userId) === String(currentUserId)) {
      toast.error('Cannot send friend request to yourself');
      return;
    }
    
    if (FriendshipStatu.can_send_request === true) {
      try {
        // Remove API call
        // const response = await Axios.post(`/api/friends/send_friend_request/${userId}/`);
        
        // Instead, send via WebSocket
        sendNotification(JSON.stringify({
          type: 'send_friend_request',
          to_user_id: userId
        }));
        
        console.log('FRIENDSHIP STATUS11111', FriendshipStatu.can_send_request);
        await friendshipStatus(userId);
        toast.success('Friend request sent successfully');
      } catch (err) {
        toast.error('Cannot send friend request1');
      }
    } else {
      toast.error('Cannot send friend request2');
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

  const blockUser = async (userId) => {
    console.log('CURRENT USER ID', currentUserId);
    console.log('USER ID', userId);
    if (String(userId) === String(currentUserId)) {
        toast.error('Cannot block yourself');
        return;
    }
    try {
        // Check if user is already blocked
        if (FriendshipStatu?.is_blocked) {
            toast.error('User is already blocked');
            return;
        }

        const response = await Axios.post(`/api/friends/block_user/${userId}/`);
        console.log(response.data);
        await friendshipStatus(userId);
        toast.success('User blocked successfully');
    } catch (err) {
        // If we get a 400 error but it's because the user is already blocked,
        // we can still show a success message
        if (err.response?.status === 400 && err.response?.data?.error === "User is already blocked") {
            await friendshipStatus(userId);
            toast.success('User is blocked');
        } else if (err.response?.data?.error) {
            toast.error(err.response.data.error);
        }
    }
  };

  const unblockUser = async (userId) => {
    console.log('CURRENT USER ID', currentUserId);
    console.log('USER ID', userId);
    if (String(userId) === String(currentUserId)) {
        toast.error('Cannot unblock yourself');
        return;
    }
    if (FriendshipStatu?.is_blocked === true) {
      try {
            await Axios.post(`/api/friends/unblock_user/${userId}/`);
            await friendshipStatus(userId);
            toast.success('User unblocked successfully');
      } catch (err) {
          if (err.response?.data?.error) {
            toast.error(err.response.data.error);
          }
      }
    } else {
      toast.error('User is not blocked');
    }
  };

  const removeFriendship = async (userId) => {
    if (FriendshipStatu.friendship_status === null) {
      toast.error('No friendship to remove');
      return;
    }
    try {
      const response = await Axios.delete(`/api/friends/remove_friendship/${userId}/`);
      console.log(response.data);
      await friendshipStatus(userId);
      toast.success('Friendship removed successfully');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        
        sendFriendRequest(userId);
      }}
      >
        Send Friend Request
      </button>
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        friendshipStatus(userId);
      }}
      
      >
        Friendship Status
      </button>
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        blockUser(userId);
      }}
      >
        Block User
      </button>
       <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        unblockUser(userId);
      }}
      >
        Unblock User
      </button>
      {/* remove friendship */}
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        removeFriendship(userId);
      }}
      >
        Remove Friendship
      </button>
      {/* send game request */}
      <button className="bg-blue-500 m-2 text-white p-2 rounded-md"
      onClick={() => {
        sendGameRequest(userId);
      }}
      >
        Send Game Request
      </button>
      {userData && (
        <FriendsInfo 
          friend={userData}  // Pass userData as friend prop
          history={[]}      // Pass empty history or actual history if available
        />
      )}
    </div>
  );
}

export default UserProfile; 
>>>>>>> 2dfb18c5c5743ec13d493be49ef07e887e61c6bd
