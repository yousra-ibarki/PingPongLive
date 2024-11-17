"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Axios from "../Components/axios";
import Popup from "./Popup";
import Register from "../register/register";
import "../globals.css";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setLoading(true);

  //   try {
  //     const response = await Axios.post("/api/accounts/login/", formData);
  //     router.push("/");
  //   } catch (err) {
  //     setError(
  //       err.response?.data?.message || "Login failed. Please try again."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      const response = await Axios.post("/api/accounts/login/", {
        username: formData.username,
        password: formData.password,
      });
      // If login is successful, the token will be stored in the cookie
      console.log("Login successful:", response.data);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error("Login failed:", err.response);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin42 = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await Axios.get("/login42/");
      window.location.href = response.data.redirect_url;
    } catch (err) {
      setError("Login with 42 failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[rgb(34,40,49)] h-screen flex items-center justify-center">
      <div className="w-2/3 h-full m-6 bg-[#222831] flex flex-col items-center">
        <div className="h-[15%] flex items-center">
          <h1 className="text-[#FFD369] font-kreon text-4xl">Login</h1>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form
          className="flex flex-col items-center w-3/4 md:w-1/3"
          onSubmit={handleLogin}
        >
          <InputField
            id="username"
            label="Nickname"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your nickname"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-2/3 p-3 m-10 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>
        <button
          onClick={handleLogin42}
          disabled={loading}
          className={`mt-10 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <div className="loader"></div>
          ) : (
            <img src="./login.png" alt="Login with 42" className="w-56 h-36" />
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
  <div className="w-full flex flex-col mb-4">
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
