"use client"; // Mark this component as a Client Component

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const UserProfile = () => {
  const [userData, setUserData] = useState<any>(null); // State for user data
  const [firstName, setFirstName] = useState(""); // State for first name
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null); // State for image upload
  const [message, setMessage] = useState<string | null>(null); // For success/error messages
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user_profile/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setUserData(response.data);
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/"); // Redirect to login if there's an error
      }
    };

    fetchUserData();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    if (image) {
      formData.append('image', image); // Append image if present
    }

    try {
      const response = await axios.put('http://localhost:8000/api/user_profile/', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });

      if (response.status === 200) {
        setMessage("User data updated successfully.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      setMessage("Error updating user data.");
    }
  };

  if (!userData) return <div>Loading...</div>; // Optionally show loading state

  return (
    <div>
      <h1>User Profile</h1>
      <form onSubmit={handleUpdate}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Profile Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
          />
        </div>
        <button type="submit">Update</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UserProfile;
