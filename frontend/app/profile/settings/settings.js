"use client";

import React from "react";
import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa"; // Import camera icon from react-icons
import Axios from "../../Components/axios"; // Your custom Axios instance

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
      <div className="relative flex flex-col items-center">
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
    <div className="flex flex-col items-center w-full p-2">
      <label className="text-[#EEEEEE]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
      />
    </div>
  );
};

// Frontend TwoFaToggle Component
const TwoFaToggle = () => {
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  // Fetch initial 2FA status
  useEffect(() => {
    const fetchTwoFaStatus = async () => {
      try {
        const response = await Axios.get("/api/2fa/status/");
        setIsTwoFaEnabled(response.data.isTwoFaEnabled);
      } catch (err) {
        setError("Failed to load 2FA status.");
      }
    };
    fetchTwoFaStatus();
  }, []);

  // Handle 2FA setup
  const setupTwoFa = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/api/2fa/setup/");
      setQrCode(response.data.qr_code);
      setSetupMode(true);
    } catch (err) {
      setError("Failed to fetch QR code.");
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA token during setup
  const verifySetup = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await Axios.post("/api/2fa/setup/", { token });
      setIsTwoFaEnabled(true);
      setSetupMode(false);
      setQrCode(null);
      setToken("");
    } catch (err) {
      setError("Failed to verify token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disableTwoFa = async () => {
    setLoading(true);
    setError(null);
    try {
      await Axios.post("/api/2fa/disable/");
      setIsTwoFaEnabled(false);
      setSetupMode(false);
      setQrCode(null);
      setToken("");
    } catch (err) {
      setError("Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle 2FA status
  const toggleTwoFa = () => {
    if (isTwoFaEnabled) {
      disableTwoFa();
    } else {
      setupTwoFa();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full pt-1">
      {error && <p className="text-red-500">{error}</p>}
      
      {setupMode && qrCode && (
        <div className="flex flex-col items-center w-full">
          <img 
            src={`data:image/png;base64,${qrCode}`} 
            alt="QR Code" 
            className="mb-4"
          />
          <p className="text-[#EEEEEE] mb-2">
            Scan this QR code with your authenticator app, then enter the code below
          </p>
          <input
            type="text"
            placeholder="Enter your token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-2 w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-[#FFD369]"
          />
          <button 
            onClick={verifySetup} 
            disabled={loading}
            className="mt-2 bg-[#FFD369] text-black rounded-md p-2 hover:bg-[#e6be5f]"
          >
            {loading ? "Verifying..." : "Verify Token"}
          </button>
        </div>
      )}

      <button
        className={`h-14 w-[40%] border rounded-full cursor-pointer ease-in-out relative overflow-hidden transition-colors duration-700
          ${isTwoFaEnabled ? "border-[#FFD369] bg-[#393E46]" : "border-[#C70000] bg-[#393E46]"}`}
        onClick={toggleTwoFa}
        aria-pressed={isTwoFaEnabled}
        aria-label={`2FA is currently ${isTwoFaEnabled ? "enabled" : "disabled"}`}
        disabled={loading || setupMode}
      >
        <span
          className={`absolute ${isTwoFaEnabled ? "left-3 text-[#FFD369]" : "right-2 text-[#C70000]"} top-2 text-3xl font-extrabold`}
        >
          2FA
        </span>
      </button>
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
      <div className="pt-2 text-center h-[15%]">
        <p className="text-[#EEEEEE]">Two Factor Authentication *</p>
        <TwoFaToggle />
      </div>
    </div>
  );
};

export default Settings;
