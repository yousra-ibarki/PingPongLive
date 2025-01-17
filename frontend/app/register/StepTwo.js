import React, { useState } from "react";
import { LiaUploadSolid } from "react-icons/lia";
import toast from "react-hot-toast";

const StepTwo = ({
  userData,
  setUserData,
  errors,
  loading,
  onRegister,
  onBack,
  onClose,
}) => {
  const [imageError, setImageError] = useState("");
  
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const avatarImages = [
    "defaultAv_1.jpg",
    "defaultAv_2.jpg",
    "defaultAv_3.jpg",
  ];

  const validateImage = (file) => {
    setImageError("");
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError("Image size must be less than 900KB");
      toast.error("Image size must be less than 900KB");
      return false;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPG, PNG, GIF, or WebP)");
      toast.error("Invalid image format");
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImage(file)) {
      e.target.value = ''; // Clear the input
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData(prev => ({
        ...prev,
        avatar: reader.result,
        selectedAvatar: null
      }));
      setImageError(""); // Clear any previous errors
    };

    reader.onerror = () => {
      setImageError("Error reading file");
      toast.error("Error reading file");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-lg bg-[#393E46] p-2 rounded-lg shadow-lg flex flex-col justify-center items-center border border-[#FFD369]">
      <div className="w-full h-8 flex justify-end items-center">
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 text-4xl"
          aria-label="Close"
        >
          &times;
        </button>
      </div>
      <h1 className="text-[#FFD369] font-kreon text-3xl text-center mb-6">
        Choose Avatar and Language
      </h1>
      
      {/* Display errors */}
      {(errors.general || imageError) && (
        <p className="text-red-500 text-center mb-4">
          {errors.general || imageError}
        </p>
      )}

      <form
        className="w-full h-[550px] flex flex-col gap-6 items-center justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          onRegister();
        }}
      >
        <div className="flex h-[150px] items-center justify-evenly gap-4 w-full">
          {avatarImages.map((img, index) => (
            <img
              key={index}
              src={`/avatars/${img}`}
              alt={`Avatar ${index}`}
              className={`w-24 h-24 rounded-full cursor-pointer hover:shadow-xl hover:scale-105 ${
                userData.selectedAvatar === img ? "border-2 border-[#FFD369]" : ""
              }`}
              onClick={() => {
                setUserData((prev) => ({
                  ...prev,
                  selectedAvatar: img,
                  avatar: null,
                }));
                setImageError(""); // Clear any previous errors
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 w-full">
          <label
            htmlFor="fileInput"
            className="flex h-10 items-center justify-center gap-2 cursor-pointer text-[#FFD369] 
                      bg-blue_dark rounded-full w-[50%] text-lg hover:bg-[#FFD369] hover:text-blue_dark transition duration-300"
          >
            <LiaUploadSolid />
            <span>Upload An Avatar</span>
            <input
              type="file"
              id="fileInput"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          
          {/* File requirements helper text */}
          <span className="text-xs text-gray-300">
            Max size: 900KB. Allowed formats: JPG, PNG, GIF, WEBP
          </span>
        </div>

        {userData.avatar && (
          <div className="relative">
            <img
              src={userData.avatar}
              alt="Uploaded Avatar"
              className="w-16 h-16 rounded-full border border-[#FFD369]"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              onClick={() => {
                setUserData((prev) => ({ ...prev, avatar: null }));
                setImageError("");
              }}
            >
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!imageError}
          className={`w-[40%] py-2 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg transition duration-300 
            ${loading || !!imageError ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e6bf56]'}`}
        >
          {loading ? (
            <div className="loader w-6 h-6 border-2 border-t-[#222831] rounded-full animate-spin mx-auto"></div>
          ) : (
            "Finish"
          )}
        </button>
        
        <button
          type="button"
          onClick={onBack}
          className="text-[#FFD369] font-kreon text-lg hover:underline"
        >
          Back
        </button>
      </form>
    </div>
  );
};

export default StepTwo;