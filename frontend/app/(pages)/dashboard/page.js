"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import CircularProgress from "../user-profile/[userId]/(profileComponents)/circularProgress";
import DoubleLineChart from '../Components/DoubleLineChart';
import "../../globals.css";
import { useWebSocketContext } from "../Components/WebSocketContext";


const Dashboard = () => {
  const [user, setUser] = useState({
    username: "abberkac",
    // will removed later
    achievements: [
      { name: "First Game", image: "/trophy/firstWin.png" },
      { name: "First Win", image: "/trophy/firstGame.png" },
      { name: "tournament win", image: "/trophy/tournament2.png" },
      { name: "level up", image: "/trophy/levelBadge.png" },
      { name: "tournament win", image: "/trophy/tournament2.png" },
      { name: "First Game", image: "/trophy/firstWin.png" },
      { name: "level up", image: "/trophy/levelBadge.png" },
    ],
    level: 0,
    wins: 0,
    winrate: 0,
    losses: 0,
  });
  
  const [users, setUsers] = useState ([
    {
      rank: 0,
      username: "",
      level:  0
    },
  ]);

  const { loggedInUser } = useWebSocketContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get(`/api/user_profile/`);
        setUser(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchUserData();
    const fetchUsersData = async () => {
      try {
        const response = await Axios.get('/api/user/');
        setUsers(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchUsersData();
  }, [loggedInUser]);

//  -------------------------------------------------------------------------------- needs to structure the data ------

  // Data for the Double Line Chart
  const chartData = {
    labels: ['Game-1', 'Game-2', 'Game-3', 'Game-4', 'Game-5', 'Game-6', 'Game-7', 'Game-8', 'Game-9', "Game-10"], // X-axis labels
    datasets: [
      {
        label: 'Wins', // Label for the first line
        data: [0, 1, 2, 2, 2, 3, 4, 4, 5, 6], // Wins data
        borderColor: '#FFD369', // Line color for Wins (Yellow)
        backgroundColor: 'rgba(255, 211, 105, 0.2)', // Light background color under the line
        fill: false, // No fill under the line
        tension: 0.4, // Smoothness of the line
        borderWidth: 2, // Line width
        pointBackgroundColor: '#FFD369', // Point color for Wins
        pointRadius: 5, // Radius of the points
      },
      {
        label: 'Losses', // Label for the second line
        data: [0, 0, 0, 1, 2, 2, 2, 3, 3, 3], // Losses data
        borderColor: '#393E46', // Line color for Losses (Dark Gray/Blue)
        backgroundColor: 'rgba(57, 62, 70, 0.2)', // Light background color under the line
        fill: false, // No fill under the line
        tension: 0.4, // Smoothness of the line
        borderWidth: 2, // Line width
        pointBackgroundColor: '#393E46', // Point color for Losses
        pointRadius: 5, // Radius of the points
      },
    ],
  };

  // Options to configure the chart
  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1500, // Duration of the animation (in ms)
      easing: 'easeInOutQuad', // Easing function for the animation
      onProgress: function (animation) {
        const progress = animation.animationState ? animation.animationState.currentStep / animation.animationState.numSteps : 0;
      },
      onComplete: function () {
      },
    },
    plugins: {
      legend: {
        position: 'top', // Position of the legend (top, left, etc.)
      },
      tooltip: {
        enabled: true, // Enable tooltips
      },
    },
    scales: {
      x: {
        beginAtZero: true, // Ensure the x-axis starts at zero
      },
      y: {
        beginAtZero: true, // Ensure the y-axis starts at zero
        ticks: {
          stepSize: 50,
        },
      },
    },
  };



  const filteredUsers = users.filter(user => 
    user.username.toLocaleLowerCase()
  );

  const topThreeUsers = filteredUsers.slice(0, 3);

//  --------------------------------------------------------------------------------
  const router = useRouter();

  return (
    <div className="flex  justify-center text-center items-center border border-[#FFD369] p-6 bg-black m-2 rounded-lg shadow-lg" >
      <div className="w-full md:w-[85%] flex flex-col  justify-around ">

        <div className="flex flex-col items-center">
          <div className="bg-[#393E46] md:w-[60%] border border-[#FFD369] shadow-lg rounded-lg p-10 m-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-4 text-[#FFD369]">Welcome to Ping Pong Game</h1>
            <button className="relative w-40 h-12 bg-[#FFD369] text-[#393E46] p-2 shadow-xl border border-gray-800 rounded-3xl overflow-hidden" onClick={() => router.push("/home")}>
              {/* <span className="relative z-10">Start a Game</span> */}
              <span className="absolute text-xl inset-2 text-gray-600 bg-gradient-to-r from-transparent via-silver to-transparent animate-glitter">{("Start a game  ->")} </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full justify-around shadow-lg">
          <div className="p-4 m-2  md:w-[48%] rounded-lg shadow border border-[#FFD369]">
            <h2 className="text-xl font-semibold  mb-2 text-[#FFD369]  rounded-lg ">Achievements</h2>
            <div className="flex h-[400px] flex-col items-center border border-[#FFD369] p-4   overflow-y-auto " > 
              {user?.achievements.map((achievement, index) => (
                <div key={index} className="w-full bg-[#393E46] rounded-full flex border-[0.5px] justify-center items-center p-3 mb-2">
                  <p className="text-[#FFD369] text-2xl pr-6">{achievement.achievement}</p>
                  <img src={achievement.icon} alt="trophy" className="size-8 " />
                </div>
              ))}
            </div>
          </div>

          <div className="md:w-[48%] p-4 m-2 text-xl text-[#FFD369] rounded-lg shadow border border-[#FFD369]  ">
            <h2 className="text-2xl  mb-2" >Top On Leaderboard</h2>
            {/* ---------------------------------------------------------------------------------- */}
            <div className=" h-[90%] w-full bg-[#222831]  p-2 border border-[#FFD369]">
              <div className="flex items-center h-[20%] justify-between bg-[#222831] rounded-lg m-2 text-[#EEEEEE] ">
                <span className=" h-full flex justify-center items-center w-full mr-1 rounded-l-lg font-kreon  border-[#FFD369] border">Rank</span>
                <span className=" h-full flex justify-center items-center w-full mr-1 font-kreon border-[#FFD369] border">Player</span>
                <span className=" h-full flex justify-center items-center w-full mr-1 rounded-r-lg  border-[#FFD369] border font-kreon">Level</span>
              </div>
              {topThreeUsers.map((user, index) => (
                <div key={index} className="flex items-center h-[22%] justify-between bg-[#222831] rounded-lg m-2">
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-l-lg font-kreon">{user.rank}</span>
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 font-kreon">{user. username}</span>
                  <span className="text-[#FFD369] border border-[#FFD369] h-full bg-[#393E46] w-full flex justify-center items-center mr-1 rounded-r-lg font-kreon">{user.level}</span>
                </div>
              ))}
            </div>
            {/* ---------------------------------------------------------------------------------- */}
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full justify-around">
          <div className="md:w-[48%] p-4 m-2  h-[400px] flex justify-center items-center rounded-lg shadow border border-[#FFD369] " >
            <DoubleLineChart data={chartData} options={chartOptions} />
          </div>

          <div className="md:w-[48%] p-4 m-2  rounded-lg shadow text-[#393E46] border border-[#FFD369] " >
            <h2 className="text-xl h-[20%] font-semibold  mb-2 text-[#FFD369]">Winrate</h2>
            <div className="flex h-[60%] justify-center items-center ">
              <CircularProgress percentage={user?.winrate}  colour="#FFD369" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;