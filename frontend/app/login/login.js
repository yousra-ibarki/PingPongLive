"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Register from "../register/register";
import Popup from "./popup";
import Axios from "../Components/axios";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [_42loading, set42Loading] = useState(false);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const router = useRouter();

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
        setSessionId(response.data.session_id);
        setShow2FA(true);
        setError(null);
      } else {
        router.push("/");
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
    try {
      const response = await Axios.post("/api/2fa/verify_otp/", {
        token: otpCode,
        session_id: sessionId,
      });
      router.push("/");
    } catch (error) {
      setError("Invalid verification code. Please try again.");
      console.error("Error verifying 2FA:", error);
    }
  };

  const handleLogin42 = async () => {
    set42Loading(true);
    try {
      const response = await Axios.get("/login42/");
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
    }
  };

  return (
    <div className="bg-[rgb(34,40,49)] h-[1000px] w-full flex items-center justify-center">
      <div className=" h-[95%] w-full m-6 bg-[#222831] flex flex-col items-center">
        <div className="h-[5%] flex items-center">
          <h1 className="text-[#FFD369]  text-4xl">Login</h1>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!show2FA ? (
          <form
            className="flex flex-col items-center w-full h-[50%] md:h-[70%] justify-center"
            onSubmit={handleLogin}
          >
            <InputField
              id="username"
              label="Nickname"
              type="text"
              name="username"
              value={username}
              onChange={handleInputChange}
              placeholder="Enter your nickname"
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-[60%] md:w-[30%] lg:w-[10%] p-3 m-10 bg-[#FFD369] text-[#222831] text-2xl rounded-lg flex justify-center ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? <div className="loaderLogin h-28"></div> : "Login"}
            </button>
          </form>
        ) : (
          <form
            className="flex flex-col items-center justify-center w-3/4 md:w-1/3"
            onSubmit={handleVerify2FA}
          >
            <div className="w-full flex flex-col justify-between mb-4">
              <label
                htmlFor="otp"
                className="text-[#FFD369] font-kreon text-base ml-4"
              >
                Enter Verification Code
              </label>
              <input
                type="text"
                id="otp"
                className="p-3 m-2 mt-0 rounded-2xl bg-[#393E46] text-white border-custom"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength="6"
                pattern="\d{6}"
              />
            </div>
            <button
              className="w-2/3 lg:w-2/3 h-full p-3 m-10 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg"
              type="submit"
            >
              Verify
            </button>
          </form>
        )}
        <button
          onClick={handleLogin42}
          disabled={_42loading}
          className={`mt-10 ${
            _42loading ? " cursor-not-allowed" : ""
          }`}
        >
          {_42loading ? (
            <div className="loaderLogin h-32 border rounded-lg "></div>
          ) : (
            <img src="https://127.0.0.1:8001/login.png" alt="Login with 42" className="w-56 h-36" />
          )}
        </button>
        <button
          className="text-white font-kreon text-lg mt-8"
          onClick={() => setIsPopupOpen(true)}
        >
          A guest?{" "}
          <span className="text-[#FFD369] underline ml-2">Register here</span>
        </button>
        {isPopupOpen && (
          <Popup onClose={() => setIsPopupOpen(false)}>
            <Register onClose={() => setIsPopupOpen(false)} />
          </Popup>
        )}
      </div>
    </div>
  );
};

export default Login;

const InputField = ({
  id,
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
}) => (
  <div className="w-[80%] md:w-[50%] lg:w-[20%] flex flex-col mb-4">
    <label htmlFor={id} className="text-[#FFD369] font-kreon text-base ml-4">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="p-3 m-2 rounded-2xl bg-[#393E46] text-white border-custom"
      required
    />
  </div>
);
