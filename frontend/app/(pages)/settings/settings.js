"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios"; // Your custom Axios instance
import ProfilePicture from "./profilePicture";
import CloseButton from "./closeBtn";
import DeleteButtons from "./saveDeleteButtons";
import "./animations.css";
import TwoFaComponent from "./twoFaToggle";
import PasswordChangeModal from "./passwordChangeModal";
import EmailChangeModal from './emailChangeModal';
import { toast } from "react-hot-toast";
import NameChangeModal from "./nameChangeModal";


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
    toast.error(error.response?.data?.error || "Failed to update email");
    throw error;
  }
};

const apiCallToChangePassword = async (passwordData) => {
  try {
    const response = await Axios.post("/api/change_password/", {
      old_password: passwordData.old_password,
      new_password: passwordData.new_password,
      new_password2: passwordData.confirm_password
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const apiCallToChangeName = async (nameData) => {
  try {
    const response = await Axios.post("/api/update_first_name/", {
      new_name: nameData.new_name,
      confirm_new_name: nameData.confirm_new_name
    });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to update name");
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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

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
        toast.error("Failed to load user data");
      }
    };
    fetchUserData();
  }, []);

  const handlePasswordChange = async (passwordData) => {
    try {
      await apiCallToChangePassword(passwordData);
      toast.success("Password updated successfully");
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update password");
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
      toast.success("Email updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update email");
    }
  };
  const handleNameChange = async (nameData) => {
    try {
      console.log("HERE");
      await apiCallToChangeName({ 
        new_name: nameData.new_name,
        confirm_new_name: nameData.confirm_new_name
       });
      setUserInputs(prev => ({ ...prev, username: nameData.new_name }));
      toast.success("Name updated successfully");
      setIsNameModalOpen(false);
    } catch (error) {
      console.log("999000 ",error);
      toast.error(error.response?.data?.error || "Failed to update name");
    }
  }

  // Add useEffect to handle body class for no-scroll
  useEffect(() => {
    if (isPasswordModalOpen || isEmailModalOpen || isNameModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isPasswordModalOpen, isEmailModalOpen, isNameModalOpen]);

  return (
    <div className="p-2 bg-[#131313] min-w-[310px] w-[90%] md:[50%] lg:w-[30%] rounded-2xl border-[0.5px] border-[#FFD369] shadow-2xl fade-in">
      <div className="w-full flex justify-end cursor-pointer">
        <CloseButton size={24} color="#FFD369" />
      </div>

      <ProfilePicture />

      <form className="p-6">
        <div className="w-full h-[100px] flex justify-center items-center mt-2 mb-2">
            <button
              type="button"
              onClick={() => setIsEmailModalOpen(true)}
              className="group relative h-20 w-1/2 md:w-[300px] overflow-hidden rounded-lg bg-[#393E46] border-2 border-[#FFD369] 
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
            <div className="w-full h-[100px] flex justify-center items-center mt-2 mb-2">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="group relative h-20 w-1/2 md:w-[300px] overflow-hidden rounded-lg bg-[#393E46] border-2 border-[#FFD369] 
                  text-[#FFD369] shadow-md transition-all hover:shadow-lg hover:bg-[#2D3238]"
              >
                <span className="relative z-10 font-semibold">Change Password</span>
                <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 
                  group-hover:bg-[#FFD369]/10">
                </div>
              </button>
            </div>
          )}
          <div className="w-full h-[100px] flex justify-center items-center mt-2 mb-2">
            <button
              type="button"
              onClick={() => setIsNameModalOpen(true)}
              className="group relative h-20 w-1/2 md:w-[300px] overflow-hidden rounded-lg bg-[#393E46] border-2 border-[#FFD369] 
                text-[#FFD369] shadow-md transition-all hover:shadow-lg hover:bg-[#2D3238]"
            >
              <span className="relative z-10 font-semibold">Change Name</span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-lg transition-all duration-300 group-hover:scale-100 
                group-hover:bg-[#FFD369]/10">
              </div>
            </button>
          </div>
        <div className="pt-2 h-[80px] md:h-[100px] lg:flex lg:items-center w-full">
          <TwoFaComponent />
        </div>
      </form>

      <DeleteButtons />
      
      {/* Modals */}
      <EmailChangeModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleEmailChange}
        currentEmail={userInputs.email}
      />
      {userInputs.authProvider === 'local' && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={handlePasswordChange}
        />
      )}
      <NameChangeModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmit={handleNameChange}
        currentName={userInputs.username}
      />
    </div>
  );
};

export default Settings;