"use client";

import React, { useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";
import { LiaUploadSolid } from "react-icons/lia";

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
  const avatarImages = ["defaultAv_1.jpg", "defaultAv_2.jpg", "defaultAv_3.jpg"];
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setStep(2);
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
  const handleAllRegistration = async(e) => {
    e.preventDefault();
    setLoading(true);
    if (!selectedAvatar && !avatar) {
      alert("Please select or upload an avatar.");
      return;
    }
    if (!language) {
      alert("Please select a language.");
      return;
    }
    try {
      const response = await Axios.post("/api/accounts/register/", {
        username,
        email,
        password,
        password2,
        // avatar: selectedAvatar || avatar, // Use the selected avatar or the uploaded image
        // language,
      });
      console.log("Registration successful:", response.data);
      onClose();
    }
    catch (error) {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result); // Update avatar with the uploaded image's data URL
      setSelectedAvatar(null); // Reset selected predefined avatar if a custom image is uploaded
    };
    reader.readAsDataURL(file);
  };

  if (step == 1) {
    return (
      <div className="w-full  flex flex-row justify-center">
        <div className="w-full md:w-2/3 h-full bg-[#222831]">
          <div className="flex items-center h-[25%]">
            <img
              src="./logo.svg"
              alt="logo"
              className="absolute top-4 left-4 w-16 h-16 mx-4"
            />
            <h1 className="text-[#FFD369] font-kreon text-4xl absolute left-1/2 transform -translate-x-1/2">
              Register
            </h1>
          </div>
          <div className="flex flex-col items-center h-[85%]">
            {error && <p className="text-red-500">{error}</p>}{" "}
            {/* Error message display */}
            <form
              className="flex flex-col items-center justify-center w-2/3"
              onSubmit={handleRegister}
            >
              <div className="w-full flex flex-col justify-between m-2">
                <label
                  htmlFor="username"
                  className="text-[#FFD369] font-kreon text-base ml-4"
                >
                  Username
                </label>
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
                <label
                  htmlFor="email"
                  className="text-[#FFD369] font-kreon text-base ml-4"
                >
                  Email
                </label>
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
                <label
                  htmlFor="password"
                  className="text-[#FFD369] font-kreon text-base ml-4"
                >
                  Password
                </label>
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
                <label
                  htmlFor="password2"
                  className="text-[#FFD369] font-kreon text-base ml-4"
                >
                  Confirm Password
                </label>
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
              <button
                className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg flex justify-center
                        items-center"
                type="submit"
                disabled={loading}
              >
                {loading ? <div className="loader"></div> : "Next ->"}
                {/* {loading ? "Loading..." : "Register"} */}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  } else if (step == 2) {
    const languages = [
      { code: "en", label: "English", flag: "/flags/en.png" }, // Example flag path
      { code: "fr", label: "French", flag: "/flags/fr.png" },
      { code: "de", label: "Germany", flag: "/flags/gr.png" },
      // Add more languages as needed
    ];
    return (
      <div className="w-full h-[90%] flex flex-row justify-center">
        <div className="w-full   h-full bg-[#222831]">
          <h1 className="text-[#FFD369] font-kreon text-4xl text-center mt-8">
            Choose Avatar and Language
          </h1>
          <div className="h-full w-full flex flex-col items-center mt-8">
            <div className="w-[40%] text-center text-gray-900 bg-[#FFD369] font-kreon text-lg mb-4 rounded-2xl ">
              Select a Predefined Avatar
            </div>
            <div className="w-full h-[25%] flex  justify-evenly items-center">
              {avatarImages.map((avatarPath, index) => (
                <img
                  key={index}
                  src={`/avatars/${avatarPath}`} // Assuming your avatars are in the public/avatars directory
                  alt={`Avatar ${index + 1}`}
                  className={`w-28 h-28 lg:w-40 lg:h-40  object-cover rounded-full cursor-pointer ${
                    selectedAvatar === avatarPath
                      ? "border border-[#FFD369]"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedAvatar(avatarPath);
                    setAvatar(null); // Reset uploaded avatar if predefined is selected
                  }}
                />
              ))}
            </div>
            <hr className="w-[80%] border-[#FFD369] my-4" />
            <div className="w-[80%] h-[30%] flex flex-col items-center justify-evenly">
              <div className="text-gray-900 text-center w-[40%] bg-[#FFD369] rounded-2xl">
                Or Upload your own Avatar
              </div>
              <label
                htmlFor="fileInput"
                className="bg-[#393E46] text-white rounded-full p-2 cursor-pointer border border-[#FFD369] flex items-center justify-center transition-colors duration-300 hover:bg-[#FFD369] hover:text-[#393E46]"
              >
                <LiaUploadSolid />
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange} // Attach the event handler
                className="hidden"
              />
              {avatar && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={avatar}
                    alt="Uploaded Avatar Preview"
                    className="w-20 h-20 object-cover rounded-full mb-4 border border-[#FFD369]"
                  />
                </div>
              )}
            </div>

            <hr className="w-[80%] border-[#FFD369] my-4" />
            <div className="w-[80%] h-[25%] flex flex-col justify-center items-center">
              <h2 className="text-gray-900 text-center bg-[#FFD369] w-[40%] rounded-2xl font-kreon text-lg mb-4">
                Select Your Language
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {languages.map((lang, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center w-24 h-24 cursor-pointer rounded-lg border-2 ${
                      language === lang.code
                        ? "border-[#FFD369]"
                        : "border-transparent"
                    } bg-[#393E46] hover:scale-105 transition-transform`}
                    onClick={() => setLanguage(lang.code)}
                  >
                    <img
                      src={lang.flag} // Replace with the actual flag path
                      alt={`${lang.label} Flag`}
                      className="w-16 h-16 object-contain"
                    />
                    <p className="text-white mt-2 text-sm">{lang.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="w-1/2 p-2 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg mt-10"
              onClick={handleAllRegistration}
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





