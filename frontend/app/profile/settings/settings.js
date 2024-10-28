"use client";

import React from "react";
import { useState } from "react";
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import TwoFaToggle from "./twoFaToggle";
import SaveDeleteButtons from "./SaveDeleteButtons";



const InputField = ({ label, placeholder, type, value, onChange, error }) => {
  return (
    <div
      className="lg:h-[220px] flex flex-col items-center justify-center w-full p-2
                    ease-in-out duration-500 transform hover:-translate-y-1 hover:scale-102"
    >
      <label className="text-[#EEEEEE] ">{label}</label>
      <input
        type={type}
        value={value} // Controlled by parent state
        onChange={onChange} // Updates parent state
        placeholder={placeholder}
        className={`w-[80%] p-2 bg-[#393E46] text-[#EEEEEE] rounded-md border ${
          error ? "border-red-500" : "border-[#FFD369]"
        }`}
      />
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
};


// main component;

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

  // Handle field change tracking
  const handleFieldChange = (field, value, setValue) => {
    setValue(value);
    setChangedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Handle Save button click
  const handleSave = () => {
    if (validateForm()) {
      const updatedFields = {};
      if (changedFields.username) updatedFields.username = username;
      if (changedFields.email) updatedFields.email = email;
      if (changedFields.isTwoFaEnabled)
        updatedFields.isTwoFaEnabled = isTwoFaEnabled;
      if (newPassword && oldPassword && confirmPassword === newPassword) {
        updatedFields.oldPassword = oldPassword;
        updatedFields.newPassword = newPassword;
      }

      console.log("Updated fields: ", updatedFields);
      // Proceed with saving data (e.g., API call with `updatedFields`)
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
    <div
      className="p-2 bg-[#131313] min-w-[310px] w-[90%] lg:h-[1100px] h-[900px] rounded-2xl 
                 border-[0.5px] border-[#FFD369] shadow-2xl"
    >
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
