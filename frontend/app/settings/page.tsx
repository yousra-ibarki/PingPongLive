"use client"; 

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated by checking the access token cookie
    const accessToken = getCookie("logged_in");

    if (accessToken) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = getCookie("access_token");
  
    // Log the token for debugging
    // console.log("Access Token:", accessToken);
  
    if (!accessToken) {
      console.log("Not Authenticated");
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
  
    try {
      const response = await axios.post(
        "http://localhost:8000/api/change_password/",
        {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Correct Authorization header
            "Content-Type": "application/json",
          },
        }
      );
  
      setSuccess("Password updated successfully!");
      setError(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to update password. Please check your old password.");
    }
  };
  

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  // If user is not authenticated, show the login prompt and button
  if (!isAuthenticated) {
    return (
      <div>
        <h2>You are not logged in</h2>
        <p>Please log in to change your password.</p>
        <button onClick={() => router.push("/login")}>Log In</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        <div>
          <label>Old Password</label>
          <input
            className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New Password</label>
          <input
            className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm New Password</label>
          <input
            className="p-2 m-4 mt-0 rounded-lg bg-[#393E46] text-white"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ChangePasswordPage;
