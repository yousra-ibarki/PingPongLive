"use client";

import React, { useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

const Register = ({onClose}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step tracker
  const [language, setLanguage] = useState("");
  const [avatar, setAvatar] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await Axios.post('/api/accounts/register/', {
        username,
        email,
        password,
        password2,
      });
      setStep(2);
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
    } finally { 
      setLoading(false);
    }
  };

  //  const handleRegister = async (e) => {
  //    e.preventDefault();
  //    try {
    //      const response = await axiosInstance.post("register/", {
      //        username,
      //        password,
      //      });
      //      console.log("Registration successful:", response.data);
      //      window.location.href = "/login"; // Redirect to login page after successful registration
      //    } catch (err) {
        //      setError("Registration failed. Username might be taken.");
        //      console.error("Registration failed:", err.response);
        //    }
        //  };
    const handleAvatarLanguageSubmit = () => {
      console.log("Avatar:", avatar);
      console.log("Language:", language);
      onClose(); // Close the modal or finish the registration process
    };
  if (step == 1)
    {
      return (
        <div className="w-full h-[90%] flex flex-row justify-center">
          <div className="w-full md:w-2/3 h-full bg-[#222831]">
            <div className="flex items-center h-[25%]">
              <img src="./logo.svg" alt="logo" className="absolute top-4 left-4 w-16 h-16 mx-4" />
              <h1 className="text-[#FFD369] font-kreon text-4xl absolute left-1/2 transform -translate-x-1/2">Register</h1>
            </div>
            <div className="flex flex-col items-center h-[85%]">
              {error && <p className="text-red-500">{error}</p>} {/* Error message display */}
              <form className="flex flex-col items-center justify-center w-2/3" onSubmit={handleRegister}>
                <div className="w-full flex flex-col justify-between m-2">
                  <label htmlFor="username" className="text-[#FFD369] font-kreon text-base ml-4">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
                    value={username}
                    placeholder="Username here"
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className="w-full flex flex-col justify-between m-2">
                  <label htmlFor="email" className="text-[#FFD369] font-kreon text-base ml-4">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
                    value={email}
                    placeholder="Email here"
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="w-full flex flex-col justify-between m-2">
                  <label htmlFor="password" className="text-[#FFD369] font-kreon text-base ml-4">Password</label>
                  <input 
                    type="password" 
                    id="password" 
                    className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
                    value={password}
                    placeholder="Password here"
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <div className="w-full flex flex-col justify-between m-2">
                  <label htmlFor="password2" className="text-[#FFD369] font-kreon text-base ml-4">Confirm Password</label>
                  <input 
                    type="password" 
                    id="password2" 
                    className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
                    value={password2}
                    placeholder="Confirm password here"
                    onChange={(e) => setPassword2(e.target.value)} 
                    required 
                  />
                </div>
                <button className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg flex justify-center
                        items-center"
                        type="submit"
                        disabled={loading}
  
                >
                  {loading ? (
                    <div className="loader"></div>
                  ) : (
                    "Next ->"
                  )}
                  {/* {loading ? "Loading..." : "Register"} */}
                </button>
              </form>
            </div>
          </div> 
        </div>
      );
    }
    else if (step == 2)
    {
      return (
        <div className="w-full h-[90%] flex flex-row justify-center">
          <div className="w-full md:w-2/3 h-full bg-[#222831]">
            <h1 className="text-[#FFD369] font-kreon text-4xl text-center mt-8">
              Choose Avatar and Language
            </h1>
            <div className="flex flex-col items-center mt-12">
              <label className="text-[#FFD369] font-kreon text-lg mb-4">
                Select Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="mb-8"
              />
              <label className="text-[#FFD369] font-kreon text-lg mb-4">
                Select Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="p-2 rounded-lg bg-[#393E46] text-white"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                {/* Add more languages */}
              </select>
              <button
                className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg"
                onClick={handleAvatarLanguageSubmit}
              >
                Finish
              </button>
            </div>
          </div>
        </div>
      );
    }
};

export default Register;




