"use client";

import React, { useState } from "react";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import Axios from "../Components/axios";

const Register = ({ onClose }) => {
  const [userData, setUserData] = useState({
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
  const [step, setStep] = useState(1); // Track current step

  const handleNext = () => {
    if (!userData.username || !userData.email || !userData.password || !userData.password2) {
      setError("Please fill out all fields.");
      return;
    }
    setError("");
    setStep(2);
  };

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
      const response = await Axios.post("/api/accounts/register/", userData);
      console.log("Registration successful:", response.data);
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.password || "Registration failed. Please try again."
      );
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
        />
      ) : (
        <StepTwo
          userData={userData}
          setUserData={setUserData}
          error={error}
          onRegister={handleRegister}
          loading={loading}
        />
      )}
    </>
  );
};

export default Register;
