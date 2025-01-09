"use client";

import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Axios from "../(pages)/Components/axios";

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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleNext = async () => {
    if (!userData.username || !userData.email || !userData.password || !userData.password2) {
      setErrors({ general: "Please fill out all fields." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const stepOneData = {
        first_name: userData.first_name,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        password2: userData.password2,
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


  const handleRegister = async () => {
    if (!userData.selectedAvatar && !userData.avatar) {
      setErrors({ general: "Please select or upload an avatar." });
      return;
    }
    if (!userData.language) {
      setErrors({ general: "Please select a language." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let imageUrl;

      if (userData.selectedAvatar) {
        imageUrl = `https://127.0.0.1:8001/avatars/${userData.selectedAvatar}`;
      } else {
        console.log('Starting image upload...');
        const imageResponse = await Axios.post("/api/upload-image/", {
          image: userData.avatar
        });
        console.log('Image upload response:', imageResponse.data);
        imageUrl = imageResponse.data.url;
      }

      const stepTwoData = {
        language: userData.language,
        image: imageUrl,
      };

      console.log('Sending step two data:', stepTwoData);

      const response = await Axios.post("/api/accounts/register/steptwo/", stepTwoData);

      console.log('Registration successful:', response.data);
      onClose();
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
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