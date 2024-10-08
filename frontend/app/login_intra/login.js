"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const Login = () => {
  // const [userData, setUserData] = useState(null);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/login42/');
      window.location.href = response.data.redirect_url; // Redirect to the OAuth URL
      console.log('Redirect URL:', response.data.redirect_url);
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.status : error.message);
      setError('Login failed. Please try again.');
    }
  };

  // const fetchUserData = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get('/api/user'); // Adjust this endpoint
  //     if (response.data.user_data) {
  //       setUserData(response.data.user_data);
  //       console.log('User Data:', response.data.user_data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user data:', error.response ? error.response.status : error.message);
  //     setError('Could not fetch user data.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchUserData();
  // }, []);

  return (
    <div className="bg-[rgb(34,40,49)] h-screen flex flex-row items-center justify-center">
      <button onClick={handleLogin}>
        <img src="./login.png" alt="login_img" className="w-56 h-40" />
      </button>
      {/* {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {userData && (
        <div>
          <h2>Welcome, {userData.first_name} {userData.last_name}</h2>
          <p>Email: {userData.email}</p>
        </div> */}
      {/* )} */}
    </div>
  );
};

export default Login;
