"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Register from "../register/register";
import Popup from "./popup";
import Axios from "../(pages)/Components/axios";
// import { useWebSocketContext } from "../(pages)/Components/WebSocketContext"; 

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [_42loading, set42Loading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const router = useRouter();
  // const { setUsers } = useWebSocketContext();

  // const fetchUsers = async () => {
  //   try {
  //     const response = await Axios.get('/api/users/');
  //     if (response.data.status === 'success') {
  //       setUsers(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await Axios.post("/api/accounts/login/", {
        username,
        password,
      });

      // Check if 2FA is required
      if (response.data.requires_2fa) {
        setUserId(response.data.user_id);
        setShow2FA(true);
        setError(null);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await Axios.post("/api/2fa/verify_otp/", {
        token: otpCode,
        user_id: userId,
      });
      router.push("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.error ||
          "Invalid verification code. Please try again."
      );
      console.error("Error verifying 2FA:", error);
    }
  };

  const handleLogin42 = async () => {
    set42Loading(true);
    try {
      const response = await Axios.get("/login42/");
      // Storing a flag in localStorage to indicate 42 login flow
      localStorage.setItem('is42Login', 'true');
      window.location.href = response.data.redirect_url;
    } catch (error) {
      console.error(
        "Login failed:",
        error.response ? error.response.status : error.message
      );
      setError("Login failed. Please try again.");
    } finally {
      set42Loading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setUsername(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "otpCode") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 6) {
        setOtpCode(numericValue);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#222831] flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-lg">
        <style>{`
          @keyframes customBounce {
            0%, 100% {
              transform: translateY(0) translateX(-50%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(-20px) translateX(-50%);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          .custom-bounce {
            animation: customBounce 1s infinite;
          }
        `}</style>
        <div className="absolute left-1/2 -top-6 rounded-full bg-[#FFD369] w-6 h-6 custom-bounce" />
        {/* <div className="absolute left-1/2 -translate-x-1/2 -top-6 rounded-full bg-[#FFD369] w-4 h-4 animate-bounce "/> */}
        <div className="w-full max-w-md bg-[#222831] rounded-lg shadow-2xl p-8 relative">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <img
              src="https://127.0.0.1:8001/logo.svg"
              alt="pingpong logo "
              className="w-24 mx-auto"
            />
            {/* <h1 className="text-[#FFD369] text-4xl font-bold">PONG</h1> */}
          </div>

          {/* Game paddles */}
          <div className="absolute left-0 top-1/2 w-2 h-16 bg-[#FFD369] transform -translate-y-1/2" />
          <div className="absolute right-0 top-1/2 w-2 h-16 bg-[#FFD369] transform -translate-y-1/2" />

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}

          {/* Main Container */}
          <div className="bg-[#222831]/50 backdrop-blur-sm rounded-lg p-6 space-y-6">
            {!show2FA ? (
              <>
                {/* 42 Login Button */}
                <button
                  onClick={handleLogin42}
                  disabled={_42loading}
                  className="w-full bg-[#393E46] text-[#FFD369] rounded-lg p-3 hover:bg-[#393E46]/80 transition-colors text-lg font-semibold disabled:opacity-50"
                >
                  {_42loading ? "Loading..." : "LOGIN WITH 42"}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#393E46]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#222831] text-[#FFD369]">OR</span>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="username"
                      value={username}
                      onChange={handleInputChange}
                      placeholder="Email"
                      className="w-full bg-[#393E46] rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD369] border border-[#393E46]"
                    />
                    <input
                      type="password"
                      name="password"
                      value={password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full bg-[#393E46] rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD369] border border-[#393E46]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FFD369] text-[#222831] rounded-lg p-3 font-semibold text-lg hover:bg-[#FFD369]/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "SIGN IN"}
                  </button>
                </form>
              </>
            ) : (
              /* 2FA Verification Form */
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[#FFD369] text-sm">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    name="otpCode"
                    value={otpCode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-[#393E46] rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD369] border border-[#393E46]"
                    required
                    maxLength="6"
                    pattern="\d{6}"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFD369] text-[#222831] rounded-lg p-3 font-semibold text-lg hover:bg-[#FFD369]/90 transition-colors"
                >
                  Verify
                </button>
              </form>
            )}
          </div>

          {/* Register Link */}
          <button
            className="text-white font-medium text-sm mt-6 w-full text-center hover:text-[#FFD369] transition-colors"
            onClick={() => setIsPopupOpen(true)}
          >
            First time ?{" "}
            <span className="text-[#FFD369] underline ml-1">Join the game</span>
          </button>

          {/* Register Popup */}
          {isPopupOpen && (
            <Popup onClose={() => setIsPopupOpen(false)}>
              <Register onClose={() => setIsPopupOpen(false)} />
            </Popup>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
