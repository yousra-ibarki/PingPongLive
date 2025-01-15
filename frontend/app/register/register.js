"use client";

import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Axios from "../(pages)/Components/axios";
import { getBaseUrl } from "../../utils/utils";

const baseUrl = getBaseUrl();

const Register = ({ onClose }) => {
  const [userData, setUserData] = useState({
    first_name: "",
    username: "",
    email: "",
    password: "",
    password2: "",
    avatar: "",
    selectedAvatar: null,
    // language: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleNext = async () => {
    if (!userData.username || !userData.email || !userData.password || !userData.password2 || !userData.first_name) {
      setErrors({ general: "Please fill out all fields." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const stepOneData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        first_name: userData.first_name,
      };

      console.log('Sending step one data:', stepOneData);

      const response = await Axios.post("/api/accounts/register/stepone/", stepOneData);

      console.log('Step one data submission successful:', response.data);
      setStep(2);
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Failed to register to Step One. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(1);

  const handleImageUpload = async (imageData) => {
    try {
      if (imageData.startsWith('data:image')) {
        // Handle base64 image
        const response = await Axios.post("/api/upload-image/", {
          image: imageData
        });
        return response.data.url;
      } else {
        // Handle selected avatar
        return `${baseUrl}/avatars/${imageData}`;
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!userData.selectedAvatar && !userData.avatar) {
      setErrors({ general: "Please select or upload an avatar." });
      return;
    }
    // if (!userData.language) {
    //   setErrors({ general: "Please select a language." });
    //   return;
    // }

    setLoading(true);
    setErrors({});

    try {
      // Get image URL
      const imageUrl = await handleImageUpload(
        userData.selectedAvatar || userData.avatar
      );

      const completeData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
        first_name: userData.first_name,
        // language: userData.language,
        image: imageUrl,
      };

      console.log('Sending complete registration data:', completeData);

      const response = await Axios.post(
        "/api/accounts/register/steptwo/",
        completeData
      );

      console.log('Registration successful:', response.data);
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({
          general: error.message || 'Registration failed. Please try again.'
        });
      }
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
          errors={errors}
          loading={loading}
          onNext={handleNext}
          onClose={onClose}
        />
      ) : (
        <StepTwo
          userData={userData}
          setUserData={setUserData}
          errors={errors}
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