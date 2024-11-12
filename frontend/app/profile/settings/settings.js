"use client";

import React, { useState } from "react";
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

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (userInputs.newPassword || userInputs.confirmPassword || userInputs.oldPassword) {
      if (!userInputs.oldPassword) newErrors.oldPassword = "Old password is required.";
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
  const toggleTwoFa = () => {
    setUserInputs((prev) => ({ ...prev, isTwoFaEnabled: !prev.isTwoFaEnabled }));
    setChangedFields((prev) => ({ ...prev, isTwoFaEnabled: true }));
  };

  return (
    <div className="p-2 bg-[#131313] min-w-[310px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl fade-in">
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
        </div>
      </form>
      <SaveDeleteButtons onSave={handleSave} />
    </div>
  );
};

export default Settings;
