"use client";

import React, { useState } from "react";
import Axios from "../Components/axios"; // Assuming you still need this for login
import Register from "./Register"; // Import the Register component
import Popup from "./Popup"; // Import the Popup component
import { useRouter } from "next/navigation";

const Login = () => {
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false); // State for popup visibility
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
    }
  };

  return (
    <div className="bg-[rgb(34,40,49)] h-screen flex flex-row items-center justify-center">
      <div className="w-2/3 h-full m-6 bg-[#222831] flex flex-col items-center">
        <div className="flex flex-col items-center h-[20%] mt-8 w-1/2">
          {error && <p className="text-red-500">{error}</p>}
          <form
            className="flex flex-col items-center justify-center w-2/3"
            onSubmit={handleLogin}
          >
            {/* Your login form fields here */}
            <button
              className="w-1/3 h-full p-3 m-2 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
        <button
          className="text-white font-kreon text-lg mt-8"
          onClick={() => setIsPopupOpen(true)} // Open the register popup
        >
          a guest? .. you can 
          <span className="text-[#FFD369] font-kreon text-lg underline ml-2">register here</span>
        </button>
        
        {/* Render the popup with Register component */}
        {isPopupOpen && (
          <Popup onClose={() => setIsPopupOpen(false)}>
            <Register /> {/* Pass Register component to Popup */}
          </Popup>
        )}
      </div>
    </div>
  );
};

export default Login;
