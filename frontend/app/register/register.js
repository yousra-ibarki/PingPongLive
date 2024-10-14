"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/accounts/register/', {
        username,
        email,
        password,
        password2,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Redirect to the login page after successful registration
      console.log("Registration successful:", response.data);
      router.push("/login");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.password || "Registration failed.");
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="w-full h-[90%] flex flex-row justify-center">
      <div className="w-3/4 h-full m-6 bg-[#222831] border border-[#FFD369] rounded-lg">
        <div className="flex items-center h-[15%]">
          <img src="./logo.svg" alt="logo" className="w-16 h-16 mx-4" />
          <h1 className="text-[#FFD369] font-kreon text-4xl absolute left-1/2 transform -translate-x-1/2">Register</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-[85%]">
          {error && <p className="text-red-500">{error}</p>} {/* Error message display */}
          <form className="flex flex-col items-center justify-center" onSubmit={handleRegister}>
            <div className="w-full flex flex-col justify-between">
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
            <div className="w-full flex flex-col justify-between">
              <label htmlFor="email" className="text-white font-kreon text-base ml-4">Email</label>
              <input 
                type="email" 
                id="email" 
                className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="w-full flex flex-col justify-between">
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
            <div className="w-full flex flex-col justify-between">
              <label htmlFor="password2" className="text-white font-kreon text-base ml-4">Confirm Password</label>
              <input 
                type="password" 
                id="password2" 
                className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white" 
                value={password2} 
                onChange={(e) => setPassword2(e.target.value)} 
                required 
              />
            </div>
            <button className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg" type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
