import React from "react";
import { LiaUploadSolid } from "react-icons/lia";

const StepTwo = ({
  userData,
  setUserData,
  errors,
  loading,
  onRegister,
  onBack,
  onClose,
}) => {
  const avatarImages = [
    "defaultAv_1.jpg",
    "defaultAv_2.jpg",
    "defaultAv_3.jpg",
  ];
  const languages = [
    { code: "fr", label: "French", flag: "/flags/fr.png" },
    { code: "en", label: "English", flag: "/flags/en.png" },
    { code: "de", label: "German", flag: "/flags/de.png" },
  ];

  const validateImageFormat = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ general: "Please upload a valid image file (JPG, PNG, GIF, or WebP)" });
      return;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImageFormat(file)) {
        setErrors({ general: "Please upload a valid image file (JPG, PNG, GIF, or WebP)" });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData(prev => ({
          ...prev,
          avatar: reader.result,
          selectedAvatar: null
        }));
      };
      reader.readAsDataURL(file);
    }
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
      {errors.general && (
        <p className="text-red-500 text-center mb-4">{errors.general}</p>
      )}
      <form
        className="w-full h-[500px] flex flex-col gap-6 items-center justify-center"
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
              onClick={() =>
                setUserData((prev) => ({
                  ...prev,
                  selectedAvatar: img,
                  avatar: null,
                }))
              }
            />
          ))}
        </div>
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
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </label>
        {userData.avatar && (
          <img
            src={userData.avatar}
            alt="Uploaded Avatar"
            className="w-16 h-16 rounded-full border border-[#FFD369]"
          />
        )}
        <div className="flex h-[100px] flex-wrap justify-center gap-4">
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() =>
                setUserData((prev) => ({ ...prev, language: lang.code }))
              }
              className={`cursor-pointer p-4 rounded-lg text-center text-white ${
                userData.language === lang.code ? "bg-[#FFD369] bg-opacity-50 " : "bg-[#393E46] "
              }`}
            >
              <img
                src={lang.flag}
                alt={lang.label}
                className="w-6 h-6 mx-auto mb-1"
              />
              <span>{lang.label}</span>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-[40%] py-2 bg-[#FFD369] text-[#222831] font-kreon text-lg rounded-lg hover:bg-[#e6bf56] transition duration-300"
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
          {"Back"}
        </button>
      </form>
    </div>
  );
};

export default StepTwo;