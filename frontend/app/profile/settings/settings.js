"use client"

import React from "react";
import { useState } from "react";
import { FaCamera } from "react-icons/fa"; // Import camera icon from react-icons


const CloseButton = ({ size = 24, color = "#000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="bg-[#393E46] rounded-full p-1"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);



const ProfilePicSection = () => {
  const [image, setImage] = useState(
    "https://avatars.githubusercontent.com/u/774101?v=4"
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-[25%] items-center justify-center">
      <div className="relative  flex flex-col items-center">
        <img src={image} alt="profile-pic" className="rounded-full h-32 w-32 cursor-pointer border border-[#FFD369]" />
        <div className="flex items-center justify-center absolute h-10 w-10 bottom-0 right-0 \
                      bg-[#393E46] text-white rounded-full p-1 cursor-pointer border border-[#FFD369]">
          <label htmlFor="fileInput" className="cursor-pointer">
            <FaCamera />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type }) => {
  return (
    <div className="flex flex-col items-center w-full p-2">
      <label className="text-[#EEEEEE] ">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
      />
    </div>
  );
};

const TwoFaToggle = () => {
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(true);

  return (
    <div className="flex items-center justify-center w-full p-2 m-2">
      <div
        className={`h-14 w-[40%] rounded-full cursor-pointer transition-colors duration-500 ease-in-out relative overflow-hidden
                  ${
                    isTwoFaEnabled
                      ? "bg-[#FFD369] text-[#393E46] enabled"
                      : "bg-red-400 text-[#EEEEEE] disabled"
                  }`}
        onClick={() => setIsTwoFaEnabled(!isTwoFaEnabled)}
      >
        <img
          src="../../../2FAicon.png"
          width="20"
          className={`absolute rounded-lg top-1/2 transform -translate-y-1/2 transition-transform duration-500 ease-in-out
                    ${
                      !isTwoFaEnabled
                        ? "translate-x-[40%] rotate-0"
                        : "translate-x-[400%] rotate-360"
                    }`}
        />
      </div>
    </div>
  );
};

const Settings = () => {
  return (
    <div
      className="p-2 bg-[#131313] w-[95%] h-[85%] rounded-2xl \
                    border-[0.5px] border-[#FFD369] shadow-2xl"
    >
      <div className="w-full flex justify-end cursor-pointer">
        <CloseButton size={24} color="#FFD369" />
      </div>
      <ProfilePicSection />
      <InputField label="Your username" placeholder="Username" type="text" />
      <InputField
        label="Your Email"
        placeholder="example@email.com"
        type="email"
      />
      <InputField
        label="Old password *"
        placeholder="Old password"
        type="password"
      />
      <InputField
        label="New password *"
        placeholder="New password"
        type="password"
      />
      <InputField
        label="Confirm your password *"
        placeholder="confirm password"
        type="password"
      />
      <TwoFaToggle />
    </div>
  );
};

export default Settings;

