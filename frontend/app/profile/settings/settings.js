// pages/profile/settings.js
"use client";

import React, { useState } from "react";

export default function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic (e.g., send to backend)
  };

  return (
    <div className="bg-[#393E46] min-w-screen min-h-screen flex justify-center items-center">
      <div className="bg-[#27ccc3] w-[80%] h-[1000px]"></div>
      
    </div>
  );
}
