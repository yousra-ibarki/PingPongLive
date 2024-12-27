"use client";

import Profile from "../../Components/profile";
import "@/app/globals.css";
import Axios from "../../Components/axios";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";


function UsersPage({ params }) {

  let userId = params.userId;
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [userData, setUserData] = useState({
    id: null,
    username: null,
    image: null,
    rank: null,
    level: null,
    winRate: null,
    LeaderboardRank: null,
    is_online: null,
    gameWins: null,
    gameLosses: null,
    achievements: [],
    history: [],
  });

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
          const userResponse = await Axios.get(`/api/users/${userId}/`);
          console.log("USER RESPONSE", userResponse.data);
          setUserData({
            id: userResponse.data.data.id,
            is_online: userResponse.data.data.is_online,
            username: userResponse.data.data.username,
            image: userResponse.data.data.image,
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
          router.push("/profile");
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
      <Profile userData={userData} myProfile={false} />
    </div>
  );
}

export default UsersPage;
