"use client";

import React, { useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";


const Login = () => {
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post('/api/accounts/login/', {
        username,
        password,
      });
      router.push("/");

    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Error logging in:", error);
    }
  };
  const handleLogin42 = async () => {
    try {
      const response = await Axios.get("/login42/");
      window.location.href = response.data.redirect_url;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.status : error.message
      );
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="bg-[rgb(34,40,49)] h-screen flex flex-row items-center justify-center">
      <div className="w-2/3 h-full m-6 bg-[#222831] flex flex-col items-center">
        <div className="flex items-center h-[15%]">
          <h1 className="text-[#FFD369] font-kreon text-4xl">Login</h1>
        </div>
        <div className="flex flex-col items-center h-[20%] mt-8">
          {error && <p className="text-red-500">{error}</p>}
          <form
            className="flex flex-col items-center justify-center"
            onSubmit={handleLogin}
          >
            <div className="w-full flex flex-col justify-between mb-4">
              <label
                htmlFor="username"
                className="text-white font-kreon text-base ml-4"
              >
                Username
              </label>
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
              <label
                htmlFor="password"
                className="text-white font-kreon text-base ml-4"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      <button onClick={handleLogin42}>
        <img src="./login.png" alt="login_img" className="w-56 h-40" />
      </button>
        <a 
          href="/register" 
          className="text-white font-kreon text-lg mt-4"
          onClick={(e) => {
            e.preventDefault();  // Prevent default anchor behavior
            router.push("/register");
          }}
        >
          a guest ? .. you can 
          <span 
            className="text-[#FFD369] font-kreon text-lg underline ml-2">register here
            
          </span>
        </a>
      </div>
    </div>
  );
};

export default Login;
