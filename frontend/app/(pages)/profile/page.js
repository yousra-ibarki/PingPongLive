"use client";

import Profile from "../Components/profile";
import Axios from "../Components/axios";
import { useEffect, useState } from "react";
import { useWebSocketContext } from "../Components/WebSocketContext";

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

  const { loggedInUser } = useWebSocketContext();

  useEffect(() => {
    try {
      setIsLoading(true);
      setUserData({
        id: loggedInUser.id,
        username: loggedInUser.username,
        image: loggedInUser.image,
        rank: loggedInUser.rank,
        gameWins: loggedInUser.wins,
        gameLosses: loggedInUser.losses,
        winRate: 54,
        level: 5.3,
        LeaderboardRank: 3,
        achievements: [
          { name: "First Win" },
          { name: "First Lose" },
          { name: "First win" },
          { name: "First Win" },
          { name: "First Lose" },
          { name: "First win" },
          { name: "First Win" },
          { name: "First Lose" },
          { name: "First win" },
        ],
        history: [
          { result: "WIN", opponent: { name: "Opponent", image: "/avatars/defaultAv_1.jpg", opponentGoals: 2 },
            date : "2021-10-10", playerGoals: 3,  },
          { result: "LOSE", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "win", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "WIN", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "LOSE", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "win", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "WIN", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "LOSE", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
          { result: "win", opponent: { name: "Opponent", image: null, opponentGoals: 2 }, 
            date : "2021-10-10", playerGoals: 3,  },
        ],
      });
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
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