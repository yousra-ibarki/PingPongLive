"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios"; // Your custom Axios instance
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import SaveDeleteButtons from "./saveDeleteButtons";
import InputField from "./input";
import "./animations.css";
import TwoFaComponent from "./twoFaToggle";


// API Calls
const apiCallToUpdateProfile = async (profileData) => {
  try {
    const response = await Axios.post(
      "/api/update_user/<user_id>/",
      profileData
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
    console.log("fields changed: ", changedFields);
    if (validateForm()) {
      console.log("form is valid", userInputs);
      try {
        const responses = [];

        // Only update fields that have changed
        if (changedFields.username || changedFields.email) {

          console.log("Updating first_name...");
          // responses.push(apiCallToUpdateProfile({ username, email }));
        }

        if (changedFields.isTwoFaEnabled) {
          responses.push(apiCallToUpdate2FA(isTwoFaEnabled));
        }

        if (changedFields.oldPassword && changedFields.newPassword && changedFields.confirmPassword) {
          console.log("passwords: ", userInputs.oldPassword, userInputs.newPassword, userInputs.confirmPassword);
          responses.push(apiCallToChangePassword({ oldPassword: userInputs.oldPassword, newPassword: userInputs.newPassword, confirmPassword: userInputs.confirmPassword }));
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
    setUserInputs((prev) => ({
      ...prev,
      isTwoFaEnabled: !prev.isTwoFaEnabled,
    }));
    setChangedFields((prev) => ({ ...prev, isTwoFaEnabled: true }));
  };

  return (
    <div className="overflow-hidden p-2 bg-[#131313] min-w-[310px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl fade-in">
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
          <div className="lg:h-[220px] flex flex-col items-center justify-center w-full p-2 ">
            <label className="text-[#EEEEEE] ">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              disabled
              className={`w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border border-gray-500`}
            />
          </div>
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
          <div className="pt-2 lg:h-[220px] h-[15%] lg:flex lg:items-center w-full">
            <TwoFaComponent />
          </div>
        </div>
      </form>
      <SaveDeleteButtons onSave={handleSave} />
    </div>
  );
};

export default Settings;