"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Axios from '../../Components/axios';

const Callback = () => {
  const router = useRouter();
  const params = useSearchParams();
  const accessToken = params.get('code');
  
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

        console.log("User Profile:", response.data);
       router.push("/dashboard");
      } catch (error) {
        const errorMsg = error.response ? error.response.data : error.message;
        console.error("Error fetching user profile*:", errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }


    if (accessToken) {
      handleCallback(accessToken);
    } else {
      setError('Access token not found');
      setLoading(false);
    }
  }, [accessToken, router]);

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
