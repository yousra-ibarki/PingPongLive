"use client";
import Axios from "../Components/axios";
import React, { useEffect, useState } from "react";
import UsersList from "./usersList";
import { toast } from "react-hot-toast";

const Friends = () => {
  const [friends, setFriends] = useState([]);


  const [friendRequests, setFriendRequests] = useState([]);

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
  }, []);

  const handleFriendRequest = async (requestId, action) => {
    try {
      // check if there is a friend request
      // geting all friend requests
      const friendRequests = await Axios.get("/api/friends/friend_requests/");
      // check if the request id is in the list of friend requests
      if (!friendRequests.data.find((request) => request.id === requestId)) {
        toast.error("Invalid friend request. the request does not exist, please refresh the page");
        return;
      }

      await Axios.post("/api/friends/friend_requests/", {
        request_id: requestId,
        action: action,
      });

      // Refresh friend requests list
      const response = await Axios.get("/api/friends/friend_requests/");
      setFriendRequests(response.data);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };


  useEffect(() => {
    try {
      const fetchFriends = async () => {
        const responseResp = await Axios.get(`/api/friends/`);
        setFriends(responseResp.data.data);
      };
      fetchFriends();
    } catch (err) {
      toast.error(err.response.data.message);
    }
  }, []);


  return (
    <div className="">
      <UsersList users={friends} />
      
      <div className="w-full flex flex-col md:flex-row justify-evenly bg-[#222831] p-4 rounded-lg">
        <div className="flex flex-col text-center justify-center w-full h-[150px] p-1 m-2 md:w-[45%] rounded-xl border border-[#FFD369]">
          <div className="text-white font-kreon text-2xl mb-2">
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
        <div className="flex flex-col text-center justify-center w-full h-[150px] p-1 m-2 md:w-[45%] rounded-xl border border-[#FFD369]">
          <div className="text-white font-kreon text-2xl mb-2">block list</div>
          <div className="text-gray-400">No blocked users</div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
