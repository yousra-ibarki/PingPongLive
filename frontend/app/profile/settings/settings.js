"use client";

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
    className="bg-[#393E46] rounded-full p-1 ease-in-out duration-500 transform hover:bg-[#C70000] hover:text-[#EEEEEE]"
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
      <div className="relative  flex flex-col items-center ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-102">
        <img
          src={image}
          alt="profile-pic"
          className="rounded-full h-32 w-32 cursor-pointer border border-[#FFD369]"
        />
        <div
          className="flex items-center justify-center absolute h-10 w-10 bottom-0 right-0 \
                      bg-[#393E46] text-white rounded-full p-1 cursor-pointer border border-[#FFD369]"
        >
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
    <div className="flex flex-col items-center w-full p-2 ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-102">
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

  const toggleTwoFa = () => setIsTwoFaEnabled((prev) => !prev);

  return (
    <div className="flex items-center justify-center w-full pt-1">
      <label
        className="flex items-center justify-center cursor-pointer w-[80%] space-x-4"
        aria-label={`2FA is currently ${
          isTwoFaEnabled ? "enabled" : "disabled"
        }`}
      >
        <input
          type="checkbox"
          checked={isTwoFaEnabled}
          onChange={toggleTwoFa}
          className="sr-only"
          aria-pressed={isTwoFaEnabled}
        />
        <div
          className={`relative h-14 max-w-[250px] min-w-[150px] w-[40%] border rounded-full transition-colors duration-700 
            ${
              isTwoFaEnabled
                ? "border-[#FFD369] bg-[#393E46]"
                : "border-[#C70000] bg-[#393E46]"
            }
          `}
        >
          <span
            className={`absolute w-16 h-16 bg-cover rounded-full transition-transform duration-700 ease-in-out top-1/2 transform -translate-y-1/2
              ${isTwoFaEnabled ? "right-0 bg-[#FFD369]" : "left-0 bg-[#C70000]"}
            `}
            style={{
              backgroundImage: `url('../../../2FAicon.png')`,
            }}
            aria-hidden="true"
          />
          {isTwoFaEnabled ? (
            <span
              className="absolute left-3 top-2.5 text-3xl font-extrabold text-start
                             text-[#FFD369] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          ) : (
            <span
              className="absolute right-2 top-2.5 text-3xl font-extrabold text-start
                         text-[#C70000] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          )}
        </div>
      </label>
    </div>
  );
};


const SaveButton = () => {
  return (
    <div className="flex h-32 items-center justify-evenly">
      <button
        className={`w-[30%] h-[50%] bg-[#FFD369] text-lg font-bold text-[#222831] rounded-full
                  border-[0.5px] border-[#222831] transition duration-700 ease-in-out transform
                  hover:-translate-y-1 hover:scale-102`}
      >
        Save
      </button>
      <button
        className={`w-[30%] h-[50%] bg-[#C70000] text-lg font-bold text-[#222831] rounded-full 
                  border-[0.5px] border-[#FFD369] transition duration-700 ease-in-out transform 
                  hover:-translate-y-1 hover:scale-102`}
      >
        Delete Account
      </button>
    </div>
  );
};

const Settings = () => {
  return (
    <div
      className="p-2 bg-[#131313] min-w-[320px] w-[90%] h-[1000px] rounded-2xl \
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
      <div className="pt-2 text-center h-[15%]">
        <p className="text-[#EEEEEE]">Two Factor Authentication *</p>
        <TwoFaToggle />
      </div>
      <SaveButton />
    </div>
  );
};

export default Settings;
