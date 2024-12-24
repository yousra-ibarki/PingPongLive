"use client";

import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Axios from "../Components/axios";

const Register = ({ onClose }) => {
  const [userData, setUserData] = useState({
    first_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
    avatar: "",
    selectedAvatar: null,
    language: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (!userData.username || !userData.email || !userData.password || !userData.password2) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setStep(2);
  };
  const handleBack = () => setStep(1);

  const handleRegister = async () => {
    if (!userData.selectedAvatar && !userData.avatar) {
      setError("Please select or upload an avatar.");
      return;
    }
    if (!userData.language) {
      setError("Please select a language.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let imageUrl;
      
      if (userData.selectedAvatar) {
        // If it's a default avatar, construct the full URL
        imageUrl = `https://127.0.0.1:8001/avatars/${userData.selectedAvatar}`;
      } else {
        // If it's an uploaded avatar, send it to the upload endpoint
        console.log('Starting image upload...');
        const imageResponse = await Axios.post("/api/upload-image/", {
          image: userData.avatar
        });
        console.log('Image upload response:', imageResponse.data);
        imageUrl = imageResponse.data.url;
      }

      const registrationData = {
        first_name: userData.first_name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        language: userData.language,
        image: imageUrl,
      };

      console.log('Sending registration data:', registrationData);

      const response = await Axios.post("/api/accounts/register/", registrationData);
      
      console.log('Registration successful:', response.data);
      localStorage.setItem("temp_user_id", response.data.user_id);
      onClose();
    } catch (error) {
      console.error('Error:', error.response?.data || error);
      setError(error.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {step === 1 ? (
        <StepOne
          userData={userData}
          setUserData={setUserData}
          error={error}
          loading={loading}
          onNext={handleNext}
          onClose={onClose}
        />
      ) : (
        <StepTwo
          userData={userData}
          setUserData={setUserData}
          error={error}
          onRegister={handleRegister}
          onBack={handleBack}
          loading={loading}
          onClose={onClose}
        />
      )}
    </>
  );
};

export default Register;