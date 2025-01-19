"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Axios from '../(pages)/Components/axios';
import { toast } from 'react-hot-toast';



const ErrorComponent = ({ error, resetError }) => {
  const router = useRouter();

  const getErrorMessage = (error) => {
    if (typeof error === 'object' && error.error) {
      return error.error; // Extract the "error" property
    }
    return typeof error === 'string' ? error : 'An unknown error occurred';
  };

  const errorMessage = getErrorMessage(error);

  const rederectToLogin = () => {
    resetError();
    router.push("/login");
  }

  return (
    <div className="h-[800px] flex justify-center items-center bg-[#222831]">

      <div className="bg-[#393E46] p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-[#FFD369] text-xl font-bold mb-2">
            Authentication Error
          </h2>
          <p className="text-white font-kreon text-sm mb-6">{errorMessage}</p>
        </div>
        
        <button
          onClick={rederectToLogin}
          className="w-full bg-[#FFD369] text-[#393E46] rounded-lg p-3 font-semibold 
                   hover:bg-[#FFD369]/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};


const Callback = () => {
  const router = useRouter();
  const params = useSearchParams();
  const accessToken = params.get('code');
  
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback(accessToken) {
      try {
        const response = await Axios.get('/api/accounts/42/login/callback', {
          params: {
            'code': accessToken,
          },
        });
       router.push("/dashboard");
      } catch (error) {
        // const errorMsg = error.response ? error.response.data : error.message;
        const errorMsg = (error.response ? error.response.data : error.message) || 'An unknown error occurred';
        toast.error(errorMsg);
        setError(errorMsg);
      } finally {
        // setLoading(false);
      }
    }

    if (accessToken) {
      handleCallback(accessToken);
    } else {
      setError('Access token not found');
      setLoading(false);
    }
  }, [accessToken, router]);

  // if (loading) {
  //   return <div className="h-[800px] flex justify-center items-center">
  //     <div className=" loaderLogin"></div>
  //   </div>;
  // }

  if (error) {
    // If the error is an object, convert it to a string to render
    // return <div>{typeof error === 'object' ?   .stringify(error) : error}</div>;
    return <ErrorComponent error={error} resetError={() => setError(null)} />;
  }

  return null;
};

export default Callback;
