"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import Axios from "../Components/axios"; // Your custom Axios instance
import toast from "react-hot-toast";



const TwoFaToggle = ({ isTwoFaEnabled, onToggle }) => {

  return (
    <div className=" w-full h-[70%]">
      {/* <p className="text-[#EEEEEE] text-center  h-[17%]">
        Two Factor Authentication *
      </p> */}
      <label
        className="flex items-center justify-center cursor-pointer w-full space-x-4"
        aria-label={`2FA is currently ${
          isTwoFaEnabled ? "enabled" : "disabled"
        }`}
      >
        <input
          type="checkbox"
          checked={isTwoFaEnabled}
          onChange={onToggle}
          className="sr-only"
          aria-pressed={isTwoFaEnabled}
        />
        <div
          className={`relative h-14 max-w-[250px] min-w-[150px] lg:w-[15%] border rounded-full transition-colors duration-700 
            ${
              isTwoFaEnabled
                ? "border-[#FFD369] bg-[#393E46]"
                : "border-[#C70000] bg-[#393E46]"
            }
          `}
        >
          <span
            className={`absolute w-16 h-16 bg-cover rounded-full transition-transform duration-700 ease-in-out top-1/2 transform -translate-y-1/2
              ${isTwoFaEnabled ? "right-0 bg-[#FFD369]" : "left-0 bg-[#C70000]"}
            `}
            style={{
              backgroundImage: `url('../../../2FAicon.png')`,
            }}
            aria-hidden="true"
          />
          {isTwoFaEnabled ? (
            <span
              className="absolute left-3 top-2.5 text-3xl font-extrabold text-start
                             text-[#FFD369] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          ) : (
            <span
              className="absolute right-2 top-2.5 text-3xl font-extrabold text-start
                         text-[#C70000] transform -translate-x-1 transition-transform duration-700 ease-in-out"
            >
              2FA
            </span>
          )}
        </div>
      </label>
    </div>
  );
};


const TwoFaComponent = () => {
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canEnable2fa, setCanEnable2fa] = useState(null);

  // Fetch initial 2FA status from the server
  useEffect(() => {
    const fetchTwoFaStatus = async () => {
      try {
        const response = await Axios.get("/api/2fa/status/");
        setIsTwoFaEnabled(response.data.isTwoFaEnabled);
        setCanEnable2fa(response.data.can_enable_2fa);
      } catch (err) {
        setError("Failed to load 2FA status.");
      }
    };
    fetchTwoFaStatus();
  }, [isTwoFaEnabled]);

  if (error) {
    toast.error(error || "Failed to load 2FA status.");
  }
  if (!canEnable2fa) {
    return (
      <div>
      </div>
    );
  };

  // Handle 2FA setup
  const setupTwoFa = async () => {
    try {
      setLoading(true);
      const response = await Axios.get("/api/2fa/setup/");
      setQrCode(response.data.qr_code);
      setSetupMode(true);
      setIsModalOpen(true); // Open modal when setup starts
    } catch (err) {
      toast.error("Failed to start 2FA setup.");
    } finally {
      setLoading(false);
    }
  };

  // Verify 2FA token during setup
  const verifySetup = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await Axios.post("/api/2fa/setup/", { token });
      setIsTwoFaEnabled(true);
      setSetupMode(false);
      setQrCode(null);
      setToken("");
      setIsModalOpen(false); // Close modal after success
    } catch (err) {
      toast.error("Failed to verify 2FA token.");
    } finally {
      setLoading(false);
    }
  };

  // Disable 2FA
  const disableTwoFa = async () => {
    setLoading(true);
    setError(null);
    try {
      await Axios.post("/api/2fa/disable/");
      setIsTwoFaEnabled(false);
      setSetupMode(false);
      setQrCode(null);
      setToken("");
    } catch (err) {
      toast.error("Failed to disable 2FA.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle 2FA status
  const toggleTwoFa = () => {
    if (isTwoFaEnabled) {
      disableTwoFa();
    } else {
      setupTwoFa();
    }
  };

  return (
    <div className="w-full">
      <TwoFaToggle isTwoFaEnabled={isTwoFaEnabled} onToggle={toggleTwoFa} />
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="text-center">
            <p>Scan the QR Code to complete 2FA setup</p>
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code for 2FA setup"
              className="my-4"
            />
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter 2FA token"
              className="border p-2 rounded"
            />
            <button
              onClick={verifySetup}
              disabled={loading}
              className="bg-[#FFD369] text-black px-4 py-2 rounded mt-4"
            >
              {loading ? "Verifying..." : "Verify Token"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TwoFaComponent;