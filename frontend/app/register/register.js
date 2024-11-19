"use client";

import React, { useState } from "react";
import Axios from "../Components/axios";
import { useRouter } from "next/navigation";

const Registration = ({ onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await Axios.post("/api/accounts/register/", formData);
    

      console.log("Registration successful:", response.data);
      
      // Store user_id for 2FA setup if needed
      localStorage.setItem('temp_user_id', response.data.user_id);
      
      // Close modal if using one
      if (onClose) onClose();
      
      // Redirect to 2FA setup or login
      // router.push("/setup-2fa");
      router.push("/login");

    } catch (error) {
      setIsLoading(false);
      
      if (error.response?.data) {
        // Handle structured errors from backend
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ general: "Registration failed. Please try again." });
        }
      } else {
        setErrors({ general: "Network error. Please check your connection." });
      }
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          required
        />
        {errors.username && <span className="error">{errors.username}</span>}
      </div>

      <div>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <input
          type="password"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          placeholder="Confirm Password"
          required
        />
        {errors.password2 && <span className="error">{errors.password2}</span>}
      </div>

      {errors.general && (
        <div className="error-message">{errors.general}</div>
      )}

      <button 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Registration;


// const Register = ({onClose}) => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [password2, setPassword2] = useState("");
//   const [error, setError] = useState("");
//   const router = useRouter();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:8000/api/accounts/register/', {
//         username,
//         email,
//         password,
//         password2,
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//       onClose();
//       // Redirect to the login page after successful registration
//       console.log("Registration successful:", response.data);

//       // router.push("/login");
//     } catch (error) {
//       if (error.response) {
//         setError(error.response.data.password || "Registration failed.");
//       } else {
//         setError("Registration failed. Please try again.");
//       }
//       console.error("Error during registration:", error);
//     }
//   };

//   return (
//     <div className="w-full h-[90%] flex flex-row justify-center">
//       <div className="w-full md:w-2/3 h-full bg-[#222831]">
//         <div className="flex items-center h-[25%]">
//           <img src="./logo.svg" alt="logo" className="absolute top-4 left-4 w-16 h-16 mx-4" />
//           <h1 className="text-[#FFD369] font-kreon text-4xl absolute left-1/2 transform -translate-x-1/2">Register</h1>
//         </div>
//         <div className="flex flex-col items-center h-[85%]">
//           {error && <p className="text-red-500">{error}</p>} {/* Error message display */}
//           <form className="flex flex-col items-center justify-center w-2/3" onSubmit={handleRegister}>
//             <div className="w-full flex flex-col justify-between m-2">
//               <label htmlFor="username" className="text-[#FFD369] font-kreon text-base ml-4">Username</label>
//               <input 
//                 type="text" 
//                 id="username" 
//                 className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
//                 value={username}
//                 placeholder="Username here"
//                 onChange={(e) => setUsername(e.target.value)} 
//                 required 
//               />
//             </div>
//             <div className="w-full flex flex-col justify-between m-2">
//               <label htmlFor="email" className="text-[#FFD369] font-kreon text-base ml-4">Email</label>
//               <input 
//                 type="email" 
//                 id="email" 
//                 className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
//                 value={email}
//                 placeholder="Email here"
//                 onChange={(e) => setEmail(e.target.value)} 
//                 required 
//               />
//             </div>
//             <div className="w-full flex flex-col justify-between m-2">
//               <label htmlFor="password" className="text-[#FFD369] font-kreon text-base ml-4">Password</label>
//               <input 
//                 type="password" 
//                 id="password" 
//                 className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
//                 value={password}
//                 placeholder="Password here"
//                 onChange={(e) => setPassword(e.target.value)} 
//                 required 
//               />
//             </div>
//             <div className="w-full flex flex-col justify-between m-2">
//               <label htmlFor="password2" className="text-[#FFD369] font-kreon text-base ml-4">Confirm Password</label>
//               <input 
//                 type="password" 
//                 id="password2" 
//                 className="p-2 m-4 mt-0 rounded-2xl bg-[#393E46] text-white border-custom" 
//                 value={password2}
//                 placeholder="Confirm password here"
//                 onChange={(e) => setPassword2(e.target.value)} 
//                 required 
//               />
//             </div>
//             <button className="w-1/2 p-2 m-4 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg" type="submit">Register</button>
//           </form>
//         </div>
//       </div> 
//     </div>
//   );
// };

// export default Register;
