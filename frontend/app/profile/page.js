"use client";

import Profile from "../Components/profile";
import Axios from "../Components/axios";
import { useEffect, useState } from "react";
import Leaderboard from "../Components/leaderboard";

function profilePage() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    id: null,
    name: null,
    image: null,
    rank: null,
    level: null,
    gameWins: null,
    gameLosses: null,
    achievements: [],
    history: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await Axios.get("/api/user_profile/");
        setUserData({
          id: response.data.id,
          username: response.data.username,
          image: response.data.image,
          rank: response.data.rank,
          level: 5.3,
          gameWins: response.data.wins,
          gameLosses: response.data.losses,
          LeaderboardRank: 3,
          achievements: [],
          history: [],
        });
      } catch (err) {
        setError(err.response?.data?.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[1000px] flex items-center justify-center fade-in-globale">
        <div className="h-[60px] w-[60px] loader"></div>
      </div>
    );
  }

  return (
    <div>
      <Profile userData={userData} myProfile={true} />
    </div>
  )
}

export default profilePage