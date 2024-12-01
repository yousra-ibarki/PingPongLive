"use client";

import React, { useState, useEffect } from "react";
import Axios from "../Components/axios";

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await Axios.get("/api/2fa/status/");
      setIsEnabled(response.data.isTwoFaEnabled);
    } catch (error) {
      console.error("Error checking 2FA status:", error);
    }
    setIsLoading(false);
  };

  const startSetup = async () => {
    try {
      const response = await Axios.get("/api/2fa/setup/");
      setQrCode(response.data.qr_code);
      setSecretKey(response.data.secret_key);
      setError("");
    } catch (error) {
      console.error("Error starting 2FA setup:", error);
      setError("Failed to start 2FA setup. Please try again.");
    }
  };

  const verifyAndEnable = async (e) => {
    e.preventDefault();
    try {
      await Axios.post("/api/2fa/setup/", {
        token: verificationCode
      });
      setIsEnabled(true);
      setQrCode("");
      setSecretKey("");
      setVerificationCode("");
      setError("");
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      setError("Invalid verification code. Please try again.");
    }
  };

  const disable2FA = async () => {
    try {
      await Axios.post("/api/2fa/disable/");
      setIsEnabled(false);
      setError("");
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      setError("Failed to disable 2FA. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="bg-[#222831] p-6 rounded-lg shadow-lg">
      <h2 className="text-[#FFD369] font-kreon text-2xl mb-6">
        Two-Factor Authentication
      </h2>

      {error && (
        <div className="text-red-500 mb-4 text-sm">{error}</div>
      )}

      {isEnabled ? (
        <div className="flex flex-col items-center">
          <p className="text-white mb-4">
            Two-factor authentication is currently enabled.
          </p>
          <button
            onClick={disable2FA}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Disable 2FA
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {!qrCode ? (
            <button
              onClick={startSetup}
              className="bg-[#FFD369] text-[#222831] px-4 py-2 rounded-lg hover:bg-[#ffc107] transition-colors font-kreon"
            >
              Set Up 2FA
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-white mb-4">
                1. Scan this QR code with your authenticator app:
              </p>
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="QR Code"
                className="mb-4"
              />
              <p className="text-white mb-4">
                2. Or manually enter this secret key:
              </p>
              <code className="bg-[#393E46] text-white p-2 rounded mb-6">
                {secretKey}
              </code>
              <form onSubmit={verifyAndEnable} className="w-full max-w-xs">
                <div className="mb-4">
                  <label
                    htmlFor="verificationCode"
                    className="block text-[#FFD369] font-kreon mb-2"
                  >
                    Enter Verification Code:
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full p-2 rounded bg-[#393E46] text-white border border-[#FFD369]"
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    pattern="\d{6}"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#FFD369] text-[#222831] px-4 py-2 rounded-lg hover:bg-[#ffc107] transition-colors font-kreon"
                >
                  Verify and Enable
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;