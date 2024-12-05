"use client";

import React from "react";
import Axios from "../Components/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pie } from "../Components/circularProgress";
import toast from "react-hot-toast";


const Profile = () => {
  // const [friendRequests, setFriendRequests] = useState([]);
  const [userData, setUserData] = useState({
    currentUserId: null,
    name: null,
    profileImage: null,
    rank: null,
    level: null,
    gameWins: null,
    gameLosses: null,
    achievements: [],
    history: [],
  });
  // const { userId } = useParams();
  // const [currentUserId, setCurrentUserId] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [FriendshipStatus, setFriendshipStatus] = useState(null);

  const levelPercentage = (userData.level - Math.floor(userData.level)) * 100;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const friendRequestsResponse = await Axios.get("/api/friends/friend_requests/");
        // setFriendRequests(friendRequestsResponse.data);
        const response = await Axios.get("/api/user_profile/");

        // Update only the name while keeping the rest of the user data
        console.log("User Profile00000000:", response.data);
        setUserData((prevData) => ({
          ...prevData,
          currentUserId: response.data.id,
          profileImage: response.data.image,
          name: response.data.first_name, // Assuming response.data contains { name: 'New Name' }
          achievements: response.data.achievements,
          gameWins: response.data.wins,
          gameLosses: response.data.losses,
          level: response.data.level,
        }));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>; // Handle loading state
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
            src={userData.profileImage || "./user_img.svg"}
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
              style={{ width: `${userData.level * 10}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="h-[3%] flex flex-col">
        <span className="text-[#FFD369] text-center font-kreon text-2xl">
          Level : {Math.floor(userData.level)}
        </span>
      </div>
      <div className="h-[70%] flex flex-col md:flex-row md:justify-around">
        <div className="flex flex-col items-center">
          <Pie percentage={userData.levelPercentage} colour="#FFD369" />
          <div className="flex flex-row items-center text-[#393E46] text-center font-kreon text-2xl m-2">
            <div className="h-6 w-6 rounded-sm bg-[#393E46] mr-6"></div>
            <span>Lose</span>
          </div>
          <div className="flex flex-row items-center text-[#FFD369] text-center font-kreon text-2xl m-2">
            <div className="h-6 w-6 rounded-sm bg-[#FFD369] mr-6"></div>
            <span>Win</span>
          </div>
        </div>
        <div className="w-full md:w-[20%] md:h-[80%] h-[30%] mt-4 flex md:flex-col flex-row justify-center items-center text-white border-2 border-[#393E46] rounded-lg text-center">
          <span className="text-white text-center font-kreon text-2xl">
            Leaderboard rank :{" "}
          </span>
          <span className="text-[#FFD369] text-center font-kreon text-2xl">
            {" "}
            # {userData.rank}
          </span>
        </div>
        <div className="w-full md:w-[25%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
          <div className="text-white text-center font-kreon text-2xl mb-2">
            Achievements
          </div>
          {userData.achievements.map((achievement, index) => (
            <div
              key={index}
              className="text-[#FFD369] bg-[#393E46] m-1 mt-2 p-1 w-[90%] text-center font-kreon text-2xl rounded-lg"
            >
              {achievement.name}
            </div>
          ))}
        </div>
        <div className="w-full md:w-[33%] h-full md:h-[80%] mt-4 flex flex-col items-center text-white text-center p-2 px-4 border-2 border-[#393E46] rounded-lg overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-gray-800">
          <div className="text-white text-center font-kreon text-2xl mb-2 ">
            Match History
          </div>
          {userData.history.map((history, index) => (
            <div
              key={index}
              className="text-[#FFD369] my-2 py-2 w-full h-auto text-center font-kreon text-lg rounded-lg"
            >
              <div className="flex justify-between items-center">
                {/* User's section */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center text-xs">
                    <img
                      src="./user_img.svg"
                      alt="user_img"
                      className="w-8 h-8 rounded-full mr-4"
                    />
                    <span
                      className={
                        history.result === "WIN"
                          ? "text-[#00FF38]"
                          : "text-[#FF0000]"
                      }
                    >
                      {history.result}
                    </span>
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-sm -ml-8">{userData.name}</span>
                  </div>
                </div>

                {/* VS Separator */}
                <div className="flex items-center text-sm mb-4">
                  <span>VS</span>
                </div>

                {/* Opponent's section */}
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center text-xs">
                    <span
                      className={
                        history.result === "WIN"
                          ? "text-[#FF0000]"
                          : "text-[#00FF38]"
                      }
                    >
                      {history.result === "WIN" ? "LOSE" : "WIN"}
                    </span>
                    <img
                      src="./user_img.svg"
                      alt="user_img"
                      className="w-8 h-8 rounded-full ml-4"
                    />
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-sm -mr-8">{history.opponent}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <hr className=" border-[#FFD369] my-2 w-[90%]  item-center"></hr>
              </div>
            </div>
          ))}
        </div>
      </div>
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
