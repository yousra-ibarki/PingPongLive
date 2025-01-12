"use client";
import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import UsersList from "./usersList";
import { toast } from "react-hot-toast";
import { useWebSocketContext } from "../Components/WebSocketContext";
import { unblockUser, friendshipStatusFunc } from "../user-profile/[userId]/(profileComponents)/profileFunctions";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const { loggedInUser } = useWebSocketContext();
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [userToUnblock, setUserToUnblock] = useState(null);

  useEffect(() => {
    try {
      const fetchFriendRequests = async () => {
        const response = await Axios.get("/api/friends/friend_requests/");
        setFriendRequests(response.data);
      };
      fetchFriendRequests();
    } catch (err) {
      toast.error(err.response.data.message);
    }
    try {
      const fetchFriends = async () => {
        const responseResp = await Axios.get(`/api/friends/`);
        setFriends(responseResp.data.data);
      };
      fetchFriends();
    } catch (err) {
      toast.error(err.response.data.message || "An error occurred");
    }

    try {
      const fetchBlockedUsers = async () => {
        const response = await Axios.get("/api/friends/blocked_users/");
        setBlockedUsers(response.data);
      };
      fetchBlockedUsers();
    } catch (err) {
      toast.error(err.response.data.message || "An error occurred");
    } 
  }, []);

  useEffect(() => {
    if (userToUnblock) {
      unblockUser(userToUnblock.id, loggedInUser.id, friendshipStatus, setFriendshipStatus);
      setBlockedUsers((prevBlockedUsers) => prevBlockedUsers.filter(user => user.id !== userToUnblock.id));
      setUserToUnblock(null);
    }
  }, [friendshipStatus, userToUnblock, loggedInUser.id]);

  const handleFriendRequest = async (requestId, action) => {
    try {
      const friendRequests = await Axios.get("/api/friends/friend_requests/");
      if (!friendRequests.data.find((request) => request.id === requestId)) {
        toast.error("Invalid friend request. the request does not exist, please refresh the page");
        return;
      }

      await Axios.post("/api/friends/friend_requests/", {
        request_id: requestId,
        action: action,
      });

      const response = await Axios.get("/api/friends/friend_requests/");
      setFriendRequests(response.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      const response = await Axios.get(`/api/friends/friendship_status/${user.id}/`);
      setFriendshipStatus(response.data);
      await unblockUser(user.id, loggedInUser.id, response.data, setFriendshipStatus);
      setBlockedUsers((prevBlockedUsers) => prevBlockedUsers.filter(u => u.blocked.id !== user.id));
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred while unblocking the user");
    }
  };

  return (
    <div className="">
      <UsersList users={friends} />
      
      <div className="w-full flex flex-col md:flex-row justify-evenly bg-[#222831] p-4 rounded-lg">
        <div className="flex flex-col text-center justify-center w-full p-1 m-2 md:w-[45%]">
          <div className="text-white font-kreon text-2xl mb-2">
            Friend Requests
          </div>
          <div className="h-[300px] rounded-xl border overflow-hidden overflow-y-auto border-[#FFD369]">
            {friendRequests.length === 0 ? (
              <div className="text-gray-400 h-full text-lg flex justify-center items-center">No pending friend requests</div>
            ) : (
              friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-[#393E46] m-1 mt-2 p-3 w-[99%] rounded-lg"
                >
                  <div className="flex justify-center gap-4 h-full w-full">
                    <div className="text-[#FFD369] font-kreon h-full text-xl font-bold mb-2 w-full rounded shadow-xl shadow-gray-800">
                      {request.from_user.username}
                    </div>
                    <button
                      onClick={() => handleFriendRequest(request.id, "accept")}
                      className="bg-green-600 hover:bg-green-700 hover:scale-105 hover:sahdow-xl hover:shadow-gray-800 hover:border-2
                                transform transition duration-300 text-white px-3 py-1 w-full border border-[#222831] rounded-2xl"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleFriendRequest(request.id, "reject")}
                      className="bg-red-600 hover:bg-red-700 hover:scale-105 hover:sahdow-xl hover:shadow-gray-800 hover:border-2
                                transform transition duration-300 text-white px-3 py-1 w-full border border-[#222831] rounded-2xl"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col text-center justify-center w-full p-1 m-2 md:w-[45%]">
          <div className="text-white font-kreon text-2xl mb-2">block list</div>
          <div className="h-[300px] rounded-xl border overflow-x-hidden overflow-y-auto border-[#FFD369]">
            {blockedUsers.length === 0 ? (
              <div className="text-gray-400 h-full text-lg flex justify-center items-center ">No blocked users</div>
            ) : (
              blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#393E46] m-1 mt-2 p-3 w-[99%] rounded-lg"
                >
                  <div className="flex justify-center gap-4 h-full w-full">
                    <div className="text-[#FFD369] font-kreon h-full text-xl font-bold mb-2 w-full rounded shadow-xl shadow-gray-800">
                      {user.blocked.username}
                    </div>
                    <button
                      onClick={() => handleUnblockUser(user.blocked)}
                      className="bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:sahdow-xl hover:shadow-gray-800 hover:border-2
                                transform transition duration-300 text-white px-3 py-1 w-full border border-[#222831] rounded-2xl"
                    >
                      Unblock
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;