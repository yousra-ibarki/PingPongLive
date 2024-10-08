"use client"; // Client-side component

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Function to fetch user data
    const fetchUserProfile = async () => {
      const accessToken = getCookie("access_token");

      if (!accessToken) {
        console.log("Not Authenticated");
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }

      try {
        // Fetch user profile using the access token
        const response = await axios.get("http://localhost:8000/api/user_profile/", {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Use the token for authorization
          },
        });

        setUsername(response.data.username); // Set the username from response
        setIsAuthenticated(true); // Set authenticated state to true
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAuthenticated(false);
        router.push("/login"); // Redirect to login if authentication fails
      }
    };

    fetchUserProfile(); // Call the function to fetch user profile
  }, [router]);

  // Function to handle logout
  const handleLogout = () => {
    // Clear cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    setIsAuthenticated(false); // Update the authentication status
    router.push("/login"); // Redirect to login page
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  if (!isAuthenticated) {
    return <p>Loading...</p>; // Show loading state if not authenticated
  }

  return (
    <div>
      <h2>Welcome, {username || "Guest"}!</h2> {/* Display username or fallback */}
      <p>to PingPong Game</p>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </div>
  );
};

export default Dashboard;
