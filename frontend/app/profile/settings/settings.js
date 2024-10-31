"use client";

import React, { useState } from "react";
import axios from "axios";
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import TwoFaToggle from "./twoFaToggle";
import SaveDeleteButtons from "./SaveDeleteButtons";
import InputField from "./input";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(true);
  const [changedFields, setChangedFields] = useState({});

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword) newErrors.oldPassword = "Old password is required.";
      if (newPassword.length < 6)
        newErrors.newPassword = "Password must be at least 6 characters.";
      if (newPassword !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Track changes
  const handleFieldChange = (field, value, setValue) => {
    setValue(value);
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
    setIsTwoFaEnabled((prev) => !prev);
    setChangedFields((prev) => ({ ...prev, isTwoFaEnabled: true }));
  };

  return (
    <div className="p-2 bg-[#131313] min-w-[310px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl">
      <div className="w-full flex justify-end cursor-pointer">
        <CloseButton size={24} color="#FFD369" />
      </div>

      <ProfilePicture />
      <hr
        className="w-full text-center"
        style={{ borderColor: "rgba(255, 211, 105, 0.5)" }}
      />

      <div className="lg:flex lg:items-center lg:justify-center">
        <div className="lg:w-full">
          <InputField
            label="Your username"
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) =>
              handleFieldChange("username", e.target.value, setUsername)
            }
            error={errors.username}
          />
          <InputField
            label="Your Email"
            placeholder="example@email.com"
            type="email"
            value={email}
            onChange={(e) =>
              handleFieldChange("email", e.target.value, setEmail)
            }
            error={errors.email}
          />
        </div>
        <div className="lg:w-full">
          <InputField
            label="Old password *"
            placeholder="Old password"
            type="password"
            value={oldPassword}
            onChange={(e) =>
              handleFieldChange("oldPassword", e.target.value, setOldPassword)
            }
            error={errors.oldPassword}
          />
          <InputField
            label="New password *"
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(e) =>
              handleFieldChange("newPassword", e.target.value, setNewPassword)
            }
            error={errors.newPassword}
          />
        </div>
        <div className="lg:w-full lg:h-full">
          <InputField
            label="Confirm your password *"
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              handleFieldChange(
                "confirmPassword",
                e.target.value,
                setConfirmPassword
              )
            }
            error={errors.confirmPassword}
          />
          <div className="pt-2 lg:h-[220px] h-[15%] lg:flex lg:items-end">
            <TwoFaToggle
              isTwoFaEnabled={isTwoFaEnabled}
              onToggle={toggleTwoFa}
            />
          </div>
        </div>
      </div>

      <SaveDeleteButtons onSave={handleSave} />
    </div>
  );
};

export default Settings;
