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

  const MAX_IMAGE_SIZE = 900 * 1024; // 5MB in bytes

  // Utility function to check image size from base64 string
  const getBase64ImageSize = (base64String) => {
  // Remove data URL prefix and get only the base64 content
  const base64Content = base64String.split(';base64,')[1];
  // Calculate size in bytes
  const padding = base64Content.endsWith('==') ? 2 : base64Content.endsWith('=') ? 1 : 0;
  return (base64Content.length * 0.75) - padding;
};

  const handleImageUpload = async (imageData) => {
    try {
      if (imageData.startsWith('data:image')) {
        // Check image size for base64 images
        const imageSize = getBase64ImageSize(imageData);
        
        if (imageSize > MAX_IMAGE_SIZE) {
          toast.error("Image size must be less than 900 KB");
          throw new Error("Image size must be less than 900 KB");
        }
        
        const response = await Axios.post("/api/upload-image/", {
          image: imageData
        });
        return response.data.url;
      } else {
        // Handle selected avatar from predefined list
        return `${baseUrl}/avatars/${imageData}`;
      }
    } catch (error) {
      setErrors({ general: "Failed to upload image. Please try again." });
      toast.error("Failed to upload image. Please try again.");
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
      console.log(completeData);

      if (!completeData.image) {
        setErrors({ general: "Failed to upload image. Please try again." });
        return;
      }


      const response = await Axios.post(
        "/api/accounts/register/steptwo/",
        completeData
      );
      onClose();
    } catch (error) {
      toast.error(error.message || "Registration failed. Please try again.");
      // toast.error("Registration failed. Please try again.");
      // if (error.response?.data) {
      //   setErrors(error.response.data);
      // } else {
      //   setErrors({
      //     general: error.message || 'Registration failed. Please try again.'
      //   });
      // }
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