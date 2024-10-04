"use client"; // Mark this component as a Client Component

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const RegistrationPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/accounts/register/', {
        username,
        email,
        password,
        password2,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // You can handle the response here (e.g., show a success message or redirect)
      console.log("Registration successful:", response.data);
      router.push("/login"); // Redirect to the login page after successful registration
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.password || "Registration failed.");
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Error during registration:", error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationPage;
