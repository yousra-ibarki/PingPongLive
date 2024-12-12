"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import TwoFaToggle from "./twoFaToggle";
import SaveDeleteButtons from "./SaveDeleteButtons";
import InputField from "./input";
import "./animations.css";

// API Calls
const apiCallToUpdateProfile = async (profileData) => {
  try {
    const response = await axios.post(
      "/api/update_user/<user_id>/",
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

const apiCallToUpdate2FA = async (isTwoFaEnabled) => {
  try {
    const response = await axios.post("/api/two_factor/", {
      enabled: isTwoFaEnabled,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating 2FA:", error);
    throw error;
  }
};

const apiCallToChangePassword = async (passwordData) => {
  try {
    const response = await axios.post("/api/change_password/", passwordData);
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
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    isTwoFaEnabled: false,
  });
  const [errors, setErrors] = useState({});
  const [changedFields, setChangedFields] = useState({});

  // 2FA State and Functions
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [is2FALoading, setIs2FALoading] = useState(true);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await axios.get("/api/2fa/status/");
      setUserInputs((prev) => ({
        ...prev,
        isTwoFaEnabled: response.data.isTwoFaEnabled,
      }));
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      setTwoFAError("Error checking 2FA status");
    }
    setIs2FALoading(false);
  };

  const startSetup = async () => {
    try {
      const response = await axios.get("/api/2fa/setup/");
      setQrCode(response.data.qr_code);
      setSecretKey(response.data.secret_key);
      setTwoFAError("");
    } catch (error) {
      console.error("Error starting 2FA setup:", error);
      setTwoFAError("Failed to start 2FA setup.");
    }
  };

  const verifyAndEnable = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/2fa/setup/", { token: verificationCode });
      setUserInputs((prev) => ({ ...prev, isTwoFaEnabled: true }));
      setQrCode("");
      setSecretKey("");
      setVerificationCode("");
      setTwoFAError("");
      setIs2FASetupOpen(false);
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      setTwoFAError("Invalid verification code.");
    }
  };

  const disable2FA = async () => {
    try {
      await axios.post("/api/2fa/disable/");
      setUserInputs((prev) => ({ ...prev, isTwoFaEnabled: false }));
      setTwoFAError("");
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      setTwoFAError("Failed to disable 2FA.");
    }
  };

  const toggleTwoFa = () => {
    setUserInputs((prev) => ({
      ...prev,
      isTwoFaEnabled: !prev.isTwoFaEnabled,
    }));
    setChangedFields((prev) => ({ ...prev, isTwoFaEnabled: true }));

    if (!userInputs.isTwoFaEnabled) {
      setIs2FASetupOpen(true);
      startSetup();
    } else {
      disable2FA();
    }
  };
  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (
      userInputs.newPassword ||
      userInputs.confirmPassword ||
      userInputs.oldPassword
    ) {
      if (!userInputs.oldPassword)
        newErrors.oldPassword = "Old password is required.";
      if (userInputs.newPassword.length < 6)
        newErrors.newPassword = "Password must be at least 6 characters.";
      if (userInputs.newPassword !== userInputs.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userInputs.email && !emailRegex.test(userInputs.email)) {
      newErrors.email = "Please enter a valid email.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track changes
  const handleFieldChange = (field) => {
    setChangedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Save function handling multiple API calls
  const handleSave = async () => {
    if (validateForm()) {
      try {
        const responses = [];

        // Only update fields that have changed
        if (changedFields.username || changedFields.email) {
          responses.push(apiCallToUpdateProfile({ username, email }));
        }

        if (changedFields.isTwoFaEnabled) {
          responses.push(apiCallToUpdate2FA(isTwoFaEnabled));
        }

        if (newPassword && oldPassword && confirmPassword === newPassword) {
          responses.push(apiCallToChangePassword({ oldPassword, newPassword }));
        }

        // Await all responses
        await Promise.all(responses);
        console.log("Settings updated successfully");

        // Reset tracking and provide user feedback
        setChangedFields({});
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    } else {
      console.log("Form has errors.");
    }
  };

  // Toggle Two-Factor Authentication
  // const toggleTwoFa = () => {
  //   setUserInputs((prev) => ({
  //     ...prev,
  //     isTwoFaEnabled: !prev.isTwoFaEnabled,
  //   }));
  //   setChangedFields((prev) => ({ ...prev, isTwoFaEnabled: true }));
  // };

  return (
    <div className="p-2 bg-[#131313] min-w-[300px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl fade-in-globale">
      <div className="w-full flex justify-end cursor-pointer">
        <CloseButton size={24} color="#FFD369" />
      </div>

      <ProfilePicture />
      <hr
        className="w-full text-center"
        style={{ borderColor: "rgba(255, 211, 105, 0.5)" }}
      />

      <form className="lg:flex lg:items-center lg:justify-center">
        <div className="lg:w-full">
          <InputField
            label="Your username"
            placeholder="Username"
            type="text"
            value={userInputs.username}
            onChange={(e) => {
              setUserInputs((prev) => ({ ...prev, username: e.target.value }));
              handleFieldChange("username");
            }}
            error={errors.username}
          />
          <InputField
            label="Your Email"
            placeholder="example@email.com"
            type="email"
            value={userInputs.email}
            onChange={(e) => {
              setUserInputs((prev) => ({ ...prev, email: e.target.value }));
              handleFieldChange("email");
            }}
            error={errors.email}
          />
        </div>
        <div className="lg:w-full">
          <InputField
            label="Old password *"
            placeholder="Old password"
            type="password"
            value={userInputs.oldPassword}
            onChange={(e) => {
              setUserInputs((prev) => ({
                ...prev,
                oldPassword: e.target.value,
              }));
              handleFieldChange("oldPassword");
            }}
            error={errors.oldPassword}
          />
          <InputField
            label="New password *"
            placeholder="New password"
            type="password"
            value={userInputs.newPassword}
            onChange={(e) => {
              setUserInputs((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }));
              handleFieldChange("newPassword");
            }}
            error={errors.newPassword}
          />
        </div>
        <div className="lg:w-full lg:h-full">
          <InputField
            label="Confirm your password *"
            placeholder="Confirm password"
            type="password"
            value={userInputs.confirmPassword}
            onChange={(e) => {
              setUserInputs((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }));
              handleFieldChange("confirmPassword");
            }}
            error={errors.confirmPassword}
          />
          <div className="pt-2 lg:h-[220px] h-[15%] lg:flex lg:items-end">
            <TwoFaToggle
              isTwoFaEnabled={userInputs.isTwoFaEnabled}
              onToggle={toggleTwoFa}
            />
          </div>

          {is2FASetupOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#222831] p-6 rounded-lg shadow-lg">
                <h2 className="text-[#FFD369] font-kreon text-2xl mb-6">
                  Two-Factor Authentication
                </h2>
                {twoFAError && (
                  <div className="text-red-500 mb-4 text-sm">{twoFAError}</div>
                )}

                {is2FALoading ? (
                  <p className="text-white">Loading 2FA setup...</p>
                ) : !qrCode ? (
                  <p className="text-white">Generating 2FA setup...</p>
                ) : (
                  <div className="flex flex-col items-center">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code"
                      className="mb-4"
                    />
                    <code className="bg-[#393E46] text-white p-2 rounded mb-6">
                      {secretKey}
                    </code>
                    <form
                      onSubmit={verifyAndEnable}
                      className="w-full max-w-xs"
                    >
                      <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="6-digit code"
                        maxLength="6"
                        pattern="\d{6}"
                        required
                        className="w-full p-2 rounded bg-[#393E46] text-white border border-[#FFD369] mb-4"
                      />
                      <button
                        type="submit"
                        className="w-full bg-[#FFD369] text-[#222831] px-4 py-2 rounded-lg hover:bg-[#ffc107] transition-colors font-kreon"
                      >
                        Verify and Enable
                      </button>
                    </form>
                  </div>
                )}
                <button
                  onClick={() => setIs2FASetupOpen(false)}
                  className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
      <SaveDeleteButtons onSave={handleSave} />
    </div>
  );
};

export default Settings;
