"use client";

import React, { useEffect, useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post('/api/accounts/login/', {
        username,
        password,
      });
      // print the response data
      console.log("Login response:", response.data);
      router.push("/dashboard");
      
      // Store the tokens in cookies if the response is successful
      // document.cookie = `access_token=${response.data.access}; path=/`;
      // document.cookie = `refresh_token=${response.data.refresh}; path=/`;
      // document.cookie = `logged_in=true; path=/`;
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-row justify-center items-center bg-[#222831]">
      <div className="w-2/3 h-full m-6 bg-[#222831] border border-[#FFD369] rounded-lg flex flex-col items-center">
        <div className="flex items-center h-[15%]">
          <h1 className="text-[#FFD369] font-kreon text-4xl">Login</h1>
        </div>
        <div className="flex flex-col items-center h-[85%] mt-8">
          {error && <p className="text-red-500">{error}</p>}
          <form className="flex flex-col items-center justify-center" onSubmit={handleLogin}>
            <div className="w-full flex flex-col justify-between mb-4">
              <label htmlFor="username" className="text-white font-kreon text-base ml-4">Username</label>
              <input 
                type="text" 
                id="username" 
                className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="w-full flex  flex-col justify-between mb-4">
              <label htmlFor="password" className="text-white font-kreon text-base ml-4">Password</label>
              <input 
                type="password" 
                id="password" 
                className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg" type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
