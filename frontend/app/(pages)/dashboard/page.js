"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import CircularProgress from "../user-profile/[userId]/(profileComponents)/circularProgress";
import DoubleLineChart from "../Components/DoubleLineChart";
import "../../globals.css";
import { useWebSocketContext } from "../Components/WebSocketContext";
// Make sure you have this Modal component in your codebase or adjust the import path:
import Modal from "../user-profile/[userId]/(profileComponents)/Modal";




function formatGameData(data, userName) {
  const isUser = data.user === userName;

  return {
    userId: data.id,
    opponent: isUser ? data.opponent : data.user,
    opponentScore: isUser ? data.opponentScore : data.userScore,
    // opponentImage: data.opponent_image,
    result: isUser ? data.result : data.result === "WIN" ? "LOSE" : "WIN",
    timestamp: data.timestamp,
    userScore: isUser ? data.userScore : data.opponentScore,
  };
}



function getChartData(user) {
  // If user or user.history is missing or invalid, return an empty chart structure
  if (!user || !Array.isArray(user.history)) {
    return {
      labels: ["Start"],
      datasets: [
        { label: "Wins", data: [] },
        { label: "Losses", data: [] }
      ]
    };
  }

  // Initialize with a starting point at zero
  const labels = ["Start"];
  const winsData = [0];
  const lossesData = [0];
  let cumulativeWins = 0;
  let cumulativeLosses = 0;

  // Iterate through each game and update the cumulative counts
  user.history.forEach((game, index) => {
    const gameRes = formatGameData(game, user.username);
    const result = gameRes.result.toLowerCase();
    if (result === "win") {
      cumulativeWins++;
    } else if (result === "lose") {
      cumulativeLosses++;
    }

    // Add a new label for each game
    labels.push(`Game-${index + 1}`);
    winsData.push(cumulativeWins);
    lossesData.push(cumulativeLosses);
  });
  
  // // Optionally, ensure at least 10 data points by padding
  // while (labels.length < 10) {
  //   labels.push(`Game-${labels.length}`);
  //   winsData.push(cumulativeWins);
  //   lossesData.push(cumulativeLosses);
  // }

  // // Construct the final chartData object
  const chartData = {
    labels,
    datasets: [
      {
        label: "Wins",
        data: winsData,
        borderColor: "#FFD369",
        backgroundColor: "rgba(255, 211, 105, 0.2)",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#FFD369",
        pointRadius: 5,
      },
      {
        label: "Losses",
        data: lossesData,
        borderColor: "#393E46",
        backgroundColor: "rgba(57, 62, 70, 0.2)",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: "#393E46",
        pointRadius: 5,
      },
    ],
  };

  return chartData;
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  // States for controlling the achievements modal
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const { loggedInUser } = useWebSocketContext();
  const router = useRouter();

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await Axios.get("/api/users_list/");
        // Adjust sorting to move users with rank 0 to the end
        const sortedUsers = response.data.sort((a, b) => {
          if (a.rank === 0) return 1;
          if (b.rank === 0) return -1;
          return a.rank - b.rank;
        });
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    const setUserData = async () => {
      try {
        setUser({
          id: loggedInUser.id,
          username: loggedInUser.username,
          image: loggedInUser.image,
          rank: loggedInUser.rank,
          gameWins: loggedInUser.wins,
          gameLosses: loggedInUser.losses,
          winRate: loggedInUser.winrate,
          level: loggedInUser.level,
          LeaderboardRank: loggedInUser.rank,
          achievements: loggedInUser.achievements,
          history: loggedInUser.match_history,
        }
        );
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchUsersData();
    setUserData();
  }, [loggedInUser]);

  const chartData = getChartData(user);

  console.log("chart data:", chartData);


  // Data for the Double Line Chart
  // const chartData = {
  //   labels: [
  //     "Game-1", "Game-2", "Game-3", "Game-4", "Game-5",
  //     "Game-6", "Game-7", "Game-8", "Game-9", "Game-10"
  //   ],
  //   datasets: [
  //     {
  //       label: "Wins",
  //       data: [0, 1, 2, 2, 2, 3, 4, 4, 5, 6],
  //       borderColor: "#FFD369",
  //       backgroundColor: "rgba(255, 211, 105, 0.2)",
  //       fill: false,
  //       tension: 0.4,
  //       borderWidth: 2,
  //       pointBackgroundColor: "#FFD369",
  //       pointRadius: 5,
  //     },
  //     {
  //       label: "Losses",
  //       data: [0, 0, 0, 1, 2, 2, 2, 3, 3, 3],
  //       borderColor: "#393E46",
  //       backgroundColor: "rgba(57, 62, 70, 0.2)",
  //       fill: false,
  //       tension: 0.4,
  //       borderWidth: 2,
  //       pointBackgroundColor: "#393E46",
  //       pointRadius: 5,
  //     },
  //   ],
  // };

  // Options to configure the chart
  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true, ticks: { stepSize: 50 } },
    },
  };

  // Filtered top three users
  const filteredUsers = users.filter((u) =>
    u.username.toLocaleLowerCase()
  );
  const topThreeUsers = filteredUsers.slice(0, 3);

  // Functions to handle opening/closing achievements modal
  const openAchievementModal = (achievement) => {
    setSelectedAchievement(achievement);
    setIsAchievementModalOpen(true);
  };
  const closeAchievementModal = () => {
    setSelectedAchievement(null);
    setIsAchievementModalOpen(false);
  };

  return (
    <div className="flex justify-center text-center items-center border border-[#FFD369] p-6 bg-black m-2 rounded-lg shadow-lg">
      <div className="w-full md:w-[85%] flex flex-col justify-around">
        {/* Welcome Section */}
        <div className="flex flex-col items-center">
          <div className="bg-[#393E46] md:w-[60%] border border-[#FFD369] shadow-lg rounded-lg p-10 m-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-[#FFD369]">
              Welcome to Ping Pong Game
            </h1>
            <button
              className="relative w-40 h-12 bg-[#FFD369] text-[#393E46] p-2 shadow-xl border border-gray-800 rounded-3xl overflow-hidden"
              onClick={() => router.push("/home")}
            >
              <span className="absolute text-xl inset-2 text-gray-600 bg-gradient-to-r from-transparent via-silver to-transparent animate-glitter">
                {"start game ->"}
              </span>
            </button>
          </div>
        </div>

        {/* Achievements + Leaderboard */}
        <div className="flex flex-col md:flex-row w-full justify-around shadow-lg">
          {/* Achievements Section */}
          <div className="p-4 m-2 md:w-[48%] rounded-lg shadow border border-[#FFD369]">
            <h2 className="text-xl font-semibold mb-2 text-[#FFD369] rounded-lg">
              Achievements
            </h2>
            <div className="flex h-[400px] flex-col items-center border border-[#FFD369] p-4 overflow-y-auto">
              {user?.achievements?.map((achievement, index) => (
                <div
                  key={index}
                  className="w-full bg-[#393E46] rounded-full flex border-[0.5px] justify-center items-center p-3 mb-2 cursor-pointer"
                  onClick={() => openAchievementModal(achievement)}
                >
                  <p className="text-[#FFD369] text-2xl pr-6">
                    {achievement.achievement}
                  </p>
                  <img src={achievement.icon} alt="trophy" className="size-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Top On Leaderboard */}
          <div className="md:w-[48%] p-4 m-2 text-xl text-[#FFD369] rounded-lg shadow border border-[#FFD369]">
            <h2 className="text-2xl mb-2">Top On Leaderboard</h2>
            <div className="h-[90%] w-full bg-[#222831] p-2 border border-[#FFD369]">
              <div className="flex items-center h-[20%] justify-between bg-[#222831] rounded-lg m-2 text-[#EEEEEE]">
                <span className="h-full flex justify-center items-center w-full mr-1 rounded-l-lg font-kreon border-[#FFD369] border">
                  Rank
                </span>
                <span className="h-full flex justify-center items-center w-full mr-1 font-kreon border-[#FFD369] border">
                  Player
                </span>
                <span className="h-full flex justify-center items-center w-full mr-1 rounded-r-lg border-[#FFD369] border font-kreon">
                  Level
                </span>
              </div>
              {topThreeUsers.map((u, index) => (
                <div
                  key={index}
                  className="flex items-center h-[22%] justify-between bg-[#222831] rounded-lg m-2"
                >
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">
                    {u.rank}
                  </span>
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">
                    {u.username}
                  </span>
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">
                    {u.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart + Win Rate */}
        <div className="flex flex-col md:flex-row w-full justify-around">
          <div className="md:w-[48%] p-4 m-2 h-[400px] flex justify-center items-center rounded-lg shadow border border-[#FFD369]">
            <DoubleLineChart data={chartData} options={chartOptions} />
          </div>

          <div className="md:w-[48%] p-4 m-2 rounded-lg shadow text-[#393E46] border border-[#FFD369]">
            <h2 className="text-xl h-[20%] font-semibold mb-2 text-[#FFD369]">
              Winrate
            </h2>
            <div className="flex h-[60%] justify-center items-center">
              <CircularProgress
                percentage={user?.winRate}
                colour="#FFD369"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Achievement Details */}
      {isAchievementModalOpen && selectedAchievement && (
        <Modal onClose={closeAchievementModal}>
          <div className="p-4 bg-gradient-to-b from-[#141414] to-black rounded-lg shadow-lg w-full mx-auto max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFD369] scrollbar-track-[#1f1f1f]">
            <div className="text-[#FFD369] font-kreon text-lg space-y-4">
              <h2 className="text-3xl font-bold mb-4 text-center">
                {selectedAchievement.achievement}
              </h2>
              {/* Optional fields if present */}
              {selectedAchievement.description && (
                <p className="text-base text-[#EEEEEE] leading-relaxed mb-2">
                  {selectedAchievement.description}
                </p>
              )}
              {selectedAchievement.date && (
                <p className="text-sm text-[#EEEEEE] italic">
                  Achieved on: {new Date(selectedAchievement.date).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;