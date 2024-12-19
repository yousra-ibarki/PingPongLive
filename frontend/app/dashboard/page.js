"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import CircularProgress from "../user-profile/[userId]/(profileComponents)/circularProgress";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");
        console.log("User Profile::", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>; // Show loading state if fetching data
  }

  return (
    <div className="flex justify-center text-center items-center p-6" >
      <div className="w-[90%] grid grid-cols-2 gap-6">
        <div className="bg-[#FFD369] col-span-2 shadow-lg rounded-lg p-10 m-6 flex flex-col items-center" >
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#222831' }}>Welcome to Ping Pong Game</h1>
          <p className="text-2xl font-bold text-[#222831]" > {user?.username} </p>
        </div>

        <div className="p-8 rounded-lg shadow" style={{ backgroundColor: '#393E46' }}>
          <h2 className="text-xl font-semibold  mb-2" style={{ color: '#FFD369' }}>Achievements</h2>
          <div className="flex flex-col border border-[#FFD369] p-4 rounded-lg" > 
            {user?.achievements.map((achievement, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <p style={{ color: '#FFD369' }}>{achievement.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-lg shadow" style={{ backgroundColor: '#393E46' }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFD369' }}>Level</h2>
          <p style={{ color: '#FFD369' }}>{user?.level}</p>
        </div>

        <div className="p-8 rounded-lg shadow" style={{ backgroundColor: '#393E46' }}>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#FFD369' }}>Wins</h2>
          <p style={{ color: '#FFD369' }}>{user?.wins}</p>
        </div>

        <div className="p-8 rounded-lg shadow text-[#393E46] bg-[#FFD369]" >
          <h2 className="text-xl font-semibold  mb-2">Winrate</h2>
          <div className="flex justify-center items-center ">
            <CircularProgress percentage={user?.winrate} colour="#FFD369" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;