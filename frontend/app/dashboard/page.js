"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await Axios.get("/api/user_profile/");

        // console.log("User Profile::", response.data);
        setUsername(response.data.username);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user profile:{d}", error);

        // Check if it's a 401 Unauthorized error and redirect to login
        if (error.response && error.response.status === 401) {
          setIsAuthenticated(false);
          // router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    // Clear local storage
    // localStorage.removeItem("access_token");

    setIsAuthenticated(false); // Update the authentication status
    // router.push("/login_intra"); // Redirect to login page
  };

  if (loading) {
    return <p>Loading...</p>; // Show loading state if fetching data
  }

  if (!isAuthenticated) {
    return <p>Please log in.</p>; // Optionally handle unauthenticated state differently
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
