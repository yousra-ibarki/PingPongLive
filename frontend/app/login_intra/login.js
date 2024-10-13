"use client";

import React, { useState } from "react";
import Axios from "../Components/axios";

const Login = () => {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await Axios.get("/login42/");
      window.location.href = response.data.redirect_url;
      console.log('Redirect URL:', response.data.redirect_url);
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.status : error.message);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="bg-[rgb(34,40,49)] h-screen flex flex-row items-center justify-center">
      <button onClick={handleLogin}>
        <img src="./login.png" alt="login_img" className="w-56 h-40" />
      </button>
    </div>
  );
};

export default Login;
