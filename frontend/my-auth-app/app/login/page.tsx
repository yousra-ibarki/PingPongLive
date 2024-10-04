"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState(""); // State for username
  const [password, setPassword] = useState(""); // State for password
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const router = useRouter();

  // Check if the user is logged in on component mount
  useEffect(() => {
    const accessToken = getCookie("access_token");
    
    if (accessToken) {
      // Fetch the user profile if already logged in
      // fetchUserProfile();
      router.push("/dashboard");
    }
  }, [router]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,  // Ensure username is correct
        password,  // Ensure password is correct
      }, {
        headers: {
          'Content-Type': 'application/json', // Ensure this header is set
        },
      });
      
      // Store the tokens in cookies if the response is successful
      document.cookie = `access_token=${response.data.access}; path=/`;
      document.cookie = `refresh_token=${response.data.refresh}; path=/`;
      document.cookie = `logged_in=true; path=/`;  // Set logged_in cookie
      setIsLoggedIn(true); // Update login status
      router.push("/dashboard");  // Redirect to login page
    } catch (error) {
      console.error("Error logging in:", error);  // Print the error for debugging
    }
  };
  

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setIsLoggedIn(false); // Update login status
    setUsername(""); // Clear username
    router.push("/login"); // Redirect to login page
  };

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  return (
    <div>
      <h1>Login</h1>
      {isLoggedIn ? (
        <div>
          <h2>Welcome, {username}!</h2> {/* Display welcome message */}
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="text" // Username input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};

export default LoginPage;
