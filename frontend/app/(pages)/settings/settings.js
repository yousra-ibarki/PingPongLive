"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios"; // Your custom Axios instance
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import SaveDeleteButtons from "./saveDeleteButtons";
import InputField from "./input";
import "./animations.css";
import TwoFaComponent from "./twoFaToggle";
import PasswordChangeModal from "./passwordChangeModal";
import EmailChangeModal from './emailChangeModal';

// Frontend TwoFaToggle Component
const TwoFaToggle = () => {
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  // Fetch initial 2FA statusrofile/settings
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
          <div className="w-full flex justify-end cursor-pointer">
            <CloseButton size={24} color="#FFD369" />
          </div>
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

// API Calls
const apiCallToUpdateEmail = async (emailData) => {
  try {
    const response = await Axios.post(
      "/api/change-email/",
      {
        old_email: emailData.old_email,
        new_email: emailData.new_email,
        confirm_email: emailData.confirm_email
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const apiCallToChangePassword = async (passwordData) => {
  try {
    const response = await Axios.post("/api/change_password/", passwordData);
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Main Settings Component
const Settings = () => {
  const [userInputs, setUserInputs] = useState({

    username: "",
    email: "",
    isTwoFaEnabled: false,
    authProvider: 'local' // Add default value
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Fetch user data including auth provider
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await Axios.get("/api/user/profile/");
        setUserInputs(prev => ({
          ...prev,
          username: response.data.username,
          email: response.data.email,
          isTwoFaEnabled: response.data.is_2fa_enabled,
          authProvider: response.data.auth_provider
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userInputs.email && !emailRegex.test(userInputs.email)) {
      newErrors.email = "Please enter a valid email.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      await apiCallToChangePassword(passwordData);
      console.log("Password updated successfully");
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  };

  const handleEmailChange = async (emailData) => {
    try {
      await apiCallToUpdateEmail({
        old_email: emailData.old_email,
        new_email: emailData.new_email,
        confirm_email: emailData.confirm_email
      });  
      setUserInputs(prev => ({ ...prev, email: emailData.new_email }));
      setIsEmailModalOpen(false);
      console.log("Email updated successfully");
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  };

  // const handleFieldChange = (field) => {
  //   if (field !== 'username') { // Add this check
  //     setChangedFields((prev) => ({ ...prev, [field]: true }));
  //   }
  // };
  
  // const handleFieldChange = (field) => {
  //   setChangedFields((prev) => ({ ...prev, [field]: true }));
  // };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const responses = [];

        if (changedFields.email) {
          responses.push(apiCallToUpdateEmail({ 
            email: userInputs.email 
          }));
        }

        if (changedFields.isTwoFaEnabled) {
          responses.push(apiCallToUpdate2FA(isTwoFaEnabled));
        }

        if (changedFields.oldPassword && changedFields.newPassword && changedFields.confirmPassword) {
          console.log("passwords: ", userInputs.oldPassword, userInputs.newPassword, userInputs.confirmPassword);
          responses.push(apiCallToChangePassword({ oldPassword: userInputs.oldPassword, newPassword: userInputs.newPassword, confirmPassword: userInputs.confirmPassword }));
        }

        await Promise.all(responses);
        console.log("Settings updated successfully");
        setChangedFields({});
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    }
  };

  return (
    <div className="p-2 bg-[#131313] min-w-[310px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl fade-in">
      <div className="w-full flex justify-end cursor-pointer">
        <CloseButton size={24} color="#FFD369" />
      </div>

      <ProfilePicture />
      <hr className="w-full text-center" style={{ borderColor: "rgba(255, 211, 105, 0.5)" }} />

      <form className="lg:flex lg:items-center lg:justify-center">
        <div className="lg:w-full">
          {/* Username field (disabled) */}
          <InputField
            label="Your username"
            placeholder="Username"
            type="text"
            value={userInputs.username}
            onChange={() => {}}
            disabled={true}
            readOnly={true}
            className="bg-[#232323] opacity-50 cursor-not-allowed"
          />
          
          {/* Email field (disabled) */}
          <InputField
            label="Your Email"
            placeholder="example@email.com"
            type="email"
            value={userInputs.email}
            onChange={() => {}}
            disabled={true}
            readOnly={true}
            className="bg-[#232323] opacity-50 cursor-not-allowed"
          />

          {/* Add the Change Email button in a centered container */}
          <div className="w-full flex justify-center items-center mt-4 mb-4">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="group relative h-12 w-[40%] overflow-hidden rounded-lg bg-[#393E46] border-2 border-[#FFD369] 
                text-[#FFD369] shadow-md transition-all hover:shadow-lg hover:bg-[#2D3238]"
            >
              <span className="relative z-10 font-semibold">Change Email</span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 
                group-hover:bg-[#FFD369]/10">
              </div>
            </button>
          </div>
          
          {/* Conditionally render Password Change Button */}
          {userInputs.authProvider === 'local' && (
            <div className="w-full flex justify-center items-center mt-4 mb-4">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="group relative h-12 w-[40%] overflow-hidden rounded-lg bg-[#393E46] border-2 border-[#FFD369] 
                  text-[#FFD369] shadow-md transition-all hover:shadow-lg hover:bg-[#2D3238]"
              >
                <span className="relative z-10 font-semibold">Change Password</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 
                  group-hover:bg-[#FFD369]/10">
                </div>
              </button>
            </div>
          )}
        </div>

        <div className="pt-2 lg:h-[220px] h-[15%] lg:flex lg:items-center w-full">
          <TwoFaComponent />
        </div>

        {/* <div className="lg:w-full lg:h-full">
          <div className="pt-2 lg:h-[220px] h-[15%] lg:flex lg:items-end">
            <TwoFaToggle
              isTwoFaEnabled={userInputs.isTwoFaEnabled}
              onToggle={toggleTwoFa}
            />
          </div>
        </div> */}
      </form>

      <SaveDeleteButtons onSave={handleSave} />
      
      {/* Modals */}
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailChange}
        currentEmail={userInputs.email}
      />
      {/* Password Change Modal */}
      {userInputs.authProvider === 'local' && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordChange}
        />
      )}
    </div>
  );
};

export default Settings;