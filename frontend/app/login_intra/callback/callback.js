"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Axios from '../../Components/axios';

const Callback = () => {
  const router = useRouter();
  const params = useSearchParams();
  const accessToken = params.get('code');
  const [username, setUsername] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback(accessToken) {
      try {
        const response = await Axios.get('/accounts/42/login/callback', {
          params: {
            'code': accessToken,
          },
        });
        // const response = await axios.get('http://127.0.0.1:8000/accounts/42/login/callback', {
        //   params: {
        //     'code': accessToken,
        //   },
        //   withCredentials: true, // Ensure cookies are included in cross-origin requests
        // });

        console.log("User Profile:", response.data);
        await fetchUserProfile();
        // After successful login, redirect to the dashboard
        // router.push('/dashboard');
      } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        console.error("Error fetching user profile*:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }

    // get user profile and print it
    async function fetchUserProfile() {
      try {
        // get access token from cookie and console loge it 
        const getCookie = (name) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop().split(';').shift();
        };
        
        const accessToken = getCookie('access');  // Make sure the key is correct
        console.log("Access Token:", accessToken);
        
        const response = await Axios.get('/api/user_profile/');
        // const response = await axios.get('http://localhost:8000/api/user_profile/', {
        // withCredentials: true, // Ensure cookies are sent with the request
        // });

        console.log("User Profile::", response.data);
        setUsername(response.data.username);
        setIsAuthenticated(true); // Set user as authenticated if the request succeeds
      } catch (error) {
        console.error("Error fetching user profile:{c}", error);

        // Check if it's a 401 Unauthorized error
        if (error.response && error.response.status === 401) {
          setIsAuthenticated(false);
          // router.push("/login"); // Redirect to login page if not authenticated
        }
      }
    }


    if (accessToken) {
      handleCallback(accessToken);
      // fetchUserProfile();
    } else {
      setError('Access token not found');
      setLoading(false);
    }
  }, [accessToken, router]);

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome, {username || 'Guest'}!</h2>
        <p>to PingPong Game</p>
        {/* <button onClick={handleLogout}>Logout</button> */}
      </div>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // If the error is an object, convert it to a string to render
    return <div>{typeof error === 'object' ? JSON.stringify(error) : error}</div>;
  }

  return null;
};

export default Callback;
