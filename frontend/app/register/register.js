"use client";

import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Axios from "../(pages)/Components/axios";
import { getBaseUrl } from "../../utils/utils";
import toast from "react-hot-toast";

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

      const response = await Axios.post("/api/accounts/register/stepone/", stepOneData);
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
        console.log('imageData//*', imageData);
        console.log('baseUrl//*', baseUrl);
        return `${baseUrl}/avatars/${imageData}`;
      }
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!userData.selectedAvatar && !userData.avatar) {
      setErrors({ general: "Please select or upload an avatar." });
      return;
    }
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
        image: imageUrl,
      };


      const response = await Axios.post(
        "/api/accounts/register/steptwo/",
        completeData
      );
      onClose();
    } catch (error) {
      toast.error("Registration failed. Please try again.");
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