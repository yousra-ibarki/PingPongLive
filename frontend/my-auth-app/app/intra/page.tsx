"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = document.cookie.includes('logged_in=true');
      if (loggedIn) {
        // If the user is logged in, redirect to the dashboard
        router.push('/dashboard'); // Adjust the path as necessary
      }
    };
    
    checkLoginStatus();
  }, [router]);

  const handleLogin = () => {
    const oauthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-784cf673b089ab17c871c4bb8c8d93d873fefe6ac02534bb33989e45847f1ecd&redirect_uri=${encodeURIComponent('http://127.0.0.1:8000/accounts/42/login/callback/')}&response_type=code`;
    window.location.href = oauthUrl; // Redirect to the OAuth URL
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
