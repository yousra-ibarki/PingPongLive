"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");

        // console.log("User Profile::", response.data);
        setUsername(response.data.username);
      } catch (error) {
        console.error("Error fetching user profile:{d}", error);

        // Check if it's a 401 Unauthorized error and redirect to login
        if (error.response && error.response.status === 401) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    try {
      Axios.post("/api/accounts/logout/");
      router.push("/login");
    }
    catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading state if fetching data
  }



  return (
    <div>
      <h2>Welcome, {username || "Guest"}!</h2>
      <p>to PingPong Game</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
