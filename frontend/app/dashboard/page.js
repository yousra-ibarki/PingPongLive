"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import CircularProgress from "../user-profile/[userId]/(profileComponents)/circularProgress";
import DoubleLineChart from '../Components/DoubleLineChart';


const Dashboard = () => {
  const [user, setUser] = useState({
    username: "abberkac",
    achievements: [
      { name: "First Win" },
      { name: "10 Wins" },
      { name: "50 Wins" },
      { name: "100 Wins" },
    ],
    level: 0,
    wins: 0,
    winrate: 0,
    losses: 0,
  });

//  --------------------------------------------------------------------------------

  // Data for the Double Line Chart
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'], // X-axis labels
    datasets: [
      {
        label: 'Sales', // Label for the first line
        data: [0, 70, 110, 90, 150, 130], // Sales data
        borderColor: '#FFD369', // Line color for Sales (Yellow)
        backgroundColor: 'rgba(255, 211, 105, 0.2)', // Light background color under the line
        fill: false, // No fill under the line
        tension: 0.4, // Smoothness of the line
        borderWidth: 2, // Line width
        pointBackgroundColor: '#FFD369', // Point color for Sales
        pointRadius: 5, // Radius of the points
      },
      {
        label: 'Revenue', // Label for the second line
        data: [0, 60, 90, 70, 130, 100], // Revenue data
        borderColor: '#393E46', // Line color for Revenue (Dark Gray/Blue)
        backgroundColor: 'rgba(57, 62, 70, 0.2)', // Light background color under the line
        fill: false, // No fill under the line
        tension: 0.4, // Smoothness of the line
        borderWidth: 2, // Line width
        pointBackgroundColor: '#393E46', // Point color for Revenue
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
        console.log('Progress: ', progress);
      },
      onComplete: function () {
        console.log('Animation completed');
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



//  --------------------------------------------------------------------------------
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       const response = await Axios.get("/api/user_profile/");
  //       console.log("User Profile::", response.data);
  //       setUser(response.data);
  //     } catch (error) {
  //       console.error("Error fetching user profile:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserProfile();
  // }, []);

  // if (loading) {
  //   return <p>Loading...</p>; // Show loading state if fetching data
  // }

  return (
    <div className="flex justify-center text-center items-center border border-[#FFD369] p-6 bg-black m-2 rounded-lg shadow-lg" >
      <div className="w-[90%] grid grid-cols-2 gap-6">
        <div className="bg-[#393E46] border border-[#FFD369] col-span-2 shadow-lg rounded-lg p-10 m-6 flex flex-col items-center" >
          <h1 className="text-2xl font-bold mb-4 text-[#FFD369]">Welcome to Ping Pong Game</h1>
          <p className="text-2xl font-bold text-[#FFD369]" > {user?.username} </p>
        </div>

        <div className="p-8 rounded-lg shadow border border-[#FFD369] ">
          <h2 className="text-xl font-semibold  mb-2" style={{ color: '#FFD369' }}>Achievements</h2>
          <div className="flex flex-col border border-[#FFD369] p-4 rounded-lg" > 
            {user?.achievements.map((achievement, index) => (
              <div key={index} className="flex justify-center items-center mb-2">
                <p className="text-[#FFD369] w-[80%] bg-[#393E46] rounded-full">{achievement.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-lg shadow border border-[#FFD369]  ">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFD369' }}>Level</h2>
          <p style={{ color: '#FFD369' }}>{user?.level}</p>
        </div>

        <div className="p-8 rounded-lg shadow border border-[#FFD369] " >
          {/* <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFD369' }}>Wins</h2>
          <p style={{ color: '#FFD369' }}>{user?.wins}</p> */}

          <DoubleLineChart data={chartData} options={chartOptions} />
        </div>

        <div className="p-8 rounded-lg shadow text-[#393E46] border border-[#FFD369] " >
          <h2 className="text-xl font-semibold  mb-2 text-[#FFD369]">Winrate</h2>
          <div className="flex justify-center items-center ">
            <CircularProgress percentage={user?.winrate} colour="#FFD369" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;