"use client";

import Profile from "../../Components/profile";
import "../../globals.css";
import Axios from "../../Components/axios";
import { useEffect, useState } from "react";


function profilePage({ params }) {

  let userId = params.userId;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: null,
    username: null,
    profileImage: null,
    rank: null,
    level: null,
    gameWins: null,
    gameLosses: null,
    achievements: [],
    history: [],
  });
  // const [FriendshipStatus, setFriendshipStatus] = useState(null);
  const [myProfile, setMyProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // const friendRequestsResponse = await Axios.get("/api/friends/friend_requests/");
        // setFriendRequests(friendRequestsResponse.data);
        const response = await Axios.get("/api/user_profile/");
        let currentUserId = response.data.id;
        console.log("CURRENT USER ID", String(currentUserId));
        console.log("USER ID", userId);
        if (String(userId) !== String(currentUserId)) {
          setMyProfile(false);  
          const userResponse = await Axios.get(`/api/users/${userId}/`);
          console.log("USER RESPONSE", userResponse.data);
          setUserData({
            id: userResponse.data.data.id,
            isOnline: userResponse.data.data.is_online,
            username: userResponse.data.data.username,
            profileImage: userResponse.data.data.image,
            rank: userResponse.data.data.rank,
            level: 5.3,
            winRate: 54,
            LeaderboardRank: 3,
            gameWins: userResponse.data.data.wins,
            gameLosses: userResponse.data.data.losses,
            achievements: [],
            history: [],
          });
        } else {
          setMyProfile(true);
          setUserData({
            id: response.data.id,
            isOnline: response.data.is_online,
            username: response.data.username,
            profileImage: response.data.image,
            rank: response.data.rank,
            level: 5.7,
            winRate: 20,
            LeaderboardRank: 1,
            gameWins: response.data.wins,
            gameLosses: response.data.losses,
            achievements: [],
            history: [],
          });
          console.log("MY RESPONSE", response.data);
        }
      } catch (error) {
        setError(error.response?.data?.message || "An error occurred");
        console.error("Fetch error:", error);
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (!userData || isLoading) {
    return (
      <div className="h-[1000px] flex items-center justify-center m-2 bg-[#131313] fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  console.log("USER DATA FROM PAGE PROFILE", userData);
  return (
    <div className="rounded-xl min-w-[300px]">
      <Profile userData={userData} myProfile={myProfile} />
    </div>
  );
}

export default profilePage;
