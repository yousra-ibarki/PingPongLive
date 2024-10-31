import { FaCamera } from "react-icons/fa"; // Import camera icon from react-icons/fa
import { useState } from "react";

const ProfilePicture = () => {
  const [image, setImage] = useState(
    "https://avatars.githubusercontent.com/u/774101?v=4"
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-evenly lg:h-[35%] h-[30%] space-y-4 lg:space-y-0">
      <div className=" relative flex flex-col items-center p-1 transition-transform transform hover:-translate-y-1 hover:scale-105 duration-300 ease-in-out">
        <img
          src={image}
          alt="profile-pic"
          className="rounded-full cursor-pointer border-4 border-[#FFD369] shadow-lg transition-shadow duration-300 hover:shadow-2xl"
        />
        <div className="absolute bottom-0 right-0 transform -translate-x-1/2 flex items-center">
          <label
            htmlFor="fileInput"
            className="bg-[#393E46] text-white rounded-full p-2 cursor-pointer border border-[#FFD369] flex items-center justify-center transition-colors duration-300 hover:bg-[#FFD369] hover:text-[#393E46]"
          >
            <FaCamera />
          </label>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>
      {/* Show user info (username and email) */}
      <div className="flex flex-col w-full lg:w-auto p-2 items-center text-center">
        <span className="text-[#FFD369] lg:p-4 text-2xl lg:text-3xl font-bold">
          username
        </span>
        <span className="text-[#FFD369] lg:p-4 text-lg lg:text-xl">
          example@email.com
        </span>
      </div>
    </div>
  );
};

export default ProfilePicture;
