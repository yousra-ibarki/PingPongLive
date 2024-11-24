import React from "react";
import { LiaUploadSolid } from "react-icons/lia";

const StepTwo = ({ userData, setUserData, error, onRegister, loading }) => {
  const avatarImages = [
    "defaultAv_1.jpg",
    "defaultAv_2.jpg",
    "defaultAv_3.jpg",
  ];
  const languages = [
    { code: "en", label: "English", flag: "/flags/en.png" },
    { code: "fr", label: "French", flag: "/flags/fr.png" },
    { code: "de", label: "German", flag: "/flags/de.png" },
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUserData((prev) => ({
        ...prev,
        avatar: reader.result,
        selectedAvatar: null,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full h-[90%] flex flex-row justify-center">
      <div className="w-full h-full bg-[#222831]">
        <h1 className="text-[#FFD369] font-kreon text-4xl text-center mt-8">
          Choose Avatar and Language
        </h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="h-full w-full flex flex-col items-center mt-8">
          <div className="flex justify-evenly">
            {avatarImages.map((img, index) => (
              <img
                key={index}
                src={`/avatars/${img}`}
                alt={`Avatar ${index}`}
                className={`w-28 h-28 rounded-full cursor-pointer ${
                  userData.selectedAvatar === img
                    ? "border border-[#FFD369]"
                    : ""
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
            className="flex items-center cursor-pointer mt-4"
          >
            <LiaUploadSolid className="text-white" />
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <div className="flex flex-wrap mt-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() =>
                  setUserData((prev) => ({ ...prev, language: lang.code }))
                }
                className={`cursor-pointer p-4 m-2 ${
                  userData.language === lang.code
                    ? "bg-[#FFD369]"
                    : "bg-[#393E46]"
                } rounded-lg`}
              >
                <img
                  src={lang.flag}
                  alt={lang.label}
                  className="w-8 h-8 mx-auto"
                />
                <p className="text-white text-center">{lang.label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onRegister}
            className="mt-4 bg-[#FFD369] p-2 rounded-lg text-[#222831]"
          >
            {loading ? "Loading..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
